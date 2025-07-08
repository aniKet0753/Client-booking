import { useState, useEffect } from 'react';
import axios from '../api';
import {
  FiSearch,
  FiRotateCcw,
  FiInfo,
  FiMessageSquare,
  FiMail,
  FiUser,
  FiCalendar,
  FiMessageCircle
} from 'react-icons/fi';

const SuperadminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [status, setStatus] = useState('open'); 
  const [filterType, setFilterType] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [filterType]); 

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = filterType === 'All'
        ? '/api/complaints'
        : `/api/complaints?status=${filterType}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
      });
      // console.log(res)
      setComplaints(Array.isArray(res.data) ? res.data : []);
      
      if (selectedComplaint && !res.data.some(c => c._id === selectedComplaint._id)) {
        setSelectedComplaint(null);
      } else if (selectedComplaint) {
        setSelectedComplaint(res.data.find(c => c._id === selectedComplaint._id) || null);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please check your network or try again.');
      setComplaints([]);
      setSelectedComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (complaintId) => {
    if (!replyMessage.trim()) {
      alert('Reply message cannot be empty.');
      return;
    }

    try {
      await axios.post(`/api/complaints/${complaintId}/reply`, {
        message: replyMessage,
        status 
      }, {
        headers: {
           'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('Token')}` 
        }
      });

      setReplyMessage('');
      alert('Response sent!');
      fetchComplaints(); 
    } catch (err) {
      console.error('Error submitting reply:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit response. Please try again.';
      alert(errorMessage);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedComplaint || newStatus === selectedComplaint.status) return;

    try {
      await axios.put(`/api/complaints/${selectedComplaint._id}/status`, { status: newStatus }, {
        headers: { 
           'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('Token')}` 
        }
      });
      setStatus(newStatus); 
      alert(`Complaint status updated to ${newStatus.replace('_', ' ')}.`);
      fetchComplaints(); 
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update status. Please try again.';
      alert(errorMessage);
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (complaint.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (complaint.customerId?.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (complaint._id?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadgeColor = (complaintStatus) => {
    switch (complaintStatus) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-700">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <FiInfo className="mx-auto text-4xl mb-4 text-red-500" />
          <p className="text-lg font-medium text-red-700">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-6 bg-gray-50 rounded-xl shadow-md overflow-hidden h-full">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Complaint Management</h1>
          {selectedComplaint && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Payment not processed</span>
              <span className="text-gray-500 font-medium">{selectedComplaint._id}</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints or IDs..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={fetchComplaints}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Refresh Complaints"
          >
            <FiRotateCcw className="mr-2" /> Refresh
          </button>
        </div>

        <div className="flex space-x-2 mb-6 border-b border-gray-200 pb-2">
          {['All', 'open', 'in_progress', 'resolved'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex-shrink-0 bg-white rounded-xl shadow-md overflow-y-auto custom-scrollbar">
          {filteredComplaints.length === 0 && !loading ? (
            <div className="text-gray-500 py-10 text-center">No complaints found matching your criteria.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredComplaints.map(complaint => (
                <div
                  key={complaint._id}
                  className={`p-4 cursor-pointer transition-all duration-200 ease-in-out
                    ${selectedComplaint?._id === complaint._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setStatus(complaint.status);
                    setReplyMessage('');
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-gray-700">{complaint._id}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusBadgeColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-gray-800 leading-tight">{complaint.subject}</h3>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <FiUser className="mr-1 text-xs" />
                    {complaint.customerId?.name || 'Unknown User'} -
                    <FiMail className="ml-2 mr-1 text-xs" />
                    <span className="truncate">{complaint.customerId?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                      <FiMessageCircle className="mr-1" />
                      <span>{complaint.adminReplies.length} messages</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" />
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}, {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
          {!selectedComplaint ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-600 p-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <FiInfo className="mx-auto text-5xl mb-4 text-blue-400" />
                <p className="text-xl font-medium">Select a complaint to view its details</p>
                <p className="text-gray-500 mt-2">The conversation history and reply options will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedComplaint.subject}</h2>
                <p className="text-sm text-gray-600">Complaint ID: <span className="font-medium">{selectedComplaint._id}</span></p>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiUser className="mr-1" />
                  <span className="font-medium text-gray-800">{selectedComplaint.customerId?.name || 'Unknown Customer'}</span>
                  <span className="mx-1">•</span>
                  <FiMail className="mr-1" />
                  <span className="text-gray-700">{selectedComplaint.customerId?.email || 'N/A'}</span>
                  <span className="mx-1">•</span>
                  <FiCalendar className="mr-1" />
                  <span>{new Date(selectedComplaint.createdAt).toLocaleDateString()}, {new Date(selectedComplaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{selectedComplaint.description}</p>
                {selectedComplaint.preferredResolution && (
                  <p className="mt-3 text-gray-700">
                    <span className="font-semibold">Preferred Resolution:</span> {selectedComplaint.preferredResolution}
                  </p>
                )}
                {selectedComplaint.agentInfo?.id && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-800 text-sm">
                    <p className="font-semibold">Mentioned Agent details:</p>
                    <p>Agent ID: {selectedComplaint.agentInfo.id}</p>
                    <p>Name: {selectedComplaint.agentInfo.name}</p>
                    <p>Location: {selectedComplaint.agentInfo.location}</p>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <h3 className="font-semibold text-gray-800 mb-4">Conversation History</h3>
                <div className="space-y-4">
                  {selectedComplaint.adminReplies.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-4">No conversation history yet for this complaint.</p>
                  ) : (
                    selectedComplaint.adminReplies.map((reply, index) => {
                      // console.log(reply);

                      const isReplyFromCustomer = reply.repliedByType === 'Customer';
                      const isReplyFromAdmin = reply.repliedByType === 'Superadmin';

                      let senderDisplayName = 'Unknown';
                      if (isReplyFromCustomer) {
                        senderDisplayName = reply.repliedBy?.name || reply.repliedBy?.username || 'Customer';
                      } else if (isReplyFromAdmin) {
                        senderDisplayName = 'Admin';
                      }

                      return (
                        <div
                          key={index} 
                          className={`p-4 rounded-lg border ${
                            isReplyFromCustomer
                              ? 'bg-blue-50 border-blue-200' // Customer reply
                              : 'bg-gray-100 border-gray-200' // Admin/Agent reply
                          }`}
                        >
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-gray-800">
                              Reply by {senderDisplayName}
                            </span>
                            <span className="text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="whitespace-pre-line text-gray-700">{reply.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Send a Response</h3>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  rows="4"
                  placeholder="Type your response here..."
                ></textarea>

                <div className="flex flex-wrap items-center justify-end gap-4">
                  <button
                    onClick={() => handleReplySubmit(selectedComplaint._id)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FiMessageSquare className="mr-2" /> Send Response
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperadminComplaints;