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
  FiMessageCircle,
  FiSend,
  FiUsers,
  FiChevronDown, // New icon for dropdown
  FiChevronUp,   // New icon for dropdown
} from 'react-icons/fi';

const SuperadminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [status, setStatus] = useState('open');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for managing accordion open/close
  const [isCustomerChatOpen, setIsCustomerChatOpen] = useState(true);
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(true);

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
      console.log(res)
      setComplaints(Array.isArray(res.data) ? res.data : []);

      if (selectedComplaint) {
        // Find the updated version of the selected complaint
        const updatedSelected = res.data.find(c => c._id === selectedComplaint._id);
        setSelectedComplaint(updatedSelected || null);
        if (updatedSelected) {
          setStatus(updatedSelected.status);
        } else {
          // If the selected complaint no longer exists in the list (e.g., deleted), clear selection
          setSelectedComplaint(null);
        }
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
        status // Send current status with the reply
      }, {
        headers: {
           'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      });

      setReplyMessage('');
      alert('Response sent to customer!');
      fetchComplaints(); // Refresh to get the latest data including new reply
    } catch (err) {
      console.error('Error submitting customer reply:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit customer response. Please try again.';
      alert(errorMessage);
    }
  };

  const handleSendMessageToAgent = async (complaintId) => {
    if (!agentMessage.trim()) {
      alert('Message to agent cannot be empty.');
      return;
    }

    let targetAgentId = selectedComplaint?.agentInfo?.id;

    // If no agent is assigned, prompt for Agent ID
    if (!targetAgentId) {
      const inputAgentId = prompt('This complaint is not assigned to an agent. Please enter the Agent ID to assign and send message:');
      if (inputAgentId) {
        targetAgentId = inputAgentId.trim();
      } else {
        alert('Agent ID is required to send a message to an unassigned complaint.');
        return;
      }
    }

    try {
      await axios.post(`/api/agent-chats/superadmin-to-agent`, {
        complaintId: complaintId,
        agentId: targetAgentId,
        message: agentMessage,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      });

      setAgentMessage('');
      alert('Message sent to agent!');
      fetchComplaints(); // Refresh to see updated agentInfo and chat history
    } catch (err) {
      console.error('Error sending message to agent:', err);
      const errorMessage = err.response?.data.msg || 'Failed to send message to agent. Please try again.';
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
      alert(`Complaint status updated to ${newStatus.replace('_', ' ')}.`);
      fetchComplaints(); // Refresh to get the updated status
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
              <span className="text-gray-700 font-medium">Status:</span>
              <span className={`px-3 py-1.5 rounded-md font-semibold text-sm ${getStatusBadgeColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status.replace('_', ' ')}
              </span>
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
        {/* Left Pane: List of complaints */}
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
                    setAgentMessage('');
                    // Optionally reset accordion states when new complaint is selected
                    setIsCustomerChatOpen(true);
                    setIsAgentChatOpen(true);
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

        {/* Right Pane: Selected Complaint Details & Chat */}
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
              {/* Complaint Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedComplaint.subject}</h2>
                <p className="text-sm text-gray-600">Complaint ID: <span className="font-medium">{selectedComplaint._id}</span></p>
              </div>

              {/* Complaint Details */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FiUser className="mr-2 text-base text-gray-500" />
                    <span className="font-medium text-gray-800">Customer:</span> {selectedComplaint.customerId?.name || 'Unknown Customer'}
                  </div>
                  <div className="flex items-center">
                    <FiMail className="mr-2 text-base text-gray-500" />
                    <span className="font-medium text-gray-800">Email:</span> {selectedComplaint.customerId?.email || 'N/A'}
                  </div>
                  <div className="flex items-center col-span-full">
                    <FiCalendar className="mr-2 text-base text-gray-500" />
                    <span className="font-medium text-gray-800">Filed On:</span> {new Date(selectedComplaint.createdAt).toLocaleDateString()}, {new Date(selectedComplaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line text-base mb-4">
                  <span className="font-semibold text-gray-800">Description:</span><br/>
                  {selectedComplaint.description}
                </p>
                {selectedComplaint.preferredResolution && (
                  <p className="text-gray-700 text-base">
                    <span className="font-semibold text-gray-800">Preferred Resolution:</span> {selectedComplaint.preferredResolution}
                  </p>
                )}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm shadow-inner">
                  <p className="font-bold mb-1 flex items-center"><FiUsers className="mr-2 text-blue-600" /> Agent Information:</p>
                  {/* {selectedComplaint.agentInfo?.id ? ( */}
                    <>
                      <p><span className="font-semibold">ID:</span> {selectedComplaint?.agentInfo?.id || 'Not provided'}</p>
                      <p><span className="font-semibold">Name:</span> {selectedComplaint?.agentInfo?.name || 'Not provided'}</p>
                      <p><span className="font-semibold">Location:</span> {selectedComplaint?.agentInfo?.location || 'Not provided'}</p>
                    </>
                  {/* ) : (
                    <p className="text-red-700 font-medium">No agent currently assigned to this complaint.</p>
                  )} */}
                </div>
              </div>

              {/* Collapsible Chat Sections */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">

                {/* Customer Conversation History Accordion */}
                <div className="mb-8 border border-gray-200 rounded-lg shadow-sm">
                  <button
                    className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg focus:outline-none"
                    onClick={() => setIsCustomerChatOpen(!isCustomerChatOpen)}
                  >
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <FiMessageSquare className="mr-2 text-blue-600" /> Customer Conversation History
                    </h3>
                    {isCustomerChatOpen ? <FiChevronUp className="text-gray-600" /> : <FiChevronDown className="text-gray-600" />}
                  </button>
                  {isCustomerChatOpen && (
                    <div className="p-4 bg-white border-t border-gray-200 max-h-80 overflow-y-auto custom-scrollbar">
                      <div className="space-y-4">
                        {selectedComplaint.adminReplies.length === 0 ? (
                          <p className="text-gray-600 text-sm text-center py-4">No conversation history yet for this complaint.</p>
                        ) : (
                          selectedComplaint.adminReplies.map((reply, index) => {
                            console.log(selectedComplaint)
                            const isReplyFromCustomer = reply.repliedByType === 'Customer';
                            // As per your instruction: "should be written like reply by admin for all replies sent from superadmin, and customer name should show when message from customer side." [cite: 2025-07-08]
                            const senderDisplayName = isReplyFromCustomer
                              ? reply.repliedBy?.name || reply.repliedBy?.username || 'Customer'
                              : 'Reply by Admin';

                            return (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border shadow-sm max-w-[80%] ${
                                  isReplyFromCustomer
                                    ? 'bg-blue-100 border-blue-200 mr-auto' // Customer message on left
                                    : 'bg-gray-100 border-gray-200 ml-auto' // Admin message on right
                                }`}
                              >
                                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                                  <span className="font-bold">{senderDisplayName}</span>
                                  <span>{new Date(reply.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-800 text-sm whitespace-pre-line">{reply.message}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent-Superadmin Chat History Accordion */}
                {(selectedComplaint.agentInfo?.id || selectedComplaint.agentChat?.length > 0) && (
                  <div className="border border-gray-200 rounded-lg shadow-sm">
                    <button
                      className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg focus:outline-none"
                      onClick={() => setIsAgentChatOpen(!isAgentChatOpen)}
                    >
                      <h3 className="font-bold text-gray-800 flex items-center">
                          <FiUsers className="mr-2 text-purple-600" /> Agent-Superadmin Chat History
                      </h3>
                      {isAgentChatOpen ? <FiChevronUp className="text-gray-600" /> : <FiChevronDown className="text-gray-600" />}
                    </button>
                    {isAgentChatOpen && (
                      <div className="p-4 bg-white border-t border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                          {selectedComplaint.agentChat && selectedComplaint.agentChat.length > 0 ? (
                              selectedComplaint.agentChat.map((chat, index) => {
                                const isSuperadminSender = chat.senderModel === 'Superadmin';
                                const senderName = isSuperadminSender ? 'Superadmin(You)' : (`${chat.sender?.name}(Agent)` || 'Agent');
                                const bgColor = isSuperadminSender ? 'bg-indigo-100 border-indigo-200 ml-auto' : 'bg-green-100 border-green-200 mr-auto'; // Superadmin right, Agent left
                                // Removed alignment variable, directly applied classes above

                                return (
                                    <div key={index} className={`p-3 rounded-lg border shadow-sm max-w-[80%] ${bgColor}`}>
                                        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                                            <span className="font-bold">{senderName}</span>
                                            <span>{new Date(chat.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-800 text-sm whitespace-pre-line">{chat.message}</p>
                                    </div>
                                );
                              })
                          ) : (
                              <p className="text-gray-600 text-sm text-center py-4">No messages with the agent yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons and Message Inputs */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-6">
                {/* Send Response to Customer */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FiMessageSquare className="mr-2 text-blue-600" /> Send Response to Customer
                  </h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-y"
                    rows="4"
                    placeholder="Type your response to the customer here..."
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleReplySubmit(selectedComplaint._id)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md"
                    >
                      <FiSend className="mr-2" /> Send to Customer
                    </button>
                  </div>
                </div>

                {/* Send Message to Agent */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FiUsers className="mr-2 text-purple-600" /> Send Message to Agent
                    {selectedComplaint.agentInfo?.id ? (
                        <span className="ml-2 text-sm text-gray-600 font-normal">(Assigned: {selectedComplaint.agentInfo.name || selectedComplaint.agentInfo.id})</span>
                    ) : (
                        <span className="ml-2 text-sm text-red-500 font-normal">(No agent assigned yet)</span>
                    )}
                  </h3>
                  <textarea
                    value={agentMessage}
                    onChange={(e) => setAgentMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 resize-y"
                    rows="3"
                    placeholder="Type message for the agent..."
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSendMessageToAgent(selectedComplaint._id)}
                      className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center shadow-md"
                    >
                      <FiSend className="mr-2" /> Send to Agent
                    </button>
                  </div>
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
