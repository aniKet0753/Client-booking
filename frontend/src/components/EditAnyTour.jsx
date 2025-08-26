import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaFilter,
  FaExclamationCircle,
  FaSync,
  FaLock,
  FaKey,
  FaPlus,
} from 'react-icons/fa';

function EditAnyTour() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const navigate = useNavigate();
    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role');

    // New state for the "Create New Tour" feature
    const [showModal, setShowModal] = useState(false);
    const [tourToRenew, setTourToRenew] = useState(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await axios.get('/api/admin/tours', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: role,
                    },
                });
                console.log(res);
                setTours(res.data.tours);
            } catch (err) {
                const errorMessage = err?.response?.data?.message || 'Error fetching tours.';
                setError(errorMessage);
                Swal.fire('Error', errorMessage, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, [token, role]);

    const handleEdit = (tourID, hasBookings) => {
        if (hasBookings) {
            Swal.fire(
                'Cannot Edit',
                'This tour has active bookings and cannot be edited.',
                'warning'
            );
            return;
        }
        navigate(`/edit-tour/${tourID}`);
    };

    const handleDelete = async (tourID, hasBookings) => {
        if (hasBookings) {
            Swal.fire(
                'Cannot Delete',
                'This tour has active bookings and cannot be deleted.',
                'warning'
            );
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/admin/tours/${tourID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Role: role,
                        },
                    });
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Your tour has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
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

    // New function to handle the "Create new tour" action
    const handleCreateNewTour = async (tourId, canCreateNewTour) => {
        if (!canCreateNewTour) {
            Swal.fire({
                title: 'Tour Already Renewed!',
                text: 'A new tour has already been created based on this expired tour.',
                icon: 'info',
            });
            return;
        }
        const { value: newStartDate } = await Swal.fire({
          title: 'Create new tour',
          html: `
            <p class="text-sm text-gray-600 mb-4">Create a new tour with the same features. Just enter the new start date.</p>
            <input id="swal-input1" type="date" class="swal2-input">
          `,
          focusConfirm: false,
          preConfirm: () => {
            return document.getElementById('swal-input1').value;
          }
        });
      
        if (newStartDate) {
          try {
            const res = await axios.post(
              '/api/admin/tours/create-new-expired-tour',
              { originalTourID: tourId, newStartDate: newStartDate },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Role: role,
                  'Content-Type': 'application/json',
                },
              }
            );
      
            Swal.fire({
              title: 'Success!',
              text: res.data.message,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
            
            // This logic needs to be a bit more robust
            // We should ideally update the specific tour in the state instead of refetching everything
            const newTour = res.data.tour;
            const updatedTours = tours.map(t =>
                t.tourID === tourId ? { ...t, canCreateNewTour: false } : t
            );
            setTours([...updatedTours, newTour]);
          } catch (err) {
            console.error('Error creating new tour:', err);
            Swal.fire(
              'Error!',
              err?.response?.data?.message || 'Failed to create new tour.',
              'error'
            );
          }
        }
    };

    const categories = ['all', ...new Set(tours.map(tour => tour.categoryType))];

    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tour.country.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || tour.categoryType === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                <p className="text-lg text-gray-700">Loading tours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
                    <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center mx-auto"
                    >
                        <FaSync className="mr-2" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
                        Tour Management Dashboard
                    </h1>
                    <p className="text-lg text-gray-600">
                        View and manage all available tours
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-8 bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search tours by name or country..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaFilter className="text-gray-400" />
                                </div>
                                <select
                                    id="category-filter"
                                    className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category === 'all' ? 'All Categories' : category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tours Grid */}
                {filteredTours.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No tours found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterCategory !== 'all'
                                ? "No tours match your search criteria. Try adjusting your filters."
                                : "There are currently no tours available."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTours.map((tour) => (
                            <div
                                key={tour.tourID}
                                className={`group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 border border-gray-100 relative
                                    ${tour.hasBookings ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={tour.image || 'https://via.placeholder.com/300x200?text=Tour+Image'}
                                        alt={tour.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Tour+Image';
                                        }}
                                    />
                                    {tour.hasBookings && (
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-lg font-bold p-4"
                                        >
                                            <FaLock className="text-4xl mb-2" />
                                            <span className="text-center">Booked Tour</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        {tour.categoryType}
                                    </div>
                                    {tour.isExpired && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            Expired
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{tour.name}</h2>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                        <span>Country: {tour.country}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                        <span>Start Date: {new Date(tour.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FaMoneyBillWave className="mr-2 text-gray-400" />
                                        <span>Price: ₹{tour.pricePerHead} per person</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <FaClock className="mr-2 text-gray-400" />
                                        <span>Duration: {tour.duration} days</span>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        {tour.isExpired && tour.canCreateNewTour ? (
                                            <button
                                                onClick={() => handleCreateNewTour(tour.tourID, tour.canCreateNewTour)}
                                                className="flex items-center px-4 py-2 rounded transition bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <FaPlus className="mr-2" />
                                                Create New Tour
                                            </button>
                                        ) : tour.isExpired && !tour.canCreateNewTour ? (
                                            <button
                                                onClick={() => handleCreateNewTour(tour.tourID, tour.canCreateNewTour)}
                                                className="flex items-center px-4 py-2 rounded transition bg-gray-400 text-gray-700 cursor-not-allowed"
                                                disabled
                                            >
                                                <FaPlus className="mr-2" />
                                                Already Renewed
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(tour.tourID, tour.hasBookings)}
                                                    className={`flex items-center px-4 py-2 rounded transition ${
                                                        tour.hasBookings
                                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                    }`}
                                                    disabled={tour.hasBookings}
                                                >
                                                    <FaEdit className="mr-2" />
                                                    Edit Tour
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tour.tourID, tour.hasBookings)}
                                                    className={`flex items-center px-4 py-2 rounded transition ${
                                                        tour.hasBookings
                                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                                    disabled={tour.hasBookings}
                                                >
                                                    <FaTrash className="mr-2" />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {tour.hasBookings && !tour.isExpired && (
                                    <div className="absolute inset-0 flex items-center justify-center
                                                    bg-black bg-opacity-70 text-white p-4 text-center rounded-lg
                                                    opacity-0 group-hover:opacity-100 pointer-events-none
                                                    transition-opacity duration-300 delay-500">
                                        <p>Cannot edit or delete the tour. There are active bookings associated with this tour.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditAnyTour;