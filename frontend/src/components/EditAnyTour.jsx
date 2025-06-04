import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
function EditAnyTour() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role'); // Assuming admin role is required for edit/delete

    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/admin/tours', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: role,
                    },
                });
                setTours(res.data.tours);
            } catch (err) {
                setError(err?.response?.data?.message || 'Error fetching tours.');
                Swal.fire('Error', error || 'Failed to load tours.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, [token, role, error]);

    const handleEdit = (tourID) => {
        navigate(`/edit-tour/${tourID}`); // Navigate to the EditTour component
    };

    const handleDelete = async (tourID) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/admin/tours/${tourID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Role: role,
                        },
                    });
                    Swal.fire(
                        'Deleted!',
                        'Your tour has been deleted.',
                        'success'
                    );
                    // Remove the deleted tour from the state
                    setTours(tours.filter(tour => tour.tourID !== tourID));
                } catch (err) {
                    console.error('Error deleting tour:', err);
                    Swal.fire(
                        'Error!',
                        err?.response?.data?.message || 'Failed to delete tour.',
                        'error'
                    );
                }
            }
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-gray-700">Loading tours...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">All Available Tours</h1>
            {tours.length === 0 ? (
                <p className="text-center text-gray-600">No tours found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour) => (
                        <div key={tour.tourID} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
                            <img
                                src={tour.image}
                                alt={tour.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{tour.name}</h2>
                                <p className="text-gray-600 mb-1"><strong>Category:</strong> {tour.categoryType}</p>
                                <p className="text-gray-600 mb-1"><strong>Country:</strong> {tour.country}</p>
                                <p className="text-gray-600 mb-1"><strong>Price:</strong> ₹{tour.pricePerHead}</p>
                                <p className="text-gray-600 mb-1"><strong>Duration:</strong> {tour.duration} days</p>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(tour.tourID)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        title="Edit Tour"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tour.tourID)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                        title="Delete Tour"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EditAnyTour;