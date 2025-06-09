import React, { useEffect, useState } from 'react';
import axios from '../api'; 
import { ChevronDown, ChevronUp } from 'lucide-react';

const groupByTourID = (transactions) => {
  const grouped = {};
  transactions.forEach((txn) => {
    if (!grouped[txn.tourID]) grouped[txn.tourID] = [];
    grouped[txn.tourID].push(txn);
  });
  return grouped;
};

const CommissionHistory = () => {
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const currentAgentID = localStorage.getItem("agentID");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('/api/agents/commission-history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('Token')}`,
          },
        });
        setGroupedTransactions(groupByTourID(res.data.history));
      } catch (error) {
        console.error('Failed to fetch commission history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const toggleExpand = (tourID) => {
    setExpanded((prev) => ({ ...prev, [tourID]: !prev[tourID] }));
  };

  if (loading) return <div className="p-4 text-center">Loading commission history...</div>;

  const tourIDs = Object.keys(groupedTransactions);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-10 text-center text-indigo-700 border-b pb-4">Commission History</h2>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-4 rounded-lg mb-6 text-sm">
        <p><strong>🔹 Level 1:</strong> Direct commission earned from bookings made by you.</p>
        <p><strong>🔸 Level 2:</strong> Indirect commission earned from bookings made by agents referred by you (your subagents).</p>
      </div>

      {tourIDs.length === 0 ? (
        <div className="text-center text-gray-500">No transactions found.</div>
      ) : (
        <div className="space-y-8">
          {tourIDs.map((tourID) => {
            const txns = groupedTransactions[tourID];
            const tourPricePerHead = txns[0]?.tourPricePerHead;
            const totalBookingAmount = txns.reduce(
              (sum, txn) => sum + txn.tourPricePerHead * txn.tourGivenOccupancy,
              0
            );
            // const totalAgentCommission = txns.reduce((sum, txn) => {
            //   return (
            //     sum +
            //     txn.commissions
            //       .filter((c) => c.agentID === currentAgentID)
            //       .reduce((s, c) => s + c.commissionAmount, 0)
            //   );
            // }, 0);

            const totalAgentCommission = txns.reduce((sum, txn) => {
              return (
                sum +
                txn.commissions
                  .filter((c) => c.agentID === currentAgentID)
                  .reduce((s, c) => s + (c.commissionAmount - (c.commissionDeductionAmount || 0)), 0)
              );
            }, 0);

            return (
              <div
                key={tourID}
                className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="text-xl font-semibold text-indigo-800">🎟️ Tour ID: {tourID}</div>
                    <div className="text-sm text-gray-700">
                      💵 <span className="font-medium">Price per Head:</span> ₹{tourPricePerHead}
                    </div>
                    <div className="text-sm text-gray-700">
                      📦 <span className="font-medium">Total Booking Amount:</span> ₹{totalBookingAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      ✅ You received: ₹{totalAgentCommission.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(tourID)}
                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    {expanded[tourID] ? (
                      <>
                        Hide Details <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown size={16} />
                      </>
                    )}
                  </button> 
                </div>

                {expanded[tourID] && (
                  <div className="mt-6 border-t pt-6 space-y-6">
                    {txns.map((txn, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                          <div>
                            📧 <span className="font-semibold">Customer:</span> {txn.customerEmail}
                          </div>
                          <div>
                            📅 <span className="font-semibold">Date:</span> {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            👥 <span className="font-semibold">Occupancy:</span> {txn.tourGivenOccupancy}/{txn.tourActualOccupancy}
                          </div>
                          <div>
                            🆔 <span className="font-semibold">Transaction ID:</span> {txn.transactionId}
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-indigo-700 mb-2">🔍 Commissions</h4>
                          {txn.commissions.filter(c => c.agentID === currentAgentID).length === 0 ? (
                            <div className="text-gray-500">No commissions recorded for you.</div>
                          ) : (
                            <div className="space-y-2">
                              {/* {txn.commissions
                                .filter(c => c.agentID === currentAgentID)
                                .map((c, i) => (
                                  <div
                                    key={i}
                                    className={`px-4 py-2 rounded-lg w-fit max-w-full text-sm shadow-sm ${
                                      c.level === 1
                                        ? 'bg-indigo-100 text-indigo-900 font-medium'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {c.level === 1 ? (
                                      <>💼 Level 1: ₹{c.commissionAmount.toFixed(2)} ({c.commissionRate}% of booking)</>
                                    ) : (
                                      <>
                                        💼 Level {c.level}: ₹{c.commissionAmount.toFixed(2)} ({c.commissionRate}%) via <span className="font-semibold">{txn.agentID} ({txn.agentName})</span>
                                      </>
                                    )}
                                  </div>
                                ))} */}
                                {txn.commissions
                                .filter(c => c.agentID === currentAgentID)
                                .map((c, i) => (
                                  <div
                                    key={i}
                                    className={`px-4 py-2 rounded-lg w-fit max-w-full text-sm shadow-sm ${
                                      c.level === 1
                                        ? 'bg-indigo-100 text-indigo-900 font-medium'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {c.level === 1 ? (
                                      <>
                                        💼 Level 1: ₹{c.commissionAmount.toFixed(2)} ({c.commissionRate}% of booking)
                                      </>
                                    ) : (
                                      <>
                                        💼 Level {c.level}: ₹{c.commissionAmount.toFixed(2)} ({c.commissionRate}%) via{" "}
                                        <span className="font-semibold">
                                          {txn.agentID} ({txn.agentName})
                                        </span>
                                      </>
                                    )}
                                    {c.commissionDeductionAmount > 0 && (
                                      <div className="text-red-600 font-semibold ml-1 mt-1">
                                        -₹{c.commissionDeductionAmount.toFixed(2)} (deducted on cancellation)
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div> 
      )}
    </div>
  );
};

export default CommissionHistory;