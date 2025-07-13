import React, { useEffect, useState } from 'react';
import axios from '../api'; // Assuming 'api' is in the same parent directory or configured
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faArrowDown,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';


function WalletModal({ profile, role, showWalletModal, setShowWalletModal }) {
  const [activeTab, setActiveTab] = useState('completed');
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [totalIncomingPayments, setTotalIncomingPayments] = useState(null);
  const token = localStorage.getItem('Token');

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      // Changed API endpoint to /my-commission-overview as requested
      const route = '/api/agents/my-commission-overview';

      const res = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`,
          role, // Still sending role, though the new endpoint might not differentiate based on it
        },
      });
      console.log(res)
      setTotalIncomingPayments(res.data.totalIncomingPayments);
      setTransactions(res.data.transactions || []); // Assuming the response structure remains the same
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      // Optionally, set an error message state here to display to the user
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Effect hook to fetch transactions whenever the modal is shown or the active tab changes
  useEffect(() => {
    if (showWalletModal) {
      fetchTransactions();
    }
  }, [showWalletModal, activeTab, role, token]); // Added role and token to dependencies for correctness

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'completed') return tx.status === 'completed';
    if (activeTab === 'pending') return tx.status === 'pending';
    return true; // Should not happen with current tabs, but good for robustness
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Only render the modal if showWalletModal is true
  if (!showWalletModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Wallet Details</h2>
          <button
            onClick={() => setShowWalletModal(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close wallet modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Wallet Balance Section */}
        <div className="p-4 bg-blue-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Incoming Payments:</span>
            <span className="text-2xl font-bold">₹{totalIncomingPayments || 0}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 font-medium ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            Received Payments
          </button>
          <button
            className={`flex-1 py-3 font-medium ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Incoming Payments
          </button>
        </div>

        {/* Transactions List */}
        <div className="overflow-y-auto max-h-[50vh]">
          {isLoadingTransactions ? (
            <div className="p-4 text-center">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No {activeTab === 'completed' ? 'received' : 'incoming'} payments found
            </div>
          ) : (
            <ul className="divide-y">
              {filteredTransactions.map((tx) => (
                <li key={tx._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <FontAwesomeIcon icon={tx.type === 'credit' ? faArrowDown : faArrowUp} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{tx.description || (tx.type === 'credit' ? 'Credit' : 'Debit')}</p>
                        <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => setShowWalletModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;