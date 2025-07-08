// src/pages/AgentComplaintView.js (or src/components/AgentComplaintView.js)
import React, { useState, useEffect } from 'react';
import axios from '../api'; // Your axios instance
import {
  FiInfo,
  FiMail,
  FiUser,
  FiCalendar,
  FiMessageCircle,
  FiSend,
  FiClipboard
} from 'react-icons/fi';
import { useParams } from 'react-router-dom'; // Assuming you use react-router-dom for dynamic routes

const AgentComplaintView = () => {
  const { id } = useParams(); // Get complaint ID from URL params
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentReplyMessage, setAgentReplyMessage] = useState('');

  // This will be obtained from the agent's logged-in token/user context
  const currentAgentId = "YOUR_AGENT_ID_FROM_AUTH"; // IMPORTANT: Replace with actual agent ID from auth context/token
  const currentAgentName = "Agent Name"; // IMPORTANT: Replace with actual agent name from auth context/token

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]); // Re-fetch if complaint ID changes

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // Endpoint to fetch a single complaint by ID. Ensure it populates customerId and agentInfo.
      const res = await axios.get(`/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
      });
      const fetchedComplaint = res.data;

      // Agent can only see this complaint if their ID matches agentInfo.id
      // This is a client-side check, backend should also enforce this.
      if (fetchedComplaint.agentInfo?.id?.toString() !== currentAgentId) {
          setError("You are not authorized to view this complaint or it's not assigned to you.");
          setComplaint(null);
          return;
      }

      setComplaint(fetchedComplaint);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load complaint. Please check your network or try again.';
      setError(errorMessage);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentReplyToSuperadmin = async () => {
    if (!agentReplyMessage.trim()) {
      alert('Reply message cannot be empty.');
      return;
    }
    if (!complaint) {
        alert('No complaint selected.');
        return;
    }

    try {
      // Use the new endpoint for agent replies to superadmin
      await axios.post(`/api/complaints/${complaint._id}/reply-superadmin`, {
        message: agentReplyMessage,
      }, {
        headers: {
           'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      });

      setAgentReplyMessage('');
      alert('Reply sent to Superadmin!');
      fetchComplaintDetails(); // Re-fetch to update conversation
    } catch (err) {
      console.error('Error sending agent reply:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reply. Please try again.';
      alert(errorMessage);
    }
  };

  const getStatusBadgeColor = (complaintStatus) => {
    switch (complaintStatus) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg font-medium text-gray-700">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <FiInfo className="mx-auto text-4xl mb-4 text-red-500" />
          <p className="text-lg font-medium text-red-700">{error}</p>
          <button
            onClick={fetchComplaintDetails}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!complaint) {
      return (
          <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 rounded-lg shadow-md m-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <FiInfo className="mx-auto text-4xl mb-4 text-gray-500" />
                  <p className="text-lg font-medium text-gray-700">Complaint not found or not assigned to you.</p>
              </div>
          </div>
      );
  }

  // Combine and sort all messages
  const allMessages = [
      ...complaint.adminReplies.map(reply => ({ ...reply, type: 'adminReply', createdAt: new Date(reply.createdAt) })),
      ...complaint.agentChat.map(chat => ({ ...chat, type: 'agentChat', createdAt: new Date(chat.createdAt) }))
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Use getTime for Date objects


  return (
    <div className="flex flex-col flex-1 p-6 bg-gray-50 rounded-xl shadow-md overflow-hidden h-full">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Complaint Details</h1>
          <span className={`px-3 py-1.5 text-lg rounded-md font-semibold ${getStatusBadgeColor(complaint.status)}`}>
            {complaint.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-lg font-semibold text-gray-700">{complaint.subject}</p>
        <p className="text-sm text-gray-600">Complaint ID: <span className="font-medium">{complaint._id}</span></p>
      </header>

      <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        {/* Complaint Description */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FiUser className="mr-1" />
            <span className="font-medium text-gray-800">{complaint.customerId?.name || 'Unknown Customer'}</span>
            <span className="mx-1">•</span>
            <FiMail className="mr-1" />
            <span className="text-gray-700">{complaint.customerId?.email || 'N/A'}</span>
            <span className="mx-1">•</span>
            <FiCalendar className="mr-1" />
            <span>{new Date(complaint.createdAt).toLocaleDateString()}, {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-line">{complaint.description}</p>
          {complaint.preferredResolution && (
            <p className="mt-3 text-gray-700">
              <span className="font-semibold">Preferred Resolution:</span> {complaint.preferredResolution}
            </p>
          )}
          {complaint.agentInfo?.id && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-800 text-sm">
              <p className="font-semibold">Assigned Agent details:</p>
              <p>Agent ID: {complaint.agentInfo.id}</p>
              <p>Name: {complaint.agentInfo.name}</p>
              <p>Location: {complaint.agentInfo.location}</p>
            </div>
          )}
        </div>

        {/* Combined Conversation History (adminReplies + agentChat) */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <h3 className="font-semibold text-gray-800 mb-4">All Communication</h3>
          <div className="space-y-4">
            {allMessages.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">No communication history yet for this complaint.</p>
            ) : (
              allMessages.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    item.type === 'adminReply'
                      ? 'bg-blue-50 border-blue-200' // General complaint reply (customer/admin)
                      : item.senderRole === 'superadmin' // Agent chat messages
                        ? 'bg-purple-50 border-purple-200' // Superadmin to agent
                        : 'bg-green-50 border-green-200' // Agent to superadmin
                  }`}
                >
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-gray-800">
                      {item.type === 'adminReply'
                        ? 'Complaint Reply'
                        : item.senderRole === 'superadmin'
                          ? `Superadmin (${item.sentBy?.username || 'N/A'})`
                          : `Agent (${item.sentBy?.username || 'N/A'})`
                      }
                    </span>
                    <span className="text-gray-500">{item.createdAt.toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-line text-gray-700">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Agent Reply Form (ONLY for superadmin) */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Reply to Superadmin</h3>
          <textarea
            value={agentReplyMessage}
            onChange={(e) => setAgentReplyMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows="4"
            placeholder="Type your message to the Superadmin here..."
          ></textarea>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <button
              onClick={handleAgentReplyToSuperadmin}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FiSend className="mr-2" /> Send to Superadmin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentComplaintView;