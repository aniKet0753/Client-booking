import React, { useEffect, useState } from 'react';
import axios from '../api';
import { ChevronDown, ChevronUp, XCircle, CheckCircle, UserX } from 'lucide-react'; // Added UserX icon

const BookingHistory = () => {
  const [filter, setFilter] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals for general confirmations/info
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // States for individual traveler cancellation
  const [showTravelerSelectionModal, setShowTravelerSelectionModal] = useState(false);
  const [currentBookingForCancellation, setCurrentBookingForCancellation] = useState(null); // The booking object being modified
  const [selectedTravelerIds, setSelectedTravelerIds] = useState(new Set()); // Set to store _id of selected travelers
  // agentCancellationReason state is now managed internally by TravelerSelectionModal
  // const [agentCancellationReason, setAgentCancellationReason] = useState(''); // Removed from here

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('/api/agents/my-full-bookings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('Token')}`,
          },
        });
  console.log(res)

        if (Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          console.error('API response data is not an array:', res.data);
          setModalMessage('Received invalid data from the server. Please check the backend API.');
          setShowInfoModal(true);
          setBookings([]);
        }
      } catch (err) {
        console.error('Failed to fetch booking history:', err);
        setModalMessage('Failed to fetch booking history. Please check your network or backend server.');
        setShowInfoModal(true);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Function to toggle the expansion of booking details
  const toggleExpand = (bookingId) => {
    setExpanded((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  // Handler to open the traveler selection modal
  const handleCancelBookingClick = (booking) => {
    setCurrentBookingForCancellation(booking);
    setSelectedTravelerIds(new Set()); // Clear previous selections
    // setAgentCancellationReason(''); // No longer needed here as state is internal to modal
    setShowTravelerSelectionModal(true);
  };

  // Handler for selecting/deselecting individual travelers
  const handleTravelerSelect = (travelerId) => {
    setSelectedTravelerIds((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(travelerId)) {
        newSelection.delete(travelerId);
      } else {
        newSelection.add(travelerId);
      }
      return newSelection;
    });
  };

  // Handler to confirm cancellation of selected travelers - now receives reason from modal
  const confirmTravelersCancellation = async (reasonFromModal) => {
    setShowTravelerSelectionModal(false); // Close selection modal

    if (!currentBookingForCancellation || selectedTravelerIds.size === 0) {
      setModalMessage('No travelers selected for cancellation or no booking active.');
      setShowInfoModal(true);
      return;
    }

    setModalMessage(`Confirm cancellation for ${selectedTravelerIds.size} traveler(s)?`);
    // Pass the reason to executeTravelersCancellation via state or directly
    // Using a temporary state or directly passing to confirm callback is better
    // For simplicity, let's modify executeTravelersCancellation to accept reason.
    executeTravelersCancellation(reasonFromModal);
  };


  // Actual API call for canceling selected travelers
  const executeTravelersCancellation = async (reason) => { // Now accepts reason
    setShowConfirmModal(false); // Close confirmation modal (if still open from previous flow)

    try {
      const bookingId = currentBookingForCancellation.bookingID;
      const travelerIdsArray = Array.from(selectedTravelerIds);

      // Pointing to the consolidated cancellation API endpoint and sending agentCancellationReason
      const res = await axios.put(`/api/agents/cancel-booking/${bookingId}`, {
        travelerIds: travelerIdsArray,
        cancellationReason: reason // Send the reason received from modal
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
          'Content-Type': 'application/json'
        },
      });

      setModalMessage(res.data.message || 'Selected travelers cancellation request sent successfully.');
      setShowInfoModal(true);

      // Optimistically update frontend state
      setBookings((prevBookings) =>
        prevBookings.map((booking) => {
          if (booking.bookingID === bookingId) {
            return {
              ...booking,
              travelers: booking.travelers.map((traveler) =>
                travelerIdsArray.includes(traveler._id)
                  ? {
                      ...traveler,
                      cancellationRequested: true,
                      cancellationApproved: false,
                      cancellationRejected: false,
                      cancellationReason: reason // Set the reason provided by agent
                    }
                  : traveler
              ),
            };
          }
          return booking;
        })
      );
    } catch (err) {
      console.error('Cancellation of selected travelers failed:', err);
      setModalMessage(err.response?.data?.message || 'Failed to cancel selected travelers. Please try again.');
      setShowInfoModal(true);
    } finally {
      setCurrentBookingForCancellation(null);
      setSelectedTravelerIds(new Set());
      // setAgentCancellationReason(''); // No longer needed here
    }
  };


  // Helper function to parse date string (e.g., "YYYY-MM-DD")
  const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('-')) {
      console.warn('Invalid date string received:', dateStr);
      return new Date();
    }
    const [yyyy, mm, dd] = dateStr.split('-');
    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const groupedBookings = {
    active: safeBookings.filter(b => b.travelers.some(t => !t.cancellationRequested && !t.cancellationApproved && !t.cancellationRejected)), // Active if at least one traveler is active
    requested: safeBookings.filter(b => b.travelers.some(t => t.cancellationRequested && !t.cancellationApproved && !t.cancellationRejected)), // Requested if at least one traveler is requested
    approved: safeBookings.filter(b => b.travelers.some(t => t.cancellationApproved)), // Approved if at least one traveler is approved
    rejected: safeBookings.filter(b => b.travelers.some(t => t.cancellationRejected)), // Rejected if at least one traveler is rejected
  };


  const getFilteredBookings = () => {
    switch (filter) {
      case 'requested': return { title: 'Cancellation Requested (Travelers)', items: groupedBookings.requested, color: 'yellow' };
      case 'approved': return { title: 'Cancellation Approved (Travelers)', items: groupedBookings.approved, color: 'green' };
      case 'rejected': return { title: 'Cancellation Rejected (Travelers)', items: groupedBookings.rejected, color: 'red' };
      case 'active':
      default: return { title: 'Active Bookings', items: groupedBookings.active, color: 'indigo' };
    }
  };

  const filtered = getFilteredBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-lg font-medium text-gray-700">Loading booking history...</div>
      </div>
    );
  }

  // Render a section of bookings based on title, items, and color
  const renderSection = (title, items, color = 'gray') => (
    <div className="mb-12">
      <h3 className={`text-2xl font-bold mb-6 text-${color}-700 border-b-2 border-${color}-400 pb-3`}>
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <div className="text-md text-gray-500 bg-white p-4 rounded-lg shadow-sm">No bookings in this section.</div>
      ) : (
        <div className="space-y-6">
          {items.map(booking => {
            const tourDate = parseCustomDate(booking.tour.startDate);
            const now = new Date();
            // A booking is cancelable if its tour date is in the future
            // and there's at least one traveler not yet requested for cancellation.
            const hasCancelableTravelers = booking.travelers.some(t => !t.cancellationRequested && !t.cancellationApproved && !t.cancellationRejected);
            const isCancelable = tourDate > now && hasCancelableTravelers;

            return (
              <div
                key={booking.bookingID}
                className="bg-white border border-gray-200 shadow-md rounded-xl p-5 hover:shadow-lg transition-all duration-300 ease-in-out"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-indigo-800">
                      🎟️ Booking ID: <span className="font-semibold text-gray-700">{booking.bookingID}</span>
                    </div>
                    <div className="text-base text-gray-700">
                      🌍 Tour Name: <span className="font-medium">{booking.tour.name}</span>
                    </div>
                    <div className="text-base text-gray-600">
                      👥 Total Travelers: <span className="font-medium">{booking.travelers.length}</span>
                    </div>
                    <div className="text-base text-gray-600">
                      📅 Tour Date: <span className="font-medium">{tourDate.toLocaleDateString()}</span>
                    </div>
                    <div className="text-base text-gray-600">
                      💵 Price/Head: <span className="font-medium">₹{booking.tour.pricePerHead.toFixed(2)}</span>
                    </div>
                    <div className="text-lg text-green-700 font-bold">
                      📦 Total Paid: <span className="font-semibold">₹{booking.payment.paidAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <button
                      onClick={() => toggleExpand(booking.bookingID)}
                      className="text-base text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-medium transition-colors"
                    >
                      {expanded[booking.bookingID] ? (
                        <>Hide Details <ChevronUp size={18} /></>
                      ) : (
                        <>View Details <ChevronDown size={18} /></>
                      )}
                    </button>
                    {isCancelable && (
                      <button
                        onClick={() => handleCancelBookingClick(booking)} // Pass entire booking object
                        className="mt-2 bg-red-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                      >
                        Cancel Travelers
                      </button>
                    )}
                    {/* Display overall booking status based on its travelers */}
                    {booking.travelers.some(t => t.cancellationRequested && !t.cancellationApproved && !t.cancellationRejected) && (
                      <span className="text-yellow-600 mt-1 text-md font-semibold flex items-center gap-1">
                        <span className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></span> Some Travelers Pending
                      </span>
                    )}
                    {booking.travelers.every(t => t.cancellationApproved) && ( // If ALL travelers are approved cancelled
                      <span className="text-green-600 mt-1 text-md font-semibold flex items-center gap-1">
                        <CheckCircle size={18} /> All Travelers Approved Cancelled
                      </span>
                    )}
                     {booking.travelers.every(t => t.cancellationRejected) && ( // If ALL travelers are rejected cancelled
                      <span className="text-red-600 mt-1 text-md font-semibold flex items-center gap-1">
                        <XCircle size={18} /> All Travelers Rejected
                      </span>
                    )}
                  </div>
                </div>

                {expanded[booking.bookingID] && (
                  <div className="mt-6 border-t border-gray-200 pt-4 text-base text-gray-800 space-y-2">
                    <div className="font-semibold text-lg mb-2">Detailed Information:</div>
                    <div>📧 <strong>Customer Email:</strong> <span className="text-gray-700">{booking.customer.email}</span></div>
                    <div>👤 <strong>Customer Name:</strong> <span className="text-gray-700">{booking.customer.name}</span></div>
                    <div>🆔 <strong>Booking Date:</strong> <span className="text-gray-700">{new Date(booking.bookingDate).toLocaleDateString()}</span></div>
                    <div>💰 <strong>Payment Status:</strong> <span className={`font-semibold ${booking.payment.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>{booking.payment.paymentStatus}</span></div>
                    {booking.agent && (
                      <div>🧑‍💼 <strong>Booked by Agent:</strong> <span className="text-gray-700">{booking.agent.name} ({booking.agent.agentId})</span></div>
                    )}
                    <div className="mt-4">
                      <h4 className="font-semibold text-md mb-2 border-b border-gray-200 pb-1">Travelers:</h4>
                      {booking.travelers.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {booking.travelers.map((traveler) => (
                            <li key={traveler._id} className="flex items-center gap-2 text-gray-700">
                               <span>{traveler.name} (Age: {traveler.age}, Gender: {traveler.gender})</span>
                               {traveler.cancellationRequested && <span className="text-yellow-600 text-sm font-semibold flex items-center gap-1"><UserX size={14}/>Requested</span>}
                               {traveler.cancellationApproved && <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><CheckCircle size={14}/>Approved</span>}
                               {traveler.cancellationRejected && <span className="text-red-600 text-sm font-semibold flex items-center gap-1"><XCircle size={14}/>Rejected</span>}
                               {traveler.cancellationReason && (
                                <span className="text-gray-500 text-xs">(Reason: {traveler.cancellationReason})</span>
                               )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No traveler details available.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Custom Confirmation Modal Component (for final confirmation)
  const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <div className="text-lg font-semibold text-gray-800 mb-4">{message}</div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Custom Info Modal Component (for alerts)
  const InfoModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <div className="text-lg font-semibold text-gray-800 mb-4">{message}</div>
        <button
          onClick={onClose}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  // New Modal for Traveler Selection
  // This component now manages its own 'reason' state internally
  const TravelerSelectionModal = ({ booking, selectedIds, onSelect, onConfirm, onClose }) => {
    const [reason, setReason] = useState(''); // State moved inside the modal

    // Filter out travelers who are already cancelled or have pending requests
    const availableTravelers = booking.travelers.filter(t =>
      !t.cancellationRequested && !t.cancellationApproved && !t.cancellationRejected
    );

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Select Travelers to Cancel for Booking ID: {booking.bookingID}</h3>
          {availableTravelers.length === 0 ? (
            <p className="text-gray-600">All travelers in this booking are already cancelled or have pending requests.</p>
          ) : (
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {availableTravelers.map((traveler) => (
                <div key={traveler._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    id={`traveler-${traveler._id}`}
                    checked={selectedIds.has(traveler._id)}
                    onChange={() => onSelect(traveler._id)}
                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`traveler-${traveler._id}`} className="text-gray-800 text-base font-medium flex-grow cursor-pointer">
                    {traveler.name} (Age: {traveler.age}, Gender: {traveler.gender})
                  </label>
                </div>
              ))}
            </div>
          )}

          <label className="block mb-4">
            Reason for Cancellation (Optional):
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Change of plans, unforeseen circumstances"
            ></textarea>
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onConfirm(reason)} // Pass the internal reason state to onConfirm
              disabled={selectedIds.size === 0}
              className={`font-bold py-2 px-4 rounded-md transition-colors ${
                selectedIds.size === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Confirm Cancellation ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-indigo-700 border-b-4 border-indigo-300 pb-4">
        Your Booking History
      </h2>

      <div className="mb-10 flex justify-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-6 py-3 shadow-md text-gray-700 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        >
          <option value="active">Active Bookings</option>
          <option value="requested">Pending Cancellations (Travelers)</option>
          <option value="approved">Approved Cancellations (Travelers)</option>
          <option value="rejected">Rejected Cancellations (Travelers)</option>
        </select>
      </div>

      {renderSection(filtered.title, filtered.items, filtered.color)}

      {showConfirmModal && (
        <ConfirmationModal
          message={modalMessage}
          onConfirm={executeTravelersCancellation} // This will now receive the reason from confirmTravelersCancellation
          onCancel={() => { setShowConfirmModal(false); setCurrentBookingForCancellation(null); setSelectedTravelerIds(new Set()); /* setAgentCancellationReason(''); */ }}
        />
      )}

      {showInfoModal && (
        <InfoModal
          message={modalMessage}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {showTravelerSelectionModal && currentBookingForCancellation && (
        <TravelerSelectionModal
          booking={currentBookingForCancellation}
          selectedIds={selectedTravelerIds}
          onSelect={handleTravelerSelect}
          onConfirm={confirmTravelersCancellation} // Now expects to receive reason from modal
          onClose={() => { setShowTravelerSelectionModal(false); setCurrentBookingForCancellation(null); setSelectedTravelerIds(new Set()); /* setAgentCancellationReason(''); */ }}
          // reason={agentCancellationReason} // Removed these props
          // setReason={setAgentCancellationReason} // Removed these props
        />
      )}
    </div>
  );
};

export default BookingHistory;
