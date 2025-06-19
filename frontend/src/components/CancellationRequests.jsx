import { useEffect, useState } from "react";
import axios from "../api";
import { XCircle, CheckCircle, Info, UserCheck, UserX } from 'lucide-react'; // Added more icons

const CancellationRequests = () => {
  const [requests, setRequests] = useState([]); // This will now hold Booking objects
  const [loading, setLoading] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false); // For approval
  const [showReasonModal, setShowReasonModal] = useState(false); // For rejection
  const [selectedTravelerForApproval, setSelectedTravelerForApproval] = useState(null); // {bookingId, travelerId, tourPricePerHead}
  const [selectedTravelerForRejection, setSelectedTravelerForRejection] = useState(null); // {bookingId, travelerId}
  const [deductionPercentage, setDeductionPercentage] = useState(10);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const token = localStorage.getItem('Token');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch pending cancellations from the updated backend endpoint
      const res = await axios.get("/api/admin/pending-cancellations", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(res.data)
      // The backend now returns 'pending' as an array of Booking objects
      const pendingBookings = Array.isArray(res.data.pending) ? res.data.pending : [];

      setRequests(pendingBookings);
    } catch (err) {
      console.error("Error fetching cancellations:", err);
      setInfoMessage(err.response?.data?.error || "Failed to fetch pending cancellation requests.");
      setShowInfoModal(true);
      setRequests([]); // Ensure requests is an array even on error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [token]); // Depend on token to refetch if token changes

  // Helper to close all specific action modals
  const resetModals = () => {
    setShowDeductionModal(false);
    setShowReasonModal(false);
    setSelectedTravelerForApproval(null);
    setSelectedTravelerForRejection(null);
    setDeductionPercentage(10);
    setRejectionReason('');
  };

  // --- Handlers for actions ---
  const handleApproveClick = (bookingId, travelerId, tourPricePerHead) => {
    setSelectedTravelerForApproval({ bookingId, travelerId, tourPricePerHead });
    setShowDeductionModal(true);
  };

  const handleRejectClick = (bookingId, travelerId) => {
    setSelectedTravelerForRejection({ bookingId, travelerId });
    setShowReasonModal(true);
  };

  const processCancellation = async (action, reason = '') => {
    let bookingId, travelerId, payload;

    if (action === 'approve') {
      bookingId = selectedTravelerForApproval.bookingId;
      travelerId = selectedTravelerForApproval.travelerId;
      payload = {
        travelerIds: [travelerId],
        action: 'approve',
        deductionPercentage: deductionPercentage,
        cancellationReason: reason // Will be empty string if not provided for approval
      };
    } else if (action === 'reject') {
      bookingId = selectedTravelerForRejection.bookingId;
      travelerId = selectedTravelerForRejection.travelerId;
      payload = {
        travelerIds: [travelerId],
        action: 'reject',
        cancellationReason: reason
      };
    } else {
      setInfoMessage("Invalid action.");
      setShowInfoModal(true);
      resetModals();
      return;
    }

    try {
      const res = await axios.put(`/api/admin/process-cancellation/${bookingId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setInfoMessage(res.data.message);
      setShowInfoModal(true);
      fetchRequests(); // Re-fetch all requests to update UI
    } catch (err) {
      console.error("Error processing cancellation:", err);
      setInfoMessage(err.response?.data?.message || "Failed to process cancellation.");
      setShowInfoModal(true);
    } finally {
      resetModals(); // Close all related modals
    }
  };

  // --- Modals ---
  const DeductionModal = ({ onClose, onConfirm, currentTraveler, deduction, setDeduction }) => {
    if (!currentTraveler) return null;
    const estimatedRefund = currentTraveler.tourPricePerHead * ((100 - deduction) / 100);

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Approve Cancellation</h3>
          <p className="mb-2">Traveler: <strong>{currentTraveler.travelerName}</strong></p>
          <p className="mb-2">Booking ID: <strong>{currentTraveler.bookingId}</strong></p>
          <p className="mb-4">Original Price/Head: <strong>₹{currentTraveler.tourPricePerHead?.toFixed(2)}</strong></p>

          <label className="block mb-4">
            Deduction Percentage (%):
            <input
              type="number"
              value={deduction}
              min={0}
              max={100}
              onChange={(e) => setDeduction(Number(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>
          <p className="text-lg font-semibold text-green-700 mb-6">
            Estimated Refund: ₹{estimatedRefund.toFixed(2)}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReasonModal = ({ onClose, onConfirm, currentTraveler, reason, setReason }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Cancellation</h3>
        <p className="mb-2">Traveler: <strong>{currentTraveler?.travelerName}</strong></p>
        <p className="mb-4">Booking ID: <strong>{currentTraveler?.bookingId}</strong></p>
        <label className="block mb-4">
          Reason for Rejection (Optional):
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          ></textarea>
        </label>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  const InfoModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <div className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <Info size={24} className="text-blue-500"/> {message}
        </div>
        <button
          onClick={onClose}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700 border-b-4 border-indigo-300 pb-3">
        Pending Traveler Cancellation Requests
      </h2>
      {loading ? (
        <div className="text-center text-lg text-gray-600 py-8">Loading pending requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-lg text-gray-600 py-8 bg-white p-4 rounded-lg shadow-sm">
          No pending traveler cancellation requests at this time.
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((booking) => (
            <div key={booking.bookingID} className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
              <div className="mb-4 pb-3 border-b border-gray-200">
                <p className="text-lg font-bold text-indigo-700">Booking ID: <span className="font-semibold text-gray-800">{booking.bookingID}</span></p>
                <p className="text-md text-gray-700">Tour: <span className="font-medium">{booking.tour.name}</span></p>
                <p className="text-sm text-gray-600">Agent: <span className="font-medium">{booking.agent.name} ({booking.agent.agentId})</span></p>
                <p className="text-sm text-gray-600">Tour Date: <span className="font-medium">{new Date(booking.tour.startDate).toLocaleDateString()}</span></p>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">Travelers with Pending Requests:</h3>
              <div className="space-y-4">
                {booking.travelers.map((traveler) => (
                  // Only render travelers with pending cancellation requests
                  traveler.cancellationRequested && !traveler.cancellationApproved && !traveler.cancellationRejected && (
                    <div key={traveler._id} className="bg-gray-50 p-4 rounded-md border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-grow">
                        <p className="text-base font-medium text-gray-900">{traveler.name}</p>
                        <p className="text-sm text-gray-600">Age: {traveler.age}, Gender: {traveler.gender}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                          onClick={() => handleApproveClick(booking.bookingID, traveler._id, booking.tour.pricePerHead)}
                        >
                          <UserCheck size={18}/> Approve
                        </button>
                        <button
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                          onClick={() => handleRejectClick(booking.bookingID, traveler._id)}
                        >
                          <UserX size={18}/> Reject
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Modals */}
      {showDeductionModal && selectedTravelerForApproval && (
        <DeductionModal
          onClose={resetModals}
          onConfirm={() => processCancellation('approve', '')} // Reason not needed for approval in this setup
          currentTraveler={{
            ...selectedTravelerForApproval,
            travelerName: requests.flatMap(b => b.travelers).find(t => t._id === selectedTravelerForApproval.travelerId)?.name
          }}
          deduction={deductionPercentage}
          setDeduction={setDeductionPercentage}
        />
      )}

      {showReasonModal && selectedTravelerForRejection && (
        <ReasonModal
          onClose={resetModals}
          onConfirm={() => processCancellation('reject', rejectionReason)}
          currentTraveler={{
            ...selectedTravelerForRejection,
            travelerName: requests.flatMap(b => b.travelers).find(t => t._id === selectedTravelerForRejection.travelerId)?.name
          }}
          reason={rejectionReason}
          setReason={setRejectionReason}
        />
      )}

      {showInfoModal && (
        <InfoModal
          message={infoMessage}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
};

export default CancellationRequests;
