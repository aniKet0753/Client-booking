import { useState, useEffect } from 'react';
import axios from '../api';
import {
  FiShoppingCart, FiClock, FiMapPin, FiCalendar, FiUsers,
  FiDollarSign, FiStar, FiChevronDown, FiChevronUp, FiInfo
} from 'react-icons/fi';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [expandedTour, setExpandedTour] = useState(null);
  const [upcomingTour, setUpcomingTour] = useState([]);
  const [previousTours, setPreviousTours] = useState([]);
  const [showItineraryTourId, setShowItineraryTourId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/bookings/my-bookings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
      });

      const allBookings = response.data;
      const today = new Date();
      const upcoming = [];
      const previous = [];

      if (!Array.isArray(allBookings)) {
        console.error('API response is not an array:', allBookings);
        setError('Received invalid data from server.');
        setLoading(false);
        return;
      }

      allBookings.forEach(booking => {
        const tourStartDate = booking.tour?.startDate ? new Date(booking.tour.startDate) : new Date();
        const bookingData = {
          id: booking._id,
          title: booking.tour?.name || 'Unknown Tour',
          date: tourStartDate.toISOString().split('T')[0],
          location: booking.tour?.country || 'N/A',
          price: booking.payment?.totalAmount || 'N/A',
          paymentStatus: booking.payment?.paymentStatus || 'N/A',
          people: booking.travelers?.length || 0,
          rating: booking.tour?.rating || 0,
          image: booking.tour?.image || 'https://via.placeholder.com/400x200',
          description: booking.tour?.description || '',
          status: booking.status,
          bookingID: booking.bookingID,
          itinerary: (booking.tour?.itinerary || []).filter(item => typeof item === 'object' && item !== null),
          inclusions: booking.tour?.inclusions || [],
          exclusions: booking.tour?.exclusions || [],
        };

        if (tourStartDate >= today) {
          upcoming.push(bookingData);
        } else {
          previous.push(bookingData);
        }
      });

      setUpcomingTour(upcoming);
      setPreviousTours(previous);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setError('No bookings found for your account.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to fetch bookings: ${err.response.data.message || err.message}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`An unexpected error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const toggleTourExpand = (id) => {
    setExpandedTour(expandedTour === id ? null : id);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Tours</h1>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium flex items-center ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <FiShoppingCart className="mr-2" />
              Upcoming Tours ({upcomingTour.length})
            </button>
            <button
              className={`py-2 px-4 font-medium flex items-center ${activeTab === 'previous' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('previous')}
            >
              <FiClock className="mr-2" />
              Previous Tours ({previousTours.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading your tours...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <FiInfo className="mx-auto text-4xl mb-4" />
              {error}
            </div>
          ) : (
            <>
              {(activeTab === 'upcoming' ? upcomingTour : previousTours).map((tour) => (
                <div key={tour.id} className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="md:flex">
                    <div className="md:w-48 h-48 bg-cover bg-center" style={{ backgroundImage: `url(${tour.image})` }}></div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">{tour.title}</h2>
                          <div className="mt-2 flex items-center text-gray-600">
                            <FiMapPin className="mr-1" />
                            <span>{tour.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          <FiStar className="mr-1" />
                          <span>{tour.rating === 0 ? 'N/A' : tour.rating}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-gray-700">
                          <FiCalendar className="mr-2 text-gray-500" />
                          <span>{new Date(tour.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FiUsers className="mr-2 text-gray-500" />
                          <span>{tour.people} {tour.people > 1 ? 'People' : 'Person'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <span>{tour.paymentStatus === 'Pending' ? 'Payment: Pending' : `Paid amount: ₹${tour.price}`}</span>
                        </div>
                      </div>

                      <button onClick={() => toggleTourExpand(tour.id)} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        {expandedTour === tour.id ? (
                          <>
                            <span>Show less</span>
                            <FiChevronUp className="ml-1" />
                          </>
                        ) : (
                          <>
                            <span>Show details</span>
                            <FiChevronDown className="ml-1" />
                          </>
                        )}
                      </button>

                      {expandedTour === tour.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-gray-700 mb-2">{tour.description}</p>
                          <p className="text-gray-600 text-sm mb-1">Booking ID: <span className="font-semibold">{tour.bookingID}</span></p>
                          <p className="text-gray-600 text-sm mb-3">Status: <span className="font-semibold capitalize">{tour.status}</span></p>

                          {tour.inclusions.length > 0 && (
                            <div className="mb-2">
                              <p className="font-semibold text-gray-800 mb-1">Inclusions:</p>
                              <ul className="list-disc ml-6 text-gray-600 text-sm">
                                {tour.inclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                          )}

                          {tour.exclusions.length > 0 && (
                            <div className="mb-4">
                              <p className="font-semibold text-gray-800 mb-1">Exclusions:</p>
                              <ul className="list-disc ml-6 text-gray-600 text-sm">
                                {tour.exclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                          )}

                          {activeTab === 'upcoming' && (
                            <div className="mt-4 flex flex-col space-y-3">
                              <button
                                onClick={() =>
                                  setShowItineraryTourId(
                                    showItineraryTourId === tour.id ? null : tour.id
                                  )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-max"
                              >
                                {showItineraryTourId === tour.id ? 'Hide Itinerary' : 'View Itinerary'}
                              </button>

                              {showItineraryTourId === tour.id && tour.itinerary.length > 0 && (
                                <div className="mt-2 bg-gray-100 p-4 rounded-lg">
                                  <h4 className="text-md font-semibold text-gray-700 mb-2">Itinerary:</h4>
                                  <ul className="space-y-4">
                                    {tour.itinerary.map((item, i) => (
                                      <li key={item._id || i}>
                                        <p><strong>Day {item.dayNumber}: {item.title}</strong></p>
                                        <p>{item.description}</p>
                                        {item.activities?.length > 0 && (
                                          <ul className="ml-4 list-disc">
                                            {item.activities.map((act, j) => (
                                              <li key={j}>{act.title} - {act.time}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 w-max">
                                Cancel Tour
                              </button>
                            </div>
                          )}

                          {activeTab === 'previous' && (
                            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-max">
                              Book Again
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'upcoming' && upcomingTour.length === 0 && (
                <div className="text-center py-12">
                  <FiShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No upcoming tours booked</h3>
                  <p className="text-gray-500 mt-2">Browse our amazing tours and start your next adventure!</p>
                </div>
              )}

              {activeTab === 'previous' && previousTours.length === 0 && (
                <div className="text-center py-12">
                  <FiClock className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No previous tours completed</h3>
                  <p className="text-gray-500 mt-2">Your past adventures will appear here after completion.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
