import { useState, useEffect } from 'react';
import axios from '../api'; // Ensure this path is correct for your axios instance
import {
  FiShoppingCart, FiClock, FiMapPin, FiCalendar, FiUsers,
  FiDollarSign, FiStar, FiChevronDown, FiChevronUp, FiInfo,
  FiFileText, // New icon for complaints
  FiMessageSquare, // For message input/sending
} from 'react-icons/fi';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'previous', 'complaints'
  const [expandedTour, setExpandedTour] = useState(null);
  const [upcomingTour, setUpcomingTour] = useState([]);
  const [previousTours, setPreviousTours] = useState([]);
  const [showItineraryTourId, setShowItineraryTourId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for complaints
  const [ongoingComplaints, setOngoingComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [activeComplaintSubTab, setActiveComplaintSubTab] = useState('ongoing'); // 'ongoing' or 'resolved'
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [replyMessage, setReplyMessage] = useState(''); // For sending new messages to complaints

  const token = localStorage.getItem('Token'); // Get token once

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/bookings/my-bookings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const allBookings = response.data;
      const today = new Date();
      const upcoming = [];
      const previous = [];

      if (!Array.isArray(allBookings)) {
        console.error('API response for bookings is not an array:', allBookings);
        setError('Received invalid booking data from server.');
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

  // New function to fetch complaints
  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/complaints/my-complaints', { // Assuming this endpoint exists
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const allComplaints = response.data;
      if (!Array.isArray(allComplaints)) {
        console.error('API response for complaints is not an array:', allComplaints);
        setError('Received invalid complaint data from server.');
        setLoading(false);
        return;
      }

      const ongoing = allComplaints.filter(c => c.status !== 'resolved');
      const resolved = allComplaints.filter(c => c.status === 'resolved');

      setOngoingComplaints(ongoing);
      setResolvedComplaints(resolved);

    } catch (err) {
      console.error('Error fetching complaints:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setError('No complaints found for your account.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Authentication failed. Please log in again to view complaints.');
        } else {
          setError(`Failed to fetch complaints: ${err.response.data.message || err.message}`);
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

  // Handle sending a message to an ongoing complaint
  const handleSendMessage = async (complaintId) => {
    if (!replyMessage.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    try {
      await axios.post(`/api/complaints/${complaintId}/reply`, {
        message: replyMessage,
        isInternal: false, // Customer replies are not internal
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setReplyMessage('');
      // Refresh complaints to show the new message
      fetchComplaints();
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    // Fetch data based on the active tab
    if (activeTab === 'upcoming' || activeTab === 'previous') {
      fetchBookings();
    } else if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab]); // Re-fetch when activeTab changes

  const toggleTourExpand = (id) => {
    setExpandedTour(expandedTour === id ? null : id);
  };

  const toggleComplaintExpand = (id) => {
    setExpandedComplaintId(expandedComplaintId === id ? null : id);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Dashboard</h1>

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
            {/* New Complaints Tab */}
            <button
              className={`py-2 px-4 font-medium flex items-center ${activeTab === 'complaints' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <FiFileText className="mr-2" />
              My Complaints ({ongoingComplaints.length + resolvedComplaints.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading your data...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <FiInfo className="mx-auto text-4xl mb-4" />
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'upcoming' || activeTab === 'previous' ? (
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
              ) : ( /* Complaints Tab Content */
                <div>
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      className={`py-2 px-4 font-medium flex items-center ${activeComplaintSubTab === 'ongoing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                      onClick={() => setActiveComplaintSubTab('ongoing')}
                    >
                      Ongoing ({ongoingComplaints.length})
                    </button>
                    <button
                      className={`py-2 px-4 font-medium flex items-center ${activeComplaintSubTab === 'resolved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                      onClick={() => setActiveComplaintSubTab('resolved')}
                    >
                      Resolved ({resolvedComplaints.length})
                    </button>
                  </div>

                  {(activeComplaintSubTab === 'ongoing' ? ongoingComplaints : resolvedComplaints).length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <FiFileText className="mx-auto text-4xl text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">
                        {activeComplaintSubTab === 'ongoing' ? 'No ongoing complaints.' : 'No resolved complaints.'}
                      </h3>
                      <p className="text-gray-500 mt-2">
                        {activeComplaintSubTab === 'ongoing' ?
                          'All your active complaints will appear here.' :
                          'Your completed complaints will appear here.'}
                      </p>
                    </div>
                  ) : (
                    (activeComplaintSubTab === 'ongoing' ? ongoingComplaints : resolvedComplaints).map(complaint => (
                      <div key={complaint._id} className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-800">{complaint.subject}</h2>
                              <p className="text-sm text-gray-600">Type: {complaint.type}</p>
                              <p className="text-sm text-gray-600">Filed on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                complaint.status === 'open' ? 'bg-red-100 text-red-800' :
                                complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </div>

                          <button onClick={() => toggleComplaintExpand(complaint._id)} className="mt-2 flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                            {expandedComplaintId === complaint._id ? (
                              <>
                                <span>Hide details</span>
                                <FiChevronUp className="ml-1" />
                              </>
                            ) : (
                              <>
                                <span>View conversation</span>
                                <FiChevronDown className="ml-1" />
                              </>
                            )}
                          </button>

                          {expandedComplaintId === complaint._id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-gray-700 mb-4">
                                <span className="font-semibold">Description: </span>
                                {complaint.description}
                              </p>
                              {complaint.preferredResolution && (
                                <p className="text-gray-700 mb-4">
                                  <span className="font-semibold">Preferred Resolution: </span>
                                  {complaint.preferredResolution}
                                </p>
                              )}
                               {complaint.agentInfo?.name && (
                                <p className="text-gray-700 mb-4">
                                  <span className="font-semibold">Agent Involved: </span>
                                  {complaint.agentInfo.name} ({complaint.agentInfo.id})
                                </p>
                              )}

                              <h3 className="font-semibold text-gray-800 mb-3">Conversation History</h3>
                              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {complaint.adminReplies.length === 0 ? (
                                  <p className="text-gray-600 text-sm">No replies yet.</p>
                                ) : (
                                  complaint.adminReplies.map((reply, index) => (
                                    <div key={index} className={`p-3 rounded-lg ${reply.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span className="font-medium">
                                          {reply.isInternal ? 'Admin (Internal Note)' : 'Admin Reply'}
                                        </span>
                                        <span>{new Date(reply.createdAt).toLocaleString()}</span>
                                      </div>
                                      <p className="text-gray-800 text-sm whitespace-pre-line">{reply.message}</p>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Message Input for Ongoing Complaints */}
                              {/* Conditionally render reply section based on complaint status */}
                              {complaint.status !== 'resolved' && activeComplaintSubTab === 'ongoing' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h3 className="font-semibold text-gray-800 mb-2">Send Message</h3>
                                  <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                    rows="3"
                                    placeholder="Type your message here..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                  ></textarea>
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => handleSendMessage(complaint._id)}
                                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                      <FiMessageSquare className="mr-2" /> Send
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Display a message if complaint is resolved */}
                              {complaint.status === 'resolved' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-gray-600">
                                  <p className="font-medium text-lg">This complaint has been resolved.</p>
                                  <p className="text-sm">You cannot send further messages for resolved complaints.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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