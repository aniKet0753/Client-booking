import React, { useState } from 'react';
import axios from '../api';
import Swal from 'sweetalert2';
import { FiPlus, FiTrash2, FiUpload, FiImage, FiCalendar, FiMapPin, FiDollarSign, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import { FaMountain, FaHotel, FaUtensils, FaBus, FaHiking } from 'react-icons/fa';

function AddTour() {
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        categoryType: '',
        country: '',
        tourType: '',
        pricePerHead: '',
        childRate: '',
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
        if (!formData.childRate) newErrors.childRate = 'Child rate is required.';
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
        form.append('childRate', formData.childRate);
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
                childRate: '',
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
            <main className="p-6 bg-gray-50 min-h-screen">
                <div className="mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                        <FaMountain className="mr-2 text-indigo-600" /> Add New Tour
                    </h2>

                    <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                            {/* Basic Information Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                    <FiInfo className="mr-2 text-indigo-600" /> Basic Information
                                </h3>
                            </div>

                            {/* Tour Category */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Tour Category</label>
                                <div className="relative">
                                    <select
                                        name="categoryType"
                                        value={formData.categoryType}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Low Budget Tour">Low Budget Tour</option>
                                        <option value="Standard Tour">Standard Tour</option>
                                        <option value="Premium Tour">Premium Tour</option>
                                    </select>
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FiInfo />
                                    </div>
                                </div>
                                {errors.categoryType && <p className="text-red-500 text-sm mt-1">{errors.categoryType}</p>}
                            </div>

                            {/* Tour Name */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Tour Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Majestic Himalayas Adventure"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FaMountain />
                                    </div>
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Country */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Country</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="e.g., India"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FiMapPin />
                                    </div>
                                </div>
                                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                            </div>

                            {/* PricePerHead */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Price Per Head(Adult Rate) (₹)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="pricePerHead"
                                        value={formData.pricePerHead}
                                        onChange={handleChange}
                                        placeholder="e.g., 24999"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        {/* <FiDollarSign /> */}
                                    </div>
                                </div>
                                {errors.pricePerHead && <p className="text-red-500 text-sm mt-1">{errors.pricePerHead}</p>}
                            </div>

                            {/* Child Rate */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Child Rate (₹)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="childRate"
                                        value={formData.childRate}
                                        onChange={handleChange}
                                        placeholder="e.g., 14999"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        {/* <FiDollarSign /> */}
                                    </div>
                                </div>
                                {errors.childRate && <p className="text-red-500 text-sm mt-1">{errors.childRate}</p>}
                            </div>

                            {/* GST */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">GST (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="GST"
                                        value={formData.GST}
                                        onChange={handleChange}
                                        placeholder="e.g., 10"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        {/* <FiDollarSign /> */}
                                    </div>
                                </div>
                                {errors.GST && <p className="text-red-500 text-sm mt-1">{errors.GST}</p>}
                            </div>

                            {/* Duration */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Duration (Days)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        placeholder="e.g., 7"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FiCalendar />
                                    </div>
                                </div>
                                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                            </div>

                            {/* Occupancy */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Occupancy (Total People)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="occupancy"
                                        value={formData.occupancy}
                                        onChange={handleChange}
                                        placeholder="e.g., 20"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FiInfo />
                                    </div>
                                </div>
                                {errors.occupancy && <p className="text-red-500 text-sm mt-1">{errors.occupancy}</p>}
                            </div>

                            {/* Start Date */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Start Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FiCalendar />
                                    </div>
                                </div>
                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                            </div>

                            {/* Tour Type */}
                            <div className="space-y-1">
                                <label className="block font-medium text-gray-700">Tour Type</label>
                                <div className="relative">
                                    <select
                                        name="tourType"
                                        value={formData.tourType}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
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
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <FiInfo />
                                    </div>
                                </div>
                                {errors.tourType && <p className="text-red-500 text-sm mt-1">{errors.tourType}</p>}
                            </div>

                            {/* Images Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                    <FiImage className="mr-2 text-indigo-600" /> Images
                                </h3>
                            </div>

                            {/* Tour Image (Main) */}
                            <div className="w-full col-span-2 space-y-1">
                                <label className="block font-medium text-gray-700">Main Tour Image</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiUpload className="w-8 h-8 mb-3 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept='image/*'
                                            name="image"
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {formData.image && (
                                    <div className="mt-4">
                                        <div className="relative inline-block">
                                            <img
                                                src={URL.createObjectURL(formData.image)}
                                                alt="Selected Main Tour"
                                                className="mt-2 w-40 h-28 object-cover rounded-md border shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: null })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                            </div>

                            {/* Gallery Images */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="block font-medium text-gray-700">Gallery Images</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiImage className="w-8 h-8 mb-3 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB each)</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept='image/*'
                                            multiple
                                            onChange={handleGalleryImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-4">
                                    {formData.gallery.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Gallery ${index}`}
                                                className="w-32 h-24 object-cover rounded-md border shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                                                title="Remove image"
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.gallery && <p className="text-red-500 text-sm mt-1">{errors.gallery}</p>}
                            </div>

                            {/* Description Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                    <FiInfo className="mr-2 text-indigo-600" /> Description
                                </h3>
                                <div className="space-y-1">
                                    <label className="block font-medium text-gray-700">Tour Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Experience the breathtaking beauty..."
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    ></textarea>
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>
                            </div>

                            {/* Highlights Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                    <FiCheck className="mr-2 text-indigo-600" /> Highlights
                                </h3>
                                <div className="space-y-3">
                                    {formData.highlights.map((highlight, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <div className="flex-grow flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                                                <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                                                    {index + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={highlight}
                                                    onChange={(e) => handleArrayChange(e, index, 'highlights')}
                                                    placeholder="e.g., Trek to scenic viewpoints"
                                                    className="flex-grow bg-transparent outline-none"
                                                />
                                            </div>
                                            {formData.highlights.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(index, 'highlights')}
                                                    className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                    title="Remove highlight"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('highlights')}
                                        className="flex items-center text-indigo-600 hover:text-indigo-800 mt-2"
                                    >
                                        <FiPlus className="mr-1" /> Add Highlight
                                    </button>
                                    {errors.highlights && <p className="text-red-500 text-sm mt-1">{errors.highlights}</p>}
                                </div>
                            </div>

                            {/* Inclusions & Exclusions Section */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Inclusions */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                        <FiCheck className="mr-2 text-green-600" /> Inclusions
                                    </h3>
                                    <div className="space-y-3">
                                        {formData.inclusions.map((inclusion, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <div className="flex-grow flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                                                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={inclusion}
                                                        onChange={(e) => handleArrayChange(e, index, 'inclusions')}
                                                        placeholder="e.g., Accommodation"
                                                        className="flex-grow bg-transparent outline-none"
                                                    />
                                                </div>
                                                {formData.inclusions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem(index, 'inclusions')}
                                                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                        title="Remove inclusion"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('inclusions')}
                                            className="flex items-center text-green-600 hover:text-green-800 mt-2"
                                        >
                                            <FiPlus className="mr-1" /> Add Inclusion
                                        </button>
                                        {errors.inclusions && <p className="text-red-500 text-sm mt-1">{errors.inclusions}</p>}
                                    </div>
                                </div>

                                {/* Exclusions */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                        <FiX className="mr-2 text-red-600" /> Exclusions
                                    </h3>
                                    <div className="space-y-3">
                                        {formData.exclusions.map((exclusion, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <div className="flex-grow flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                                                    <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={exclusion}
                                                        onChange={(e) => handleArrayChange(e, index, 'exclusions')}
                                                        placeholder="e.g., Airfare"
                                                        className="flex-grow bg-transparent outline-none"
                                                    />
                                                </div>
                                                {formData.exclusions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem(index, 'exclusions')}
                                                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                        title="Remove exclusion"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('exclusions')}
                                            className="flex items-center text-red-600 hover:text-red-800 mt-2"
                                        >
                                            <FiPlus className="mr-1" /> Add Exclusion
                                        </button>
                                        {errors.exclusions && <p className="text-red-500 text-sm mt-1">{errors.exclusions}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Things To Pack Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                    <FaHiking className="mr-2 text-indigo-600" /> Things To Pack
                                </h3>
                                <div className="space-y-3">
                                    {formData.thingsToPack.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <div className="flex-grow flex items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                                                <span className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                                                    {index + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => handleArrayChange(e, index, 'thingsToPack')}
                                                    placeholder="e.g., Warm clothes"
                                                    className="flex-grow bg-transparent outline-none"
                                                />
                                            </div>
                                            {formData.thingsToPack.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(index, 'thingsToPack')}
                                                    className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                    title="Remove item"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('thingsToPack')}
                                        className="flex items-center text-indigo-600 hover:text-indigo-800 mt-2"
                                    >
                                        <FiPlus className="mr-1" /> Add Item
                                    </button>
                                    {errors.thingsToPack && <p className="text-red-500 text-sm mt-1">{errors.thingsToPack}</p>}
                                </div>
                            </div>

                            {/* Itinerary Section */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-700 flex items-center">
                                    <FiMapPin className="mr-2 text-indigo-600" /> Itinerary
                                </h3>

                                {formData.itinerary.map((day, dayIndex) => (
                                    <div key={dayIndex} className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-lg font-medium flex items-center">
                                                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                                    {day.dayNumber}
                                                </span>
                                                Day {day.dayNumber}
                                            </h4>
                                            {formData.itinerary.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItineraryDay(dayIndex)}
                                                    className="flex items-center text-red-500 hover:text-red-700"
                                                >
                                                    <FiTrash2 className="mr-1" /> Remove Day
                                                </button>
                                            )}
                                        </div>

                                        {/* Day Title */}
                                        <div className="mb-4 space-y-1">
                                            <label className="block font-medium text-gray-700">Day Title</label>
                                            <input
                                                type="text"
                                                value={day.title}
                                                onChange={(e) => handleItineraryChange(e, dayIndex, 'title')}
                                                placeholder="e.g., Arrival & Acclimatization"
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors[`itinerary[${dayIndex}].title`] && <p className="text-red-500 text-sm mt-1">{errors[`itinerary[${dayIndex}].title`]}</p>}
                                        </div>

                                        {/* Day Description */}
                                        <div className="mb-4 space-y-1">
                                            <label className="block font-medium text-gray-700">Day Description</label>
                                            <textarea
                                                value={day.description}
                                                onChange={(e) => handleItineraryChange(e, dayIndex, 'description')}
                                                rows={3}
                                                placeholder="Arrive at the base city..."
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            ></textarea>
                                        </div>

                                        {/* Activities */}
                                        <h5 className="font-medium mt-6 mb-3 text-gray-700">Activities for Day {day.dayNumber}</h5>

                                        {day.activities.map((activity, activityIndex) => (
                                            <div key={activityIndex} className="border border-gray-200 p-4 rounded-lg mb-4 bg-white shadow-xs">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h6 className="font-medium flex items-center">
                                                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                                            {activityIndex + 1}
                                                        </span>
                                                        Activity {activityIndex + 1}
                                                    </h6>
                                                    {day.activities.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeActivity(dayIndex, activityIndex)}
                                                            className="flex items-center text-sm text-red-500 hover:text-red-700"
                                                        >
                                                            <FiTrash2 className="mr-1" /> Remove
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Activity Type */}
                                                <div className="mb-3 space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                                    <div className="relative">
                                                        <select
                                                            value={activity.type}
                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'type')}
                                                            className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none"
                                                        >
                                                            <option value="">Select Activity Type</option>
                                                            <option value="travel">Travel</option>
                                                            <option value="hiking">Hiking</option>
                                                            <option value="meal">Meal</option>
                                                            <option value="sightseeing">Sightseeing</option>
                                                            <option value="check-in">Check-in</option>
                                                            <option value="free-time">Free Time</option>
                                                        </select>
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                                            {activity.type === 'travel' && <FaBus className="text-blue-500" />}
                                                            {activity.type === 'hiking' && <FaHiking className="text-green-500" />}
                                                            {activity.type === 'meal' && <FaUtensils className="text-yellow-500" />}
                                                            {activity.type === 'sightseeing' && <FiMapPin className="text-purple-500" />}
                                                            {activity.type === 'check-in' && <FaHotel className="text-indigo-500" />}
                                                            {!['travel', 'hiking', 'meal', 'sightseeing', 'check-in'].includes(activity.type) && (
                                                                <FiInfo className="text-gray-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    {errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`]}</p>
                                                    )}
                                                </div>

                                                {/* Activity Title */}
                                                <div className="mb-3 space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                                    <input
                                                        type="text"
                                                        value={activity.title}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'title')}
                                                        placeholder="e.g., Airport Pickup"
                                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                    />
                                                    {errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`]}</p>
                                                    )}
                                                </div>

                                                {/* Activity Description */}
                                                <div className="mb-3 space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={activity.description}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'description')}
                                                        placeholder="e.g., Transfer from airport to hotel."
                                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                    />
                                                </div>

                                                {/* Activity Time */}
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700">Time (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={activity.time}
                                                        onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'time')}
                                                        placeholder="e.g., 10:00 AM"
                                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addActivity(dayIndex)}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                                        >
                                            <FiPlus className="mr-1" /> Add Activity
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addItineraryDay}
                                    className="flex items-center justify-center w-full py-3 px-4 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 mt-4"
                                >
                                    <FiPlus className="mr-2" /> Add New Day to Itinerary
                                </button>
                            </div>

                            {/* Submit Button */}
                            <div className="md:col-span-2 flex justify-end pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center shadow-md hover:shadow-lg"
                                >
                                    <FaMountain className="mr-2" /> Add Tour
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </>
    );
}

export default AddTour;