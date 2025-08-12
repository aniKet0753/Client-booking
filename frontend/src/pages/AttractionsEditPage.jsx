import React, { useState, useEffect } from 'react';
import axios from '../api';
import { FiEdit, FiTrash2, FiSave, FiPlus, FiImage, FiX, FiCheck } from 'react-icons/fi';
import { FaMountain, FaUmbrellaBeach, FaLandmark, FaTree, FaChurch } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttractionsEditPage = () => {
    const [attractions, setAttractions] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'landmark',
        image: '' // Stores the Base64 string
    });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const iconComponents = {
        mountain: <FaMountain className="text-green-600" size={24} />,
        beach: <FaUmbrellaBeach className="text-blue-400" size={24} />,
        landmark: <FaLandmark className="text-yellow-500" size={24} />,
        park: <FaTree className="text-green-500" size={24} />,
        church: <FaChurch className="text-purple-500" size={24} />
    };

    useEffect(() => {
        fetchAttractions();
    }, []);

    const fetchAttractions = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/attractions');
            setAttractions(response.data);
        } catch (error) {
            console.error("Error fetching attractions:", error);
            toast.error("Failed to fetch attractions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prevData => ({ ...prevData, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.warn("Title is required.");
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                await axios.put(`/api/attractions/${editingId}`, formData, {
                  headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('Token')}` 
                    },
                });
                toast.success("Attraction updated successfully!");
            } else {
                await axios.post('/api/attractions', formData, {
                  headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('Token')}` 
                    },
                });
                toast.success("Attraction added successfully!");
            }
            fetchAttractions();
            resetForm();
        } catch (error) {
            console.error("Error saving attraction:", error);
            toast.error("Failed to save attraction.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attraction?")) return;
        
        try {
            await axios.delete(`/api/attractions/${id}`);
            toast.success("Attraction deleted successfully!");
            fetchAttractions();
        } catch (error) {
            console.error("Error deleting attraction:", error);
            toast.error("Failed to delete attraction.");
        }
    };

    const startEdit = (attraction) => {
        setEditingId(attraction._id);
        setFormData({ ...attraction });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            icon: 'landmark',
            image: ''
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Loading attractions...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-100 min-h-screen font-sans">
            <ToastContainer position="top-right" autoClose={3000} />

            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Manage Attractions</h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">{editingId ? 'Edit Attraction' : 'Add New Attraction'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Mountain View"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Enter a brief description"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="icon">Icon</label>
                                <select
                                    id="icon"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Object.keys(iconComponents).map(iconName => (
                                        <option key={iconName} value={iconName}>
                                            {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">Image</label>
                            <div className="flex items-center">
                                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 rounded px-4 py-2 flex items-center transition-colors">
                                    <FiImage className="mr-2" />
                                    Choose Image
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            {formData.image && (
                                <div className="mt-2">
                                    <img src={formData.image} alt="Preview" className="h-32 object-cover rounded-lg border border-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t mt-6 border-gray-200">
                        <button
                            type="submit"
                            className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving || !formData.title.trim()}
                        >
                            {isSaving ? "Saving..." : editingId ? (<><FiSave className="mr-2" /> Update Attraction</>) : (<><FiPlus className="mr-2" /> Add Attraction</>)}
                        </button>
                        {(editingId || formData.title) && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 transition"
                            >
                                <FiX className="mr-2" /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-700">Current Attractions</h2>
                </div>
                {attractions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No attractions available.</div>
                ) : (
                    <div className="space-y-4 p-4">
                        {attractions.map(attraction => (
                            <div key={attraction._id} className="flex items-center bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                                <div className="flex-shrink-0 mr-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {attraction.image ? (
                                            <img src={attraction.image} alt={attraction.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <FiImage size={24} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center">
                                        <div className="mr-2">{iconComponents[attraction.icon]}</div>
                                        <h3 className="text-lg font-medium text-gray-900">{attraction.title}</h3>
                                    </div>
                                    <p className="text-gray-600 line-clamp-2">{attraction.description}</p>
                                </div>
                                <div className="flex-shrink-0 flex space-x-2 ml-4">
                                    <button
                                        onClick={() => startEdit(attraction)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Edit"
                                    >
                                        <FiEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attraction._id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttractionsEditPage;