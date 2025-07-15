// src/components/AgentComplaints.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api'; // Assuming you have an axios instance configured
import {
  FiFileText, FiMessageSquare, FiInfo, FiUsers, FiSend, FiCalendar, FiUser, FiMail
} from 'react-icons/fi';

const AgentComplaints = () => {
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [selectedComplaintGroup, setSelectedComplaintGroup] = useState(null); // Stores the grouped object { complaint, messages }
  const [agentReplyMessage, setAgentReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all agent chats, which are already grouped by complaint on the backend
      const res = await axios.get('/api/agent-chats/my-agent-chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
      });
// console.log(res)
      const fetchedGroups = Array.isArray(res.data) ? res.data : [];
      setAssignedComplaints(fetchedGroups);

      // If a complaint was previously selected, try to re-select its updated version
      if (selectedComplaintGroup) {
        const updatedSelected = fetchedGroups.find(
          group => group.complaint._id === selectedComplaintGroup.complaint._id
        );
        setSelectedComplaintGroup(updatedSelected || null);
      } else if (fetchedGroups.length > 0) {
        // Optionally auto-select the first complaint if none are selected
        // setSelectedComplaintGroup(fetchedGroups[0]);
      }

    } catch (err) {
      console.error('Error fetching agent data:', err);
      setError('Failed to load your complaints and messages. Please check your network or try again.');
      setAssignedComplaints([]); // Clear data on error
      setSelectedComplaintGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentReplySubmit = async () => {
    if (!selectedComplaintGroup || !agentReplyMessage.trim()) {
      alert('Please select a complaint and type a message.');
      return;
    }

    try {
      await axios.post('/api/agent-chats/agent-to-superadmin', {
        complaintId: selectedComplaintGroup.complaint._id,
        message: agentReplyMessage,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      });
      setAgentReplyMessage('');
      alert('Message sent to Superadmin!');
      fetchAgentData(); // Refresh to see the new message immediately
    } catch (err) {
      console.error('Error sending agent message:', err);
      const errorMessage = err.response?.data?.msg || 'Failed to send message. Please try again.';
      alert(errorMessage);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading && assignedComplaints.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-700">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  if (error && assignedComplaints.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <FiInfo className="mx-auto text-4xl mb-4 text-red-500" />
          <p className="text-lg font-medium text-red-700">{error}</p>
          <button
            onClick={fetchAgentData}
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
        <h1 className="text-3xl font-bold text-gray-800">Complaints</h1>
      </header>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Pane: List of assigned complaints */}
        <div className="w-1/3 flex-shrink-0 bg-white rounded-xl shadow-md overflow-y-auto custom-scrollbar">
          {assignedComplaints.length === 0 && !loading ? (
            <div className="text-gray-500 py-10 text-center">No complaints currently assigned to you.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignedComplaints.map(group => (
                <div
                  key={group.complaint._id}
                  className={`p-4 cursor-pointer transition-all duration-200 ease-in-out
                    ${selectedComplaintGroup?.complaint._id === group.complaint._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    setSelectedComplaintGroup(group);

                    setAgentReplyMessage(''); // Clear message when selecting new complaint
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-gray-700">{group.complaint._id}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusBadgeColor(group.complaint.status)}`}>
                      {group.complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-gray-800 leading-tight">{group.complaint.subject}</h3>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <FiUser className="mr-1 text-xs" />
                    {group.complaint.customerId?.name || 'Unknown Customer'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                      <FiMessageSquare className="mr-1" />
                      {/* Sum of agent chats and admin replies */}
                      <span>{group.messages.length + (group.complaint.adminReplies?.length || 0)} messages</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" />
                      <span>{new Date(group.complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Selected Complaint Details & Chat */}
        <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
          {!selectedComplaintGroup ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-600 p-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <FiInfo className="mx-auto text-5xl mb-4 text-blue-400" />
                <p className="text-xl font-medium">Select a complaint from the left to view details</p>
                <p className="text-gray-500 mt-2">Here you can see the complaint details and chat with the Superadmin.</p>
              </div>
            </div>
          ) : (
            
            <div className="flex-1 flex flex-col">
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedComplaintGroup.complaint.subject}</h2>
                <p className="text-sm text-gray-600">Complaint ID: <span className="font-medium">{selectedComplaintGroup.complaint._id}</span></p>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiUser className="mr-1" />
                  <span className="font-medium text-gray-800">{selectedComplaintGroup.complaint.customerId?.name || 'Unknown Customer'}</span>
                  <span className="mx-1">•</span>
                  <FiMail className="mr-1" />
                  <span className="text-gray-700">{selectedComplaintGroup.complaint.customerId?.email || 'N/A'}</span>
                  <span className="mx-1">•</span>
                  <FiCalendar className="mr-1" />
                  <span>{new Date(selectedComplaintGroup.complaint.createdAt).toLocaleDateString()}, {new Date(selectedComplaintGroup.complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{selectedComplaintGroup.complaint.description}</p>
                {selectedComplaintGroup.complaint.preferredResolution && (
                  <p className="mt-3 text-gray-700">
                    <span className="font-semibold">Preferred Resolution:</span> {selectedComplaintGroup.complaint.preferredResolution}
                  </p>
                )}
              </div>

              {/* Customer Conversation History - NEW SECTION */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <FiMessageSquare className="mr-2" /> Customer Conversation History
                </h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-inner max-h-80 overflow-y-auto custom-scrollbar mb-6">
                  {selectedComplaintGroup.complaint.adminReplies && selectedComplaintGroup.complaint.adminReplies.length > 0 ? (
                    selectedComplaintGroup.complaint.adminReplies.map((reply, index) => {
                    //   console.log(reply)
                      const isReplyFromCustomer = reply.repliedByType === 'Customer'; // Use role to determine customer vs admin
                      const senderDisplayName = isReplyFromCustomer
                        ? reply.repliedBy?.name || reply.repliedBy?.username || 'Customer'
                        : 'Reply by Admin'; // Superadmin replies shown as "Reply by Admin"

                      // Determine background and alignment for messages
                      const bgColor = isReplyFromCustomer ? 'bg-blue-100 border-blue-200' : 'bg-gray-100 border-gray-200';
                      const alignment = isReplyFromCustomer ? 'mr-auto' : 'ml-auto'; // Customer messages left, Admin messages right

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border shadow-sm max-w-[80%] ${bgColor} ${alignment}`}
                        >
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                            <span className="font-bold">{senderDisplayName}</span>
                            <span>{new Date(reply.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-800 text-sm whitespace-pre-line">{reply.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600 text-sm text-center py-4">No conversation history with the customer yet.</p>
                  )}
                </div>

                {/* Agent-Superadmin Chat History - EXISTING SECTION */}
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <FiUsers className="mr-2" /> Your Chat with Superadmin
                </h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-inner max-h-80 overflow-y-auto custom-scrollbar">
                  {selectedComplaintGroup.messages.length > 0 ? (
                    selectedComplaintGroup.messages.map((chat, index) => {
                        // console.log(chat)
                        console.log(selectedComplaintGroup)
                      const isAgentSender = chat.senderModel === 'Agent';
                      const senderName = isAgentSender ? 'Agent(You)' : ('Admin');
                      const bgColor = isAgentSender ? 'bg-green-100 border-green-200' : 'bg-indigo-100 border-indigo-200';
                      const alignment = isAgentSender ? 'ml-auto' : 'mr-auto'; // Align agent messages to the right

                      return (
                        <div key={index} className={`p-3 rounded-lg border shadow-sm max-w-[80%] ${bgColor} ${alignment}`}>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                            <span className="font-bold">{senderName}</span>
                            <span>{new Date(chat.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-800 text-sm whitespace-pre-line">{chat.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600 text-sm text-center py-4">No messages for this complaint yet.</p>
                  )}
                </div>
              </div>

              {/* Agent Message Input */}
              <div className="p-6 border-t bg-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FiSend className="mr-2" /> Send Message to Superadmin
                </h3>
                <textarea
                  value={agentReplyMessage}
                  onChange={(e) => setAgentReplyMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                  rows="3"
                  placeholder="Type your message to the Superadmin here..."
                ></textarea>
                <div className="flex justify-end">
                  <button
                    onClick={handleAgentReplySubmit}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FiMessageSquare className="mr-2" /> Send Message
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

export default AgentComplaints;