import { useEffect, useState } from "react";
import axios from "../api";

const CancellationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deduction, setDeduction] = useState(10);
  const [cancellations, setCancellations] = useState([]);
  const token = localStorage.getItem('Token');
  // const fetchRequests = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.get("/api/admin/pending-cancellations",
  //        { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     console.log(res.data.pending)
  //     setRequests(res.data.pending);
  //   } catch (err) {
  //     console.error("Error fetching cancellations:", err);
  //   }
  //   setLoading(false);
  // };

  const fetchRequests = async () => {
  setLoading(true);
  try {
    const res = await axios.get("/api/admin/pending-cancellations", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const pending = res.data.pending;

    // Fetch tour details for each transaction in parallel
    const enrichedRequests = await Promise.all(
      pending.map(async (txn) => {
        try {
          const tourRes = await axios.get(`/api/admin/tours/${txn.tourID}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const tour = tourRes.data.tour;

          return {
            ...txn,
            tourName: tour.name || "Unknown",
            totalPriceTour: tour.price || 0
          };
        } catch (tourErr) {
          console.error("Error fetching tour details for:", txn.tourID, tourErr);
          return {
            ...txn,
            tourName: "Unknown",
            totalPriceTour: 0
          };
        }
      })
    );

    setRequests(enrichedRequests);
  } catch (err) {
    console.error("Error fetching cancellations:", err);
  }
  setLoading(false);
};

  useEffect(() => {
    fetchRequests();
  }, []);

    const approveCancellation = async (transactionId) => {
    try {
        await axios.put(`/api/admin/approve-cancellation/${transactionId}`,
            { deductionPercentage: deduction },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
                }
            }
        );
      alert("Cancellation approved");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to approve cancellation");
    }
  };

  const rejectCancellation = async (transactionId) => {
    try {
      await axios.put(`/api/admin/reject-cancellation/${transactionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Cancellation rejected");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to reject cancellation");
    }
  };

    return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Pending Cancellation Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : !Array.isArray(requests) || requests.length === 0 ? (
        <p>No pending requests</p>
        ) : (
        <div className="space-y-6">
          {requests.map((txn) => (
            <div key={txn._id} className="bg-white p-4 shadow rounded">
              <p><strong>Transaction ID:</strong> {txn.transactionId}</p>
              <p><strong>Agent ID:</strong> {txn.agentID}</p>
              <p><strong>Tour Name:</strong> {txn.tourName}</p>
              <p><strong>Total Price:</strong> ₹{txn.totalPriceTour}</p>
              <p><strong>Start Date:</strong> {new Date(txn.tourStartDate).toLocaleDateString()}</p>

              <div className="flex items-center gap-4 mt-4">
                <label>
                  Deduction (%):
                  <input
                    type="number"
                    value={deduction}
                    min={0}
                    max={100}
                    onChange={(e) => setDeduction(Number(e.target.value))}
                    className="ml-2 border p-1 w-20"
                  />
                </label>

                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => approveCancellation(txn.transactionId)}
                >
                  Approve
                </button>

                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => rejectCancellation(txn.transactionId)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CancellationRequests;