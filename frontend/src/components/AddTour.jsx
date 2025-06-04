import React, { useState } from 'react';
import axios from '../api';
import Swal from 'sweetalert2';

function AddTour() {
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        categoryType: '',
        country: '',
        tourType: '',
        pricePerHead: '',
        GST: '',
        duration: '',
        occupancy: '',
        remainingOccupancy: '',
        startDate: '',
        description: '',
        highlights: [''],
        inclusions: [''],
        exclusions: [''],
        thingsToPack: [''],
        itinerary: [{ dayNumber: 1, title: '', description: '', activities: [{ type: '', title: '', description: '', time: '' }] }],
        gallery: [], 
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
            setErrors({ ...errors, image: '' }); 
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setErrors({ ...errors, [name]: '' });
    };

    const handleGalleryImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, gallery: [...formData.gallery, ...files] });
        setErrors({ ...errors, gallery: '' });
    };

    const removeGalleryImage = (indexToRemove) => {
        setFormData({
            ...formData,
            gallery: formData.gallery.filter((_, index) => index !== indexToRemove)
        });
    };

    // Handlers for dynamic array fields (highlights, inclusions, etc.)
    const handleArrayChange = (e, index, fieldName) => {
        const { value } = e.target;
        const newArray = [...formData[fieldName]];
        newArray[index] = value;
        setFormData({ ...formData, [fieldName]: newArray });
    };

    const addArrayItem = (fieldName) => {
        setFormData({ ...formData, [fieldName]: [...formData[fieldName], ''] });
    };

    const removeArrayItem = (index, fieldName) => {
        const newArray = formData[fieldName].filter((_, i) => i !== index);
        setFormData({ ...formData, [fieldName]: newArray });
    };

    // Handlers for Itinerary
    const handleItineraryChange = (e, dayIndex, fieldName) => {
        const { value } = e.target;
        const newItinerary = [...formData.itinerary];
        newItinerary[dayIndex] = { ...newItinerary[dayIndex], [fieldName]: value };
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const addItineraryDay = () => {
        setFormData({
            ...formData,
            itinerary: [
                ...formData.itinerary,
                { dayNumber: formData.itinerary.length + 1, title: '', description: '', activities: [{ type: '', title: '', description: '', time: '' }] }
            ]
        });
    };

    const removeItineraryDay = (dayIndex) => {
        const newItinerary = formData.itinerary.filter((_, i) => i !== dayIndex);
        setFormData({ ...formData, itinerary: newItinerary.map((day, idx) => ({ ...day, dayNumber: idx + 1 })) });
    };

    // Handlers for Activities within Itinerary
    const handleActivityChange = (e, dayIndex, activityIndex, fieldName) => {
        const { value } = e.target;
        const newItinerary = [...formData.itinerary];
        const newActivities = [...newItinerary[dayIndex].activities];
        newActivities[activityIndex] = { ...newActivities[activityIndex], [fieldName]: value };
        newItinerary[dayIndex] = { ...newItinerary[dayIndex], activities: newActivities };
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const addActivity = (dayIndex) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[dayIndex] = {
            ...newItinerary[dayIndex],
            activities: [...newItinerary[dayIndex].activities, { type: '', title: '', description: '', time: '' }]
        };
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const removeActivity = (dayIndex, activityIndex) => {
        const newItinerary = [...formData.itinerary];
        const newActivities = newItinerary[dayIndex].activities.filter((_, i) => i !== activityIndex);
        newItinerary[dayIndex] = { ...newItinerary[dayIndex], activities: newActivities };
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Tour name is required.';
        if (!formData.categoryType) newErrors.categoryType = 'Category is required.';
        if (!formData.country) newErrors.country = 'Country is required.';
        if (!formData.pricePerHead) newErrors.pricePerHead = 'Price per head is required.';
        if (!formData.GST) newErrors.GST = 'GST% is required.';
        if (!formData.duration) newErrors.duration = 'Duration is required.';
        if (!formData.startDate) newErrors.startDate = 'Start date is required.';
        if (!formData.occupancy) newErrors.occupancy = 'Occupancy is required.';
        if (!formData.tourType) newErrors.tourType = 'Tour Type is required.';
        if (!formData.description) newErrors.description = 'Description is required.';
        if (!formData.image) newErrors.image = 'Main tour image is required.';
        if (formData.gallery.length === 0) newErrors.gallery = 'At least one gallery image is required.';

        // Basic validation for highlights, inclusions, etc. to not be entirely empty if added
        ['highlights', 'inclusions', 'exclusions', 'thingsToPack'].forEach(field => {
            if (formData[field].some(item => !item.trim())) {
                newErrors[field] = `Please fill all ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} fields or remove empty ones.`;
            }
        });

        // Itinerary validation
        formData.itinerary.forEach((day, dayIndex) => {
            if (!day.title.trim()) newErrors[`itinerary[${dayIndex}].title`] = `Day ${day.dayNumber} title is required.`;
            day.activities.forEach((activity, activityIndex) => {
                if (!activity.type.trim()) newErrors[`itinerary[${dayIndex}].activities[${activityIndex}].type`] = `Day ${day.dayNumber} activity ${activityIndex + 1} type is required.`;
                if (!activity.title.trim()) newErrors[`itinerary[${dayIndex}].activities[${activityIndex}].title`] = `Day ${day.dayNumber} activity ${activityIndex + 1} title is required.`
            });
        });

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            Swal.fire({
                icon: 'error',
                title: 'Validation Error!',
                html: Object.values(validationErrors).map(err => `<li>${err}</li>`).join(''),
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
            });
            return;
        }

        const token = localStorage.getItem('Token');
        const role = localStorage.getItem('role');

        const form = new FormData();
        form.append('name', formData.name);
        form.append('categoryType', formData.categoryType);
        form.append('country', formData.country);
        form.append('tourType', formData.tourType);
        form.append('pricePerHead', formData.pricePerHead);
        form.append('GST', formData.GST);
        form.append('duration', formData.duration);
        form.append('occupancy', formData.occupancy);
        form.append('remainingOccupancy', formData.occupancy);
        form.append('startDate', formData.startDate);
        form.append('description', formData.description);

        formData.highlights.forEach(highlight => form.append('highlights[]', highlight));
        formData.inclusions.forEach(inclusion => form.append('inclusions[]', inclusion));
        formData.exclusions.forEach(exclusion => form.append('exclusions[]', exclusion));
        formData.thingsToPack.forEach(item => form.append('thingsToPack[]', item));

        // Append itinerary as a JSON string
        form.append('itinerary', JSON.stringify(formData.itinerary));

        // Append the main image file
        if (formData.image) {
            form.append('image', formData.image);
        }

        // Append gallery image files
        formData.gallery.forEach((file, index) => {
            form.append(`galleryImages`, file);
        });


        try {
            const res = await axios.post('/api/admin/tours', form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Role: role,
                    'Content-Type': 'multipart/form-data', 
                },
            });

            Swal.fire({
                icon: 'success',
                title: 'Tour Added Successfully!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            // Reset form fields
            setFormData({
                name: '',
                image: null,
                categoryType: '',
                country: '',
                tourType: '',
                pricePerHead: '',
                GST: '',
                duration: '',
                occupancy: '',
                startDate: '',
                description: '',
                highlights: [''],
                inclusions: [''],
                exclusions: [''],
                thingsToPack: [''],
                itinerary: [{ dayNumber: 1, title: '', description: '', activities: [{ type: '', title: '', description: '', time: '' }] }],
                gallery: [],
            });
            setErrors({}); // Clear all errors
        } catch (err) {
            console.error('Error submitting tour:', err);
            Swal.fire({
                icon: 'error',
                title: err?.response?.data?.message || 'Something went wrong.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    return (
        <>
            <main className="p-6">
                <h2 className="text-2xl font-bold mb-4">Add New Tour</h2>
                <section className="min-h-screen text-white">
                    <div className="mx-auto bg-white rounded-2xl shadow-xl p-6 text-gray-800 border border-gray-200">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Tour Category */}
                            <div>
                                <label className="block font-medium mb-1">Tour Category</label>
                                <select
                                    name="categoryType"
                                    value={formData.categoryType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Low Budget Tour">Low Budget Tour</option>
                                    <option value="Standard Tour">Standard Tour</option>
                                    <option value="Premium Tour">Premium Tour</option>
                                </select>
                                {errors.categoryType && <p className="text-red-500 text-sm">{errors.categoryType}</p>}
                            </div>

                            {/* Tour Name */}
                            <div>
                                <label className="block font-medium mb-1">Tour Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Majestic Himalayas Adventure"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block font-medium mb-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g., India"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                            </div>

                            {/* PricePerHead */}
                            <div>
                                <label className="block font-medium mb-1">Price Per Head (₹)</label>
                                <input
                                    type="number"
                                    name="pricePerHead"
                                    value={formData.pricePerHead}
                                    onChange={handleChange}
                                    placeholder="e.g., 24999"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.pricePerHead && <p className="text-red-500 text-sm">{errors.pricePerHead}</p>}
                            </div>

                            {/* GST */}
                            <div>
                                <label className="block font-medium mb-1">GST (%)</label>
                                <input
                                    type="number"
                                    name="GST"
                                    value={formData.GST}
                                    onChange={handleChange}
                                    placeholder="e.g., 10"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.GST && <p className="text-red-500 text-sm">{errors.GST}</p>}
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block font-medium mb-1">Duration (Days)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 7"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
                            </div>

                            {/* Occupancy */}
                            <div>
                                <label className="block font-medium mb-1">Occupancy (Total People)</label>
                                <input
                                    type="number"
                                    name="occupancy"
                                    value={formData.occupancy}
                                    onChange={handleChange}
                                    placeholder="e.g., 20"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.occupancy && <p className="text-red-500 text-sm">{errors.occupancy}</p>}
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
                            </div>

                            {/* Tour Type */}
                            <div>
                                <label className="block font-medium mb-1">Tour Type</label>
                                <select
                                    name="tourType"
                                    value={formData.tourType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                >
                                    <option value="">Select Tour Type</option>
                                    <option value="Leisure Tour">Leisure Tour</option>
                                    <option value="Religious Tour">Religious Tour</option>
                                    <option value="Rural Tour">Rural Tour</option>
                                    <option value="Heritage Tour">Heritage Tour</option>
                                    <option value="Nursery Tour">Nursery Tour</option>
                                    <option value="Eco Tour">Eco Tour</option>
                                    <option value="Dark Tour">Dark Tour</option>
                                    <option value="Food Tour">Food Tour</option>
                                    <option value="Business Tour">Business Tour</option>
                                </select>
                                {errors.tourType && <p className="text-red-500 text-sm">{errors.tourType}</p>}
                            </div>

                            {/* Tour Image (Main) */}
                            <div className="w-full col-span-2">
                                <label className="block font-medium mb-1">Main Tour Image</label>
                                <input
                                    type="file"
                                    accept='image/*'
                                    name="image"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                {formData.image && (
                                    <div className="mt-2">
                                        <img
                                            src={URL.createObjectURL(formData.image)}
                                            alt="Selected Main Tour"
                                            className="mt-2 w-[150px] h-[100px] object-cover rounded-md border"
                                        />
                                    </div>
                                )}
                                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Experience the breathtaking beauty..."
                                    className="w-full border border-gray-300 rounded-md p-2"
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                            </div>

                            {/* Highlights */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Highlights</label>
                                {formData.highlights.map((highlight, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={highlight}
                                            onChange={(e) => handleArrayChange(e, index, 'highlights')}
                                            placeholder="e.g., Trek to scenic viewpoints"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2"
                                        />
                                        {formData.highlights.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'highlights')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('highlights')}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
                                >
                                    Add Highlight
                                </button>
                                {errors.highlights && <p className="text-red-500 text-sm">{errors.highlights}</p>}
                            </div>

                            {/* Inclusions */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Inclusions</label>
                                {formData.inclusions.map((inclusion, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={inclusion}
                                            onChange={(e) => handleArrayChange(e, index, 'inclusions')}
                                            placeholder="e.g., Accommodation"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2"
                                        />
                                        {formData.inclusions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'inclusions')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('inclusions')}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
                                >
                                    Add Inclusion
                                </button>
                                {errors.inclusions && <p className="text-red-500 text-sm">{errors.inclusions}</p>}
                            </div>

                            {/* Exclusions */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Exclusions</label>
                                {formData.exclusions.map((exclusion, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={exclusion}
                                            onChange={(e) => handleArrayChange(e, index, 'exclusions')}
                                            placeholder="e.g., Airfare"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2"
                                        />
                                        {formData.exclusions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'exclusions')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('exclusions')}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
                                >
                                    Add Exclusion
                                </button>
                                {errors.exclusions && <p className="text-red-500 text-sm">{errors.exclusions}</p>}
                            </div>

                            {/* Things To Pack */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Things To Pack</label>
                                {formData.thingsToPack.map((item, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleArrayChange(e, index, 'thingsToPack')}
                                            placeholder="e.g., Warm clothes"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2"
                                        />
                                        {formData.thingsToPack.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'thingsToPack')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('thingsToPack')}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
                                >
                                    Add Item
                                </button>
                                {errors.thingsToPack && <p className="text-red-500 text-sm">{errors.thingsToPack}</p>}
                            </div>

                            {/* Gallery Images (now accepts multiple files) */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Gallery Images</label>
                                <input
                                    type="file"
                                    accept='image/*'
                                    multiple // Allow multiple file selection
                                    onChange={handleGalleryImageChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.gallery.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Gallery ${index}`}
                                                className="w-24 h-24 object-cover rounded-md border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                title="Remove image"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.gallery && <p className="text-red-500 text-sm">{errors.gallery}</p>}
                            </div>

                            {/* Itinerary Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-3 mt-4">Itinerary</h3>
                                {formData.itinerary.map((day, dayIndex) => (
                                    <div key={dayIndex} className="border border-gray-300 p-4 rounded-md mb-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-lg font-medium">Day {day.dayNumber}</h4>
                                            {formData.itinerary.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItineraryDay(dayIndex)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                                >
                                                    Remove Day
                                                </button>
                                            )}
                                        </div>
                                        <div className="mb-2">
                                            <label className="block font-medium mb-1">Day Title</label>
                                            <input
                                                type="text"
                                                value={day.title}
                                                onChange={(e) => handleItineraryChange(e, dayIndex, 'title')}
                                                placeholder="e.g., Arrival & Acclimatization"
                                                className="w-full border border-gray-300 rounded-md p-2"
                                            />
                                            {errors[`itinerary[${dayIndex}].title`] && <p className="text-red-500 text-sm">{errors[`itinerary[${dayIndex}].title`]}</p>}
                                        </div>
                                        <div className="mb-2">
                                            <label className="block font-medium mb-1">Day Description</label>
                                            <textarea
                                                value={day.description}
                                                onChange={(e) => handleItineraryChange(e, dayIndex, 'description')}
                                                rows={2}
                                                placeholder="Arrive at the base city..."
                                                className="w-full border border-gray-300 rounded-md p-2"
                                            ></textarea>
                                        </div>

                                        <h5 className="font-medium mt-3 mb-2">Activities for Day {day.dayNumber}</h5>
                                        {day.activities.map((activity, activityIndex) => (
                                            <div key={activityIndex} className="border border-gray-200 p-3 rounded-md mb-2 bg-white">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h6 className="font-medium">Activity {activityIndex + 1}</h6>
                                                    {day.activities.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeActivity(dayIndex, activityIndex)}
                                                            className="bg-red-400 text-white px-2 py-0.5 rounded-md text-sm hover:bg-red-500"
                                                        >
                                                            Remove Activity
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium mb-1">Type</label>
                                                    <input
                                                        type="text"
                                                        value={activity.type}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'type')}
                                                        placeholder="e.g., travel, hiking, meal"
                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                    />
                                                    {errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`] && <p className="text-red-500 text-sm">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`]}</p>}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={activity.title}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'title')}
                                                        placeholder="e.g., Airport Pickup"
                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                    />
                                                    {errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`] && <p className="text-red-500 text-sm">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`]}</p>}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={activity.description}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'description')}
                                                        placeholder="e.g., Transfer from airport to hotel."
                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Time (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={activity.time}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'time')}
                                                        placeholder="e.g., 10:00 AM"
                                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addActivity(dayIndex)}
                                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 mt-2 text-sm"
                                        >
                                            Add Activity
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addItineraryDay}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 mt-2"
                                >
                                    Add New Day to Itinerary
                                </button>
                            </div>

                            {/* Submit Button */}
                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
                                >
                                    Add Tour
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}

export default AddTour;