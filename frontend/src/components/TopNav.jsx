import React, { useEffect, useState } from 'react';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoon as faMoonRegular,
  faQuestionCircle as faQuestionCircleRegular,
  faBell as faBellRegular,
  faTimes,
  faArrowDown,
  faArrowUp,
  faCopy
} from '@fortawesome/free-solid-svg-icons';

function TopNav({ collapsed }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState(null);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeTab, setActiveTab] = useState('completed');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('Token');
  const role = localStorage.getItem('role');

  const fetchProfile = async () => {
    try {
      const route = role === 'superadmin' || role === 'admin' ? '/api/admin/profile' : '/api/agents/profile';
      const res = await axios.get(route, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role,
        },
      });
      setProfile(res.data);
    } catch (err) {
      setMessage({
        text: 'Error: ' + (err.response?.data?.error || 'Failed to fetch profile'),
        type: 'error',
      });
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const route = role === 'superadmin' || role === 'admin' 
        ? '/api/admin/transactions' 
        : '/api/agents/transactions';
      
      const res = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`,
          role,
        },
      });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (showWalletModal) {
      fetchTransactions();
    }
  }, [showWalletModal, activeTab]);

  if (role == 'superadmin') {
    useEffect(() => {
      const fetchInactiveUsers = async () => {
        try {
          const res = await axios.get('/api/admin/inactive-count', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setInactiveCount(res.data.count);
        } catch (error) {
          console.error('Failed to fetch inactive user count:', error);
        }
      };
      fetchInactiveUsers();
      const intervalId = setInterval(fetchInactiveUsers, 2000);
      return () => clearInterval(intervalId);
    }, []);
  }

  const copyToClipboard = () => {
    if (profile?._id) {
      navigator.clipboard.writeText(profile._id);
      alert("Referral code copied to clipboard!");
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'completed') return tx.status === 'completed';
    if (activeTab === 'pending') return tx.status === 'pending';
    return true;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <nav className="bg-white p-4 flex justify-between items-center shadow-md pl-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hi {profile?.name || 'User'}</h1>
          {profile?._id && role !== 'superadmin' && (
            <div className="text-sm text-gray-600 mt-1">
              Your Referral Code:
              <span
                className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                onClick={copyToClipboard}
                title="Click to copy"
              >
                {profile._id}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowWalletModal(true)}
            className="text-lg font-bold text-gray-800 bg-gray-100 rounded p-2 hover:bg-gray-200 transition-colors duration-200 flex items-center cursor-pointer"
          >
            {/*  wallet: {profile?.walletBalance || 0} */}
            <span className='mb-1 me-2'>💳</span> Commision

          </button>
          <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
            <FontAwesomeIcon icon={faMoonRegular} />
          </button>
          <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
            <FontAwesomeIcon icon={faQuestionCircleRegular} />
          </button>
          <button className="bg-gray-100 p-2 rounded-full relative hover:bg-gray-200 transition-colors duration-200">
            <FontAwesomeIcon icon={faBellRegular} />
            {inactiveCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {inactiveCount}
              </span>
            )}
          </button>
          <img
            src={profile?.photo || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </nav>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Wallet Details</h2>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Incoming Payments:</span>
                <span className="text-2xl font-bold">₹{profile?.walletBalance || 0}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <button 
                  onClick={copyToClipboard}
                  className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-1" />
                  Copy ID
                </button>
              </div>
            </div>
            
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
            
            <div className="overflow-y-auto max-h-[50vh]">
              {isLoading ? (
                <div className="p-4 text-center">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No {activeTab === 'completed' ? 'completed' : 'pending'} transactions found
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
      )}
    </>
  );
}

export default TopNav;