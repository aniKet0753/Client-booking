import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import Swal from 'sweetalert2';
import { FiTrash2, FiPlus, FiX, FiChevronDown, FiChevronUp, FiUpload, FiImage, FiCalendar, FiDollarSign, FiMapPin, FiTag, FiUsers, FiClock, FiInfo, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function EditTour() {
    const { tourID } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tourID: '',
        name: '',
        image: null,
        currentImage: '',
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
        currentGallery: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [expandedSections, setExpandedSections] = useState({
        basicInfo: true,
        pricing: true,
        description: true,
        highlights: true,
        inclusions: true,
        exclusions: true,
        packing: true,
        itinerary: true,
        gallery: true
    });

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

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

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
        const totalImages = formData.gallery.length + files.length;

        if (totalImages > 10) {
            Swal.fire({
                icon: "error",
                title: "Limit Exceeded",
                text: "You can only upload a maximum of 10 images at once in the gallery. You can upload rest images later.",
            });
            return;
        }

        setFormData(prevData => ({
            ...prevData,
            gallery: [...prevData.gallery, ...files]
        }));

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

    const handleBackToDashboard = () => {
        navigate('/superadmin/dashboard');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading tour data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
                    <div className="text-red-500 text-center">
                        <FiXCircle className="mx-auto h-12 w-12" />
                        <h3 className="mt-2 text-lg font-medium">{error}</h3>
                        <button
                            onClick={handleBackToDashboard}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            <FiArrowLeft className="inline mr-2" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-gray-50 py-6'>
            <div className="min-h-screen bg-white max-w-[1120px] mx-auto rounded-2xl border-gray-200 shadow-lg">
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={handleBackToDashboard}
                            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back
                        </button>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Edit Tour: <span className="text-blue-600">{formData.name}</span>
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
                        {/* Basic Information Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('basicInfo')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiInfo className="mr-2 text-blue-600" />
                                    Basic Information
                                </h3>
                                {expandedSections.basicInfo ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.basicInfo && (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tour ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tour ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="tourID"
                                                value={formData.tourID}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                                readOnly
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiTag className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.tourID && <p className="mt-1 text-sm text-red-600">{errors.tourID}</p>}
                                    </div>

                                    {/* Tour Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tour Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Majestic Himalayas Adventure"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMapPin className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Tour Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tour Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="categoryType"
                                                value={formData.categoryType}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Low Budget Tour">Low Budget Tour</option>
                                                <option value="Standard Tour">Standard Tour</option>
                                                <option value="Premium Tour">Premium Tour</option>
                                            </select>
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiTag className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.categoryType && <p className="mt-1 text-sm text-red-600">{errors.categoryType}</p>}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="e.g., India"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMapPin className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                                    </div>

                                    {/* Tour Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tour Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="tourType"
                                                value={formData.tourType}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiTag className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.tourType && <p className="mt-1 text-sm text-red-600">{errors.tourType}</p>}
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiCalendar className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration (Days)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleChange}
                                                placeholder="e.g., 7"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiClock className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
                                    </div>

                                    {/* Main Tour Image */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Main Tour Image
                                        </label>
                                        <div className="space-y-4">
                                            {formData.currentImage && !formData.image && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={formData.currentImage}
                                                            alt="Current Main Tour"
                                                            className="h-40 w-full object-cover rounded-lg border border-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FiUpload className="w-8 h-8 text-gray-500 mb-2" />
                                                        <p className="text-sm text-gray-500">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        name="image"
                                                        onChange={handleChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                            {formData.image && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-2">New Selected Image:</p>
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={URL.createObjectURL(formData.image)}
                                                            alt="New Main Tour"
                                                            className="h-40 w-full object-cover rounded-lg border border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, image: null })}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <FiX className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Experience the breathtaking beauty..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        ></textarea>
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing Information Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('pricing')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiDollarSign className="mr-2 text-blue-600" />
                                    Pricing Information
                                </h3>
                                {expandedSections.pricing ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.pricing && (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Price Per Head */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price Per Head (₹)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="pricePerHead"
                                                value={formData.pricePerHead}
                                                onChange={handleChange}
                                                placeholder="e.g., 24999"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        {errors.pricePerHead && <p className="mt-1 text-sm text-red-600">{errors.pricePerHead}</p>}
                                    </div>

                                    {/* GST */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            GST (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="GST"
                                                value={formData.GST}
                                                onChange={handleChange}
                                                placeholder="e.g., 10"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">%</span>
                                            </div>
                                        </div>
                                        {errors.GST && <p className="mt-1 text-sm text-red-600">{errors.GST}</p>}
                                    </div>

                                    {/* Occupancy */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Occupancy (Total People)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="occupancy"
                                                value={formData.occupancy}
                                                onChange={handleChange}
                                                placeholder="e.g., 20"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUsers className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.occupancy && <p className="mt-1 text-sm text-red-600">{errors.occupancy}</p>}
                                    </div>

                                    {/* Remaining Occupancy */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remaining Occupancy (Optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="remainingOccupancy"
                                                value={formData.remainingOccupancy}
                                                onChange={handleChange}
                                                placeholder="Defaults to total occupancy"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUsers className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.remainingOccupancy && <p className="mt-1 text-sm text-red-600">{errors.remainingOccupancy}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Highlights Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('highlights')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiCheckCircle className="mr-2 text-blue-600" />
                                    Tour Highlights
                                </h3>
                                {expandedSections.highlights ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.highlights && (
                                <div className="p-6">
                                    {formData.highlights.map((highlight, index) => (
                                        <div key={index} className="flex items-center mb-3">
                                            <div className="flex-grow relative">
                                                <input
                                                    type="text"
                                                    value={highlight}
                                                    onChange={(e) => handleArrayChange(e, index, 'highlights')}
                                                    placeholder="e.g., Trek to scenic viewpoints"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">{index + 1}.</span>
                                                </div>
                                            </div>
                                            {formData.highlights.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(index, 'highlights')}
                                                    className="ml-3 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('highlights')}
                                        className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Highlight
                                    </button>
                                    {errors.highlights && <p className="mt-2 text-sm text-red-600">{errors.highlights}</p>}
                                </div>
                            )}
                        </div>

                        {/* Inclusions Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('inclusions')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiCheckCircle className="mr-2 text-blue-600" />
                                    Inclusions
                                </h3>
                                {expandedSections.inclusions ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.inclusions && (
                                <div className="p-6">
                                    {formData.inclusions.map((inclusion, index) => (
                                        <div key={index} className="flex items-center mb-3">
                                            <div className="flex-grow relative">
                                                <input
                                                    type="text"
                                                    value={inclusion}
                                                    onChange={(e) => handleArrayChange(e, index, 'inclusions')}
                                                    placeholder="e.g., Accommodation"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">{index + 1}.</span>
                                                </div>
                                            </div>
                                            {formData.inclusions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(index, 'inclusions')}
                                                    className="ml-3 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('inclusions')}
                                        className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Inclusion
                                    </button>
                                    {errors.inclusions && <p className="mt-2 text-sm text-red-600">{errors.inclusions}</p>}
                                </div>
                            )}
                        </div>

                        {/* Exclusions Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('exclusions')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiXCircle className="mr-2 text-blue-600" />
                                    Exclusions
                                </h3>
                                {expandedSections.exclusions ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.exclusions && (
                                <div className="p-6">
                                    {formData.exclusions.map((exclusion, index) => (
                                        <div key={index} className="flex items-center mb-3">
                                            <div className="flex-grow relative">
                                                <input
                                                    type="text"
                                                    value={exclusion}
                                                    onChange={(e) => handleArrayChange(e, index, 'exclusions')}
                                                    placeholder="e.g., International flights"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">{index + 1}.</span>
                                                </div>
                                            </div>
                                            {formData.exclusions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(index, 'exclusions')}
                                                    className="ml-3 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('exclusions')}
                                        className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Exclusion
                                    </button>
                                    {errors.exclusions && <p className="mt-2 text-sm text-red-600">{errors.exclusions}</p>}
                                </div>
                            )}
                        </div>

                        {/* Things To Pack Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('packing')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiTag className="mr-2 text-blue-600" />
                                    Things To Pack
                                </h3>
                                {expandedSections.packing ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.packing && (
                                <div className="p-6">
                                    {formData.thingsToPack.map((item, index) => (
                                        <div key={index} className="flex items-center mb-3">
                                            <div className="flex-grow relative">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => handleArrayChange(e, index, 'thingsToPack')}
                                                    placeholder="e.g., Hiking boots"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500">{index + 1}.</span>
                                                </div>
                                            </div>
                                            {formData.thingsToPack.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem(index, 'thingsToPack')}
                                                    className="ml-3 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('thingsToPack')}
                                        className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Item
                                    </button>
                                    {errors.thingsToPack && <p className="mt-2 text-sm text-red-600">{errors.thingsToPack}</p>}
                                </div>
                            )}
                        </div>

                        {/* Itinerary Section */}
                        <div className="border-b border-gray-200">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('itinerary')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiCalendar className="mr-2 text-blue-600" />
                                    Itinerary
                                </h3>
                                {expandedSections.itinerary ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.itinerary && (
                                <div className="p-6 space-y-6">
                                    {formData.itinerary.map((day, dayIndex) => (
                                        <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                                                <h4 className="font-medium text-gray-800">Day {day.dayNumber}</h4>
                                                {formData.itinerary.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItineraryDay(dayIndex)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day Title</label>
                                                    <input
                                                        type="text"
                                                        value={day.title}
                                                        onChange={(e) => handleItineraryChange(e, dayIndex, 'title')}
                                                        placeholder="e.g., Arrival in Leh"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    {errors[`itinerary[${dayIndex}].title`] && <p className="mt-1 text-sm text-red-600">{errors[`itinerary[${dayIndex}].title`]}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day Description</label>
                                                    <textarea
                                                        value={day.description}
                                                        onChange={(e) => handleItineraryChange(e, dayIndex, 'description')}
                                                        rows={2}
                                                        placeholder="Upon arrival, transfer to hotel and relax..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="block text-sm font-medium text-gray-700">Activities</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addActivity(dayIndex)}
                                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                                        >
                                                            <FiPlus className="mr-1" />
                                                            Add Activity
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {day.activities.map((activity, activityIndex) => (
                                                            <div key={activityIndex} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <h5 className="text-sm font-medium text-gray-700">Activity {activityIndex + 1}</h5>
                                                                    {day.activities.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeActivity(dayIndex, activityIndex)}
                                                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 text-xs"
                                                                        >
                                                                            <FiTrash2 />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                                                        <input
                                                                            type="text"
                                                                            value={activity.type}
                                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'type')}
                                                                            placeholder="e.g., Sightseeing"
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                        {errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`] && <p className="mt-1 text-xs text-red-600">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].type`]}</p>}
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                                                        <input
                                                                            type="text"
                                                                            value={activity.title}
                                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'title')}
                                                                            placeholder="e.g., Shanti Stupa"
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                        {errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`] && <p className="mt-1 text-xs text-red-600">{errors[`itinerary[${dayIndex}].activities[${activityIndex}].title`]}</p>}
                                                                    </div>
                                                                    <div className="md:col-span-2">
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                                                        <textarea
                                                                            value={activity.description}
                                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'description')}
                                                                            rows={1}
                                                                            placeholder="Visit the iconic Shanti Stupa for panoramic views."
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                        ></textarea>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Time (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            value={activity.time}
                                                                            onChange={(e) => handleActivityChange(e, dayIndex, activityIndex, 'time')}
                                                                            placeholder="e.g., Morning"
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addItineraryDay}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 flex items-center justify-center"
                                    >
                                        <FiPlus className="mr-2" />
                                        Add Day
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Gallery Section */}
                        <div>
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleSection('gallery')}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FiImage className="mr-2 text-blue-600" />
                                    Gallery Images
                                </h3>
                                {expandedSections.gallery ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {expandedSections.gallery && (
                                <div className="p-6">
                                    {/* Current Gallery Images */}
                                    {formData.currentGallery.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Gallery Images</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {formData.currentGallery.map((imgBase64, index) => (
                                                    <div key={`current-${index}`} className="relative group">
                                                        <img
                                                            src={imgBase64}
                                                            alt={`Current Gallery ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCurrentGalleryImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <FiX className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Gallery Images Upload */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Upload New Gallery Images</h4>
                                        <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                                            <div className="flex flex-col items-center justify-center">
                                                <FiUpload className="w-8 h-8 text-gray-500 mb-2" />
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB each)</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                name="galleryImages"
                                                onChange={handleGalleryImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Preview of Newly Selected Images */}
                                    {formData.gallery.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Newly Selected Images</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {formData.gallery.map((file, index) => (
                                                    <div key={`new-${index}`} className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`New Gallery ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewGalleryImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <FiX className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {errors.gallery && <p className="mt-2 text-sm text-red-600">{errors.gallery}</p>}
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                type="button"
                                onClick={handleBackToDashboard}
                                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FiArrowLeft className="mr-2" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FiCheckCircle className="mr-2" />
                                Update Tour
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default EditTour;