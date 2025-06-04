import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import Swal from 'sweetalert2';

function EditTour() {
    const { tourID } = useParams(); // Get tourID from URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tourID: '',
        name: '',
        image: null, // Holds the File object for new main image upload
        currentImage: '', // Holds the Base64 string (with 'data:image/...' prefix) for current main image display
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
        gallery: [], // Holds File objects for newly selected gallery image uploads
        currentGallery: [], // Holds Base64 strings (with 'data:image/...' prefix) for existing gallery images
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchTourData = async () => {
            try {
                console.log('Fetching tour with ID:', tourID);
                setLoading(true);
                const res = await axios.get(`/api/admin/tours/${tourID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: role,
                    },
                });
                const fetchedTour = res.data.tour;
                console.log('Fetched Tour Data (from backend):', fetchedTour);

                setFormData({
                    tourID: fetchedTour.tourID,
                    name: fetchedTour.name,
                    image: null,
                    currentImage: fetchedTour.image || '',
                    categoryType: fetchedTour.categoryType,
                    country: fetchedTour.country,
                    tourType: fetchedTour.tourType,
                    pricePerHead: fetchedTour.pricePerHead,
                    GST: fetchedTour.GST,
                    duration: fetchedTour.duration,
                    occupancy: fetchedTour.occupancy,
                    remainingOccupancy: fetchedTour.remainingOccupancy,
                    startDate: fetchedTour.startDate ? fetchedTour.startDate.split('T')[0] : '',
                    description: fetchedTour.description,
                    highlights: fetchedTour.highlights?.length > 0 ? fetchedTour.highlights : [''],
                    inclusions: fetchedTour.inclusions?.length > 0 ? fetchedTour.inclusions : [''],
                    exclusions: fetchedTour.exclusions?.length > 0 ? fetchedTour.exclusions : [''],
                    thingsToPack: fetchedTour.thingsToPack?.length > 0 ? fetchedTour.thingsToPack : [''],
                    itinerary: fetchedTour.itinerary?.length > 0 ? fetchedTour.itinerary : [{ dayNumber: 1, title: '', description: '', activities: [{ type: '', title: '', description: '', time: '' }] }],
                    gallery: [],
                    currentGallery: fetchedTour.gallery || [],
                });
            } catch (err) {
                console.error('Error fetching tour data:', err);
                setError(err?.response?.data?.message || 'Error fetching tour data.');
                Swal.fire('Error', err?.response?.data?.message || 'Failed to load tour details.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchTourData();
    }, [tourID, token, role, error]);

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
        setFormData(prevData => ({ ...prevData, gallery: [...prevData.gallery, ...files] }));
        setErrors({ ...errors, gallery: '' });
    };

    const removeNewGalleryImage = (indexToRemove) => {
        setFormData(prevData => ({
            ...prevData,
            gallery: prevData.gallery.filter((_, index) => index !== indexToRemove)
        }));
    };

    const removeCurrentGalleryImage = (indexToRemove) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This image will be removed permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData(prevData => ({
                    ...prevData,
                    currentGallery: prevData.currentGallery.filter((_, index) => index !== indexToRemove)
                }));
                Swal.fire('Removed!', 'Image has been removed from the gallery.', 'success');
            }
        });
    };

    const handleArrayChange = (e, index, fieldName) => {
        const { value } = e.target;
        const newArray = [...formData[fieldName]];
        newArray[index] = value;
        setFormData({ ...formData, [fieldName]: newArray });
        setErrors({ ...errors, [fieldName]: '' });
    };

    const addArrayItem = (fieldName) => {
        setFormData({ ...formData, [fieldName]: [...formData[fieldName], ''] });
    };

    const removeArrayItem = (index, fieldName) => {
        const newArray = formData[fieldName].filter((_, i) => i !== index);
        setFormData({ ...formData, [fieldName]: newArray });
    };

    const handleItineraryChange = (e, dayIndex, fieldName) => {
        const { value } = e.target;
        const newItinerary = [...formData.itinerary];
        newItinerary[dayIndex] = { ...newItinerary[dayIndex], [fieldName]: value };
        setFormData({ ...formData, itinerary: newItinerary });
        setErrors({ ...errors, [`itinerary[${dayIndex}].${fieldName}`]: '' });
    };

    const addItineraryDay = () => {
        setFormData(prevData => ({
            ...prevData,
            itinerary: [
                ...prevData.itinerary,
                { dayNumber: prevData.itinerary.length + 1, title: '', description: '', activities: [{ type: '', title: '', description: '', time: '' }] }
            ]
        }));
    };

    const removeItineraryDay = (dayIndex) => {
        const newItinerary = formData.itinerary.filter((_, i) => i !== dayIndex);
        setFormData({ ...formData, itinerary: newItinerary.map((day, idx) => ({ ...day, dayNumber: idx + 1 })) });
    };

    const handleActivityChange = (e, dayIndex, activityIndex, fieldName) => {
        const { value } = e.target;
        const newItinerary = [...formData.itinerary];
        const newActivities = [...newItinerary[dayIndex].activities];
        newActivities[activityIndex] = { ...newActivities[activityIndex], [fieldName]: value };
        newItinerary[dayIndex] = { ...newItinerary[dayIndex], activities: newActivities };
        setFormData({ ...formData, itinerary: newItinerary });
        setErrors({ ...errors, [`itinerary[${dayIndex}].activities[${activityIndex}].${fieldName}`]: '' });
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
        if (!formData.tourID) newErrors.tourID = 'Tour ID is required.';
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
        if (!formData.image && !formData.currentImage) newErrors.image = 'Main tour image is required.';
        if (formData.gallery.length === 0 && formData.currentGallery.length === 0) newErrors.gallery = 'At least one gallery image is required.';


        ['highlights', 'inclusions', 'exclusions', 'thingsToPack'].forEach(field => {
            if (formData[field].some(item => !item.trim())) {
                newErrors[field] = `Please fill all ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} fields or remove empty ones.`;
            }
        });

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

        const form = new FormData();
        form.append('tourID', formData.tourID);
        form.append('name', formData.name);
        form.append('categoryType', formData.categoryType);
        form.append('country', formData.country);
        form.append('tourType', formData.tourType);
        form.append('pricePerHead', formData.pricePerHead);
        form.append('GST', formData.GST);
        form.append('duration', formData.duration);
        form.append('occupancy', formData.occupancy);
        form.append('remainingOccupancy', formData.remainingOccupancy || formData.occupancy);
        form.append('startDate', formData.startDate);
        form.append('description', formData.description);

        formData.highlights.forEach(highlight => form.append('highlights[]', highlight));
        formData.inclusions.forEach(inclusion => form.append('inclusions[]', inclusion));
        formData.exclusions.forEach(exclusion => form.append('exclusions[]', exclusion));
        formData.thingsToPack.forEach(item => form.append('thingsToPack[]', item));

        form.append('itinerary', JSON.stringify(formData.itinerary));

        if (formData.image) {
            form.append('image', formData.image);
        }

        formData.currentGallery.forEach(imgBase64 => form.append('currentGallery', imgBase64));

        formData.gallery.forEach(file => {
            form.append(`galleryImages`, file);
        });

        try {
            const res = await axios.put(`/api/admin/tours/${tourID}`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Role: role,
                    'Content-Type': 'multipart/form-data',
                },
            });

            Swal.fire({
                icon: 'success',
                title: 'Tour Updated Successfully!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            navigate('/superadmin/dashboard');
        } catch (err) {
            console.error('Error updating tour:', err);
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

    // Function to navigate back to dashboard
    const handleBackToDashboard = () => {
        navigate('/superadmin/dashboard');
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-gray-700">Loading tour data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
    }

    return (
        <>
            <main className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Edit Tour: {formData.name}</h2>
                <section className="text-gray-800">
                    <div className="mx-auto max-w-6xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200"> 
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> 
                            {/* Tour ID */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Tour ID</label>
                                <input
                                    type="text"
                                    name="tourID"
                                    value={formData.tourID}
                                    onChange={handleChange}
                                    placeholder="e.g., TOUR001"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                                    readOnly // Tour ID is not editable
                                />
                                {errors.tourID && <p className="text-red-500 text-sm mt-1">{errors.tourID}</p>}
                            </div>

                            {/* Tour Category */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Tour Category</label>
                                <select
                                    name="categoryType"
                                    value={formData.categoryType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Low Budget Tour">Low Budget Tour</option>
                                    <option value="Standard Tour">Standard Tour</option>
                                    <option value="Premium Tour">Premium Tour</option>
                                </select>
                                {errors.categoryType && <p className="text-red-500 text-sm mt-1">{errors.categoryType}</p>}
                            </div>

                            {/* Tour Name */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Tour Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Majestic Himalayas Adventure"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g., India"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                            </div>

                            {/* PricePerHead */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Price Per Head (₹)</label>
                                <input
                                    type="number"
                                    name="pricePerHead"
                                    value={formData.pricePerHead}
                                    onChange={handleChange}
                                    placeholder="e.g., 24999"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.pricePerHead && <p className="text-red-500 text-sm mt-1">{errors.pricePerHead}</p>}
                            </div>

                            {/* GST */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">GST (%)</label>
                                <input
                                    type="number"
                                    name="GST"
                                    value={formData.GST}
                                    onChange={handleChange}
                                    placeholder="e.g., 10"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.GST && <p className="text-red-500 text-sm mt-1">{errors.GST}</p>}
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Duration (Days)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 7"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                            </div>

                            {/* Occupancy */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Occupancy (Total People)</label>
                                <input
                                    type="number"
                                    name="occupancy"
                                    value={formData.occupancy}
                                    onChange={handleChange}
                                    placeholder="e.g., 20"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.occupancy && <p className="text-red-500 text-sm mt-1">{errors.occupancy}</p>}
                            </div>

                            {/* Remaining Occupancy */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Remaining Occupancy (Optional)</label>
                                <input
                                    type="number"
                                    name="remainingOccupancy"
                                    value={formData.remainingOccupancy}
                                    onChange={handleChange}
                                    placeholder="Defaults to total occupancy"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.remainingOccupancy && <p className="text-red-500 text-sm mt-1">{errors.remainingOccupancy}</p>}
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                            </div>

                            {/* Tour Type */}
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Tour Type</label>
                                <select
                                    name="tourType"
                                    value={formData.tourType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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
                                {errors.tourType && <p className="text-red-500 text-sm mt-1">{errors.tourType}</p>}
                            </div>

                            {/* Tour Image (Main) */}
                            <div className="w-full col-span-1 md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Main Tour Image</label>
                                {formData.currentImage && !formData.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                                        <img
                                            src={formData.currentImage}
                                            alt="Current Main Tour"
                                            className="mt-2 w-36 h-24 object-cover rounded-md border border-gray-300" // Adjusted size for better responsiveness
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept='image/*'
                                    name="image"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 mt-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {formData.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">New Selected Image:</p>
                                        <img
                                            src={URL.createObjectURL(formData.image)}
                                            alt="New Main Tour"
                                            className="mt-2 w-36 h-24 object-cover rounded-md border border-gray-300" // Adjusted size
                                        />
                                    </div>
                                )}
                                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Experience the breathtaking beauty..."
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            {/* Highlights */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Highlights</label>
                                {formData.highlights.map((highlight, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={highlight}
                                            onChange={(e) => handleArrayChange(e, index, 'highlights')}
                                            placeholder="e.g., Trek to scenic viewpoints"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {formData.highlights.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'highlights')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('highlights')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-2 text-sm"
                                >
                                    Add Highlight
                                </button>
                                {errors.highlights && <p className="text-red-500 text-sm mt-1">{errors.highlights}</p>}
                            </div>

                            {/* Inclusions */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Inclusions</label>
                                {formData.inclusions.map((inclusion, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={inclusion}
                                            onChange={(e) => handleArrayChange(e, index, 'inclusions')}
                                            placeholder="e.g., Accommodation"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {formData.inclusions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'inclusions')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('inclusions')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-2 text-sm"
                                >
                                    Add Inclusion
                                </button>
                                {errors.inclusions && <p className="text-red-500 text-sm mt-1">{errors.inclusions}</p>}
                            </div>

                            {/* Exclusions */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Exclusions</label>
                                {formData.exclusions.map((exclusion, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={exclusion}
                                            onChange={(e) => handleArrayChange(e, index, 'exclusions')}
                                            placeholder="e.g., International flights"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {formData.exclusions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'exclusions')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('exclusions')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-2 text-sm"
                                >
                                    Add Exclusion
                                </button>
                                {errors.exclusions && <p className="text-red-500 text-sm mt-1">{errors.exclusions}</p>}
                            </div>

                            {/* Things To Pack */}
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Things To Pack</label>
                                {formData.thingsToPack.map((item, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleArrayChange(e, index, 'thingsToPack')}
                                            placeholder="e.g., Hiking boots"
                                            className="w-full border border-gray-300 rounded-md p-2 mr-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {formData.thingsToPack.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem(index, 'thingsToPack')}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('thingsToPack')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-2 text-sm"
                                >
                                    Add Item
                                </button>
                                {errors.thingsToPack && <p className="text-red-500 text-sm mt-1">{errors.thingsToPack}</p>}
                            </div>

                            {/* Itinerary */}
                            <div className="md:col-span-2 border border-gray-300 p-4 rounded-md">
                                <h3 className="text-lg font-semibold mb-3 text-gray-700">Itinerary</h3>
                                {formData.itinerary.map((day, dayIndex) => (
                                    <div key={dayIndex} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-medium text-gray-700">Day {day.dayNumber}</h4>
                                            {formData.itinerary.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItineraryDay(dayIndex)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                                                >
                                                    Remove Day
                                                </button>
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1 text-gray-700">Day Title</label>
                                            <input
                                                type="text"
                                                value={day.title}
                                                onChange={(e) => handleItineraryChange(e, dayIndex, 'title')}
                                                placeholder="e.g., Arrival in Leh"
                                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors[`itinerary[${dayIndex}].title`] && <p className="text-red-500 text-sm mt-1">{errors[`itinerary[${dayIndex}].title`]}</p>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1 text-gray-700">Day Description</label>
                                            <textarea
                                                value={day.description}
                                                onChange={(e) => handleItineraryChange(e, dayIndex, 'description')}
                                                rows={2}
                                                placeholder="Upon arrival, transfer to hotel and relax..."
                                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                            ></textarea>
                                        </div>
                                        <h5 className="font-medium mt-4 mb-2 text-gray-700">Activities</h5>
                                        {day.activities.map((activity, activityIndex) => (
                                            <div key={activityIndex} className="mb-3 p-3 border border-gray-200 rounded-md bg-white">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h6 className="text-sm font-medium text-gray-600">Activity {activityIndex + 1}</h6>
                                                    {day.activities.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeActivity(dayIndex, activityIndex)}
                                                            className="bg-red-400 text-white px-2 py-0.5 rounded-md hover:bg-red-500 transition duration-200 text-xs"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Type (e.g., Sightseeing)</label>
                                                        <input
                                                            type="text"
                                                            value={activity.type}
                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'type')}
                                                            placeholder="e.g., Sightseeing"
                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        {errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`] && <p className="text-red-500 text-xs mt-1">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`]}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Title</label>
                                                        <input
                                                            type="text"
                                                            value={activity.title}
                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'title')}
                                                            placeholder="e.g., Shanti Stupa"
                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        {errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`] && <p className="text-red-500 text-xs mt-1">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`]}</p>}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Description</label>
                                                        <textarea
                                                            value={activity.description}
                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'description')}
                                                            rows={1}
                                                            placeholder="Visit the iconic Shanti Stupa for panoramic views."
                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Time (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={activity.time}
                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'time')}
                                                            placeholder="e.g., Morning"
                                                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addActivity(dayIndex)}
                                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition duration-200 text-sm mt-2"
                                        >
                                            Add Activity
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addItineraryDay}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-2"
                                >
                                    Add Day
                                </button>
                            </div>

                            {/* Gallery Images Section */}
                            <div className="w-full col-span-1 md:col-span-2">
                                <label className="block font-medium mb-1 text-gray-700">Gallery Images</label>

                                {/* Display CURRENT Gallery Images */}
                                {formData.currentGallery.length > 0 && (
                                    <div className="mt-2 mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Existing Gallery Images:</p>
                                        <div className="flex flex-wrap gap-2"> 
                                            {formData.currentGallery.map((imgBase64, index) => (
                                                <div key={`current-${index}`} className="relative group">
                                                    <img
                                                        src={imgBase64}
                                                        alt={`Current Gallery ${index + 1}`}
                                                        className="w-24 h-16 object-cover rounded-md border border-gray-300" 
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCurrentGalleryImage(index)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        title="Remove this image"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input for New Gallery Images */}
                                <input
                                    type="file"
                                    accept='image/*'
                                    multiple
                                    name="galleryImages"
                                    onChange={handleGalleryImageChange}
                                    className="w-full border border-gray-300 rounded-md p-2 mt-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                {/* Display PREVIEWS of NEWLY selected Gallery Images */}
                                {formData.gallery.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Newly Selected Images:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.gallery.map((file, index) => (
                                                <div key={`new-${index}`} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New Gallery ${index + 1}`}
                                                        className="w-24 h-16 object-cover rounded-md border border-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewGalleryImage(index)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        title="Remove this new image"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {errors.gallery && <p className="text-red-500 text-sm mt-1">{errors.gallery}</p>}
                            </div>

                            {/* Form Actions */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-6"> 
                                <button
                                    type="button"
                                    onClick={handleBackToDashboard}
                                    className="bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-gray-700 transition duration-200 shadow-md text-sm sm:text-base w-full sm:w-auto"
                                >
                                    Back to Dashboard
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-green-800 transition duration-200 shadow-md text-sm sm:text-base w-full sm:w-auto"
                                >
                                    Update Tour
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}

export default EditTour;