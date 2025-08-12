import React, { useState, useEffect } from "react";
import axios from "../api";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck, FaImage } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminSpecialOffers = () => {
    const [offers, setOffers] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: "", // Stores the Base64 string
        validity: "",
        badge: "",
        isActive: true
    });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/special-offers");
            setOffers(response.data);
        } catch (error) {
            console.error("Error fetching offers:", error);
            toast.error("Failed to load offers.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
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

        if (!formData.title || !formData.description) {
            toast.warn("Title and Description are required.");
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                await axios.put(`/api/special-offers/${editingId}`, formData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('Token')}` 
                    },
                });
                toast.success("Offer updated successfully!");
            } else {
                await axios.post("/api/special-offers", formData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('Token')}` 
                    },
                });
                toast.success("Offer added successfully!");
            }
            fetchOffers();
            resetForm();
        } catch (error) {
            console.error("Error saving offer:", error);
            const errorMessage = error.response?.data?.message || "Failed to save offer.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteOffer = async (id) => {
        if (!window.confirm("Are you sure you want to delete this offer?")) return;

        try {
            await axios.delete(`/api/special-offers/${id}`);
            toast.success("Offer deleted successfully!");
            fetchOffers();
        } catch (error) {
            console.error("Error deleting offer:", error);
            toast.error("Failed to delete offer.");
        }
    };

    const startEdit = (offer) => {
        setEditingId(offer._id);
        setFormData({ ...offer });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: "",
            description: "",
            image: "",
            validity: "",
            badge: "",
            isActive: true
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
                <div className="text-xl font-semibold text-gray-700">Loading offers...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-100 min-h-screen font-sans">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Manage Special Offers</h1>

            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-700">
                    {editingId ? "Edit Offer" : "Add New Offer"}
                </h2>
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
                                    placeholder="e.g., Summer Special"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter offer details"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="badge">Badge Text</label>
                                <input
                                    type="text"
                                    id="badge"
                                    name="badge"
                                    value={formData.badge}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 'Limited Time'"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">Image</label>
                            <div className="flex items-center">
                                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 rounded px-4 py-2 flex items-center transition-colors">
                                    <FaImage className="mr-2" />
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
                            disabled={isSaving || !formData.title}
                        >
                            {isSaving ? "Saving..." : editingId ? (<><FaCheck className="mr-2" /> Update Offer</>) : (<><FaPlus className="mr-2" /> Add Offer</>)}
                        </button>
                        {(editingId || formData.title) && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 transition"
                            >
                                <FaTimes className="mr-2" /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-700">Current Offers</h2>
                </div>
                {offers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No offers available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {offers.map((offer) => (
                                    <tr key={offer._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {offer.image && (
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={offer.image} alt="" />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{offer.description}</div>
                                                    {offer.badge && (
                                                        <span className="mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            {offer.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {offer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {offer.validity ? new Date(offer.validity).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => startEdit(offer)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="Edit Offer"
                                                >
                                                    <FaEdit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => deleteOffer(offer._id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Delete Offer"
                                                >
                                                    <FaTrash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSpecialOffers;