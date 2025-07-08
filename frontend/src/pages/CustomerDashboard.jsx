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
      const errorMessage = err.response?.data?.message || 'Failed to send message. Please try again.';
      alert(errorMessage);
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
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8"> {/* Added main content wrapper */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center sm:text-left">My Dashboard</h1>

          <div className="flex flex-col sm:flex-row border-b border-gray-200 mb-8">
            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'upcoming' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <FiShoppingCart className="mr-2 text-xl" />
              Upcoming Tours <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{upcomingTour.length}</span>
            </button>
            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'previous' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('previous')}
            >
              <FiClock className="mr-2 text-xl" />
              Previous Tours <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{previousTours.length}</span>
            </button>
            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'complaints' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <FiFileText className="mr-2 text-xl" />
              My Complaints <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{ongoingComplaints.length + resolvedComplaints.length}</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-600 text-lg">Loading your data...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">
              <FiInfo className="mx-auto text-5xl mb-6 text-red-500" />
              <p className="text-xl font-medium">{error}</p>
            </div>
          ) : (
            <>
              {activeTab === 'upcoming' || activeTab === 'previous' ? (
                <>
                  {(activeTab === 'upcoming' ? upcomingTour : previousTours).length === 0 ? (
                    <div className="text-center py-16">
                      {activeTab === 'upcoming' ? (
                        <FiShoppingCart className="mx-auto text-6xl text-gray-400 mb-6" />
                      ) : (
                        <FiClock className="mx-auto text-6xl text-gray-400 mb-6" />
                      )}
                      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                        {activeTab === 'upcoming' ? 'No upcoming tours booked!' : 'No previous tours completed yet.'}
                      </h3>
                      <p className="text-gray-500 text-lg mt-2">
                        {activeTab === 'upcoming' ?
                          'It looks like you haven\'t booked any tours yet. Explore our exciting destinations!' :
                          'Your past adventures will appear here once you complete them.'}
                      </p>
                    </div>
                  ) : (
                    (activeTab === 'upcoming' ? upcomingTour : previousTours).map((tour) => (
                      <div key={tour.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-6 border border-gray-100">
                        <div className="md:flex">
                          <div className="md:w-56 h-56 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${tour.image})` }}></div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{tour.title}</h2>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <FiMapPin className="mr-1 text-base" />
                                    <span>{tour.location}</span>
                                  </div>
                                </div>
                                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                  <FiStar className="mr-1 text-base" />
                                  <span>{tour.rating === 0 ? 'N/A' : tour.rating.toFixed(1)}</span>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-gray-700 text-base">
                                <div className="flex items-center">
                                  <FiCalendar className="mr-2 text-gray-500 text-lg" />
                                  <span>{new Date(tour.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                  <FiUsers className="mr-2 text-gray-500 text-lg" />
                                  <span>{tour.people} {tour.people > 1 ? 'People' : 'Person'}</span>
                                </div>
                                <div className="flex items-center font-semibold">
                                  <span>{tour.paymentStatus === 'Pending' ? 'Payment: Pending' : `Paid: ₹${tour.price}`}</span>
                                </div>
                              </div>
                            </div>

                            <button onClick={() => toggleTourExpand(tour.id)} className="mt-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 self-start">
                              {expandedTour === tour.id ? (
                                <>
                                  <span className="font-medium">Show less details</span>
                                  <FiChevronUp className="ml-1 text-lg" />
                                </>
                              ) : (
                                <>
                                  <span className="font-medium">View full details</span>
                                  <FiChevronDown className="ml-1 text-lg" />
                                </>
                              )}
                            </button>

                            {expandedTour === tour.id && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-gray-700 leading-relaxed mb-4">{tour.description}</p>
                                <p className="text-gray-600 text-sm mb-1"><span className="font-semibold text-gray-800">Booking ID:</span> {tour.bookingID}</p>
                                <p className="text-gray-600 text-sm mb-4"><span className="font-semibold text-gray-800">Status:</span> <span className="capitalize">{tour.status}</span></p>

                                {tour.inclusions.length > 0 && (
                                  <div className="mb-4">
                                    <p className="font-bold text-gray-800 mb-2">What's Included:</p>
                                    <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
                                      {tour.inclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                  </div>
                                )}

                                {tour.exclusions.length > 0 && (
                                  <div className="mb-6">
                                    <p className="font-bold text-gray-800 mb-2">What's Not Included:</p>
                                    <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
                                      {tour.exclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                  </div>
                                )}

                                {activeTab === 'upcoming' && (
                                  <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                    <button
                                      onClick={() =>
                                        setShowItineraryTourId(
                                          showItineraryTourId === tour.id ? null : tour.id
                                        )
                                      }
                                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-lg font-medium"
                                    >
                                      {showItineraryTourId === tour.id ? 'Hide Itinerary' : 'View Itinerary'}
                                    </button>

                                    {showItineraryTourId === tour.id && tour.itinerary.length > 0 && (
                                      <div className="mt-4 bg-blue-50 p-5 rounded-lg shadow-inner w-full">
                                        <h4 className="text-lg font-semibold text-blue-800 mb-3">Detailed Itinerary:</h4>
                                        <ul className="space-y-5">
                                          {tour.itinerary.map((item, i) => (
                                            <li key={item._id || i} className="border-l-4 border-blue-300 pl-4">
                                              <p className="text-blue-700 text-md font-bold mb-1">Day {item.dayNumber}: {item.title}</p>
                                              <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                                              {item.activities?.length > 0 && (
                                                <ul className="ml-4 list-disc text-gray-600 text-sm space-y-0.5">
                                                  {item.activities.map((act, j) => (
                                                    <li key={j} className="flex items-center"><span className="mr-2 text-blue-400">&bull;</span> {act.title} - <span className="font-medium ml-1">{act.time}</span></li>
                                                  ))}
                                                </ul>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    <button className="px-6 py-3 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 text-lg font-medium">
                                      Cancel Tour
                                    </button>
                                  </div>
                                )}

                                {activeTab === 'previous' && (
                                  <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-medium">
                                    Book Again
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : ( /* Complaints Tab Content */
                <div className="mt-8">
                  <div className="flex border-b border-gray-200 mb-8">
                    <button
                      className={`py-3 px-6 font-semibold flex items-center transition-all duration-300 ${activeComplaintSubTab === 'ongoing' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
                      onClick={() => setActiveComplaintSubTab('ongoing')}
                    >
                      Ongoing <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{ongoingComplaints.length}</span>
                    </button>
                    <button
                      className={`py-3 px-6 font-semibold flex items-center transition-all duration-300 ${activeComplaintSubTab === 'resolved' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
                      onClick={() => setActiveComplaintSubTab('resolved')}
                    >
                      Resolved <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{resolvedComplaints.length}</span>
                    </button>
                  </div>

                  {(activeComplaintSubTab === 'ongoing' ? ongoingComplaints : resolvedComplaints).length === 0 ? (
                    <div className="text-center py-16 text-gray-600">
                      <FiFileText className="mx-auto text-6xl text-gray-400 mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                        {activeComplaintSubTab === 'ongoing' ? 'No ongoing complaints.' : 'No resolved complaints.'}
                      </h3>
                      <p className="text-gray-500 text-lg mt-2">
                        {activeComplaintSubTab === 'ongoing' ?
                          'All your active complaints will appear here for tracking.' :
                          'Your completed complaints will be archived here.'}
                      </p>
                    </div>
                  ) : (
                    (activeComplaintSubTab === 'ongoing' ? ongoingComplaints : resolvedComplaints).map(complaint => (
                      <div key={complaint._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-6 border border-gray-100">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800 mb-1">{complaint.subject}</h2>
                              <p className="text-sm text-gray-600">Type: <span className="font-medium">{complaint.type}</span></p>
                              <p className="text-sm text-gray-600">Filed on: <span className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</span></p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${
                                complaint.status === 'open' ? 'bg-red-100 text-red-800' :
                                complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </div>

                          <button onClick={() => toggleComplaintExpand(complaint._id)} className="mt-2 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 self-start">
                            {expandedComplaintId === complaint._id ? (
                              <>
                                <span className="font-medium">Hide conversation</span>
                                <FiChevronUp className="ml-1 text-lg" />
                              </>
                            ) : (
                              <>
                                <span className="font-medium">View conversation history</span>
                                <FiChevronDown className="ml-1 text-lg" />
                              </>
                            )}
                          </button>

                          {expandedComplaintId === complaint._id && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <p className="text-gray-700 leading-relaxed mb-4">
                                <span className="font-bold text-gray-800">Your Original Description: </span>
                                {complaint.description}
                              </p>
                              {complaint.preferredResolution && (
                                <p className="text-gray-700 leading-relaxed mb-4">
                                  <span className="font-bold text-gray-800">Your Preferred Resolution: </span>
                                  {complaint.preferredResolution}
                                </p>
                              )}
                               {complaint.agentInfo?.name && (
                                <p className="text-gray-700 leading-relaxed mb-4">
                                  <span className="font-bold text-gray-800">Assigned Agent: </span>
                                  {complaint.agentInfo.name}
                                  {complaint.agentInfo.id && ` (ID: ${complaint.agentInfo.id})`}
                                </p>
                              )}

                              <h3 className="font-bold text-gray-900 mb-4 text-xl">Conversation History</h3>
                              {/* --- MODIFIED SCROLL AREA --- */}
                              <div className="relative"> {/* Added relative for positioning absolute gradients */}
                                <div className="space-y-4 h-60 overflow-y-auto pr-2 custom-scrollbar p-2 bg-gray-50 rounded-lg shadow-inner">
                                  {complaint.adminReplies.length === 0 ? (
                                    <p className="text-gray-600 text-sm text-center py-4">No messages in this conversation yet.</p>
                                  ) : (
                                    complaint.adminReplies.map((reply, index) => {
                                      const isCustomerReply = reply.repliedByType === 'Customer';
                                      const senderName = isCustomerReply ? 'You' : 'Admin';

                                      return (
                                        <div
                                          key={index}
                                          className={`p-4 rounded-xl shadow-sm ${
                                            isCustomerReply
                                              ? 'bg-blue-100 self-end ml-auto max-w-[80%]'
                                              : 'bg-gray-200 self-start mr-auto max-w-[80%]'
                                          }`}
                                        >
                                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                                            <span className="font-bold text-sm">
                                              {senderName}
                                            </span>
                                            <span className="text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
                                          </div>
                                          <p className="text-gray-800 text-base whitespace-pre-line break-words">{reply.message}</p>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                                {/* Top fade gradient */}
                                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none"></div>
                                {/* Bottom fade gradient */}
                                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                              </div>
                              {/* --- END MODIFIED SCROLL AREA --- */}

                              {/* Message Input for Ongoing Complaints */}
                              {complaint.status !== 'resolved' && activeComplaintSubTab === 'ongoing' && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                  <h3 className="font-bold text-gray-900 mb-3 text-xl">Send a New Message</h3>
                                  <textarea
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4 text-gray-700 resize-y"
                                    rows="4"
                                    placeholder="Type your message here..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                  ></textarea>
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => handleSendMessage(complaint._id)}
                                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                      <FiMessageSquare className="mr-2 text-xl" /> Send Message
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Display a message if complaint is resolved */}
                              {complaint.status === 'resolved' && (
                                <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-600">
                                  <p className="font-semibold text-xl mb-2">This complaint has been resolved!</p>
                                  <p className="text-md">You cannot send further messages for resolved complaints.</p>
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