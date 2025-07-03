import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiMessageSquare, FiUser, FiAlertCircle, FiCheckCircle, FiClock, FiSend, FiChevronDown, FiChevronUp, FiRefreshCw, FiCopy } from 'react-icons/fi';

const ComplaintManagement = () => {
    // Sample data with added complaint IDs
    const initialComplaints = [
        {
            id: 1,
            complaintId: 'COMP-20230515-001',
            customer: 'John Doe',
            email: 'john@example.com',
            subject: 'Login issues',
            createdAt: '2023-05-15T10:30:00',
            status: 'open',
            messages: [
                {
                    id: 1,
                    sender: 'customer',
                    text: "I can't login to my account. It says invalid credentials but I'm sure they're correct.",
                    timestamp: '2023-05-15T10:30:00'
                },
                {
                    id: 2,
                    sender: 'agent',
                    text: "We've reset your password. Please try logging in with the temporary password sent to your email.",
                    timestamp: '2023-05-15T11:15:00'
                },
                {
                    id: 3,
                    sender: 'super_admin',
                    text: "Agent, please verify if the customer's account is not locked before resetting password.",
                    timestamp: '2023-05-15T11:30:00'
                },
                {
                    id: 4,
                    sender: 'agent',
                    text: "Understood. I've checked and the account was indeed locked. It's now unlocked and the customer can login.",
                    timestamp: '2023-05-15T11:45:00'
                }
            ]
        },
        {
            id: 2,
            complaintId: 'COMP-20230516-002',
            customer: 'Jane Smith',
            email: 'jane@example.com',
            subject: 'Payment not processed',
            createdAt: '2023-05-16T09:15:00',
            status: 'in_progress',
            messages: [
                {
                    id: 1,
                    sender: 'customer',
                    text: "My payment from yesterday hasn't been processed yet. The amount was deducted from my bank but not reflected in my account.",
                    timestamp: '2023-05-16T09:15:00'
                }
            ]
        },
        {
            id: 3,
            complaintId: 'COMP-20230517-003',
            customer: 'Robert Johnson',
            email: 'robert@example.com',
            subject: 'Feature request',
            createdAt: '2023-05-17T14:20:00',
            status: 'resolved',
            messages: [
                {
                    id: 1,
                    sender: 'customer',
                    text: "I'd like to request a dark mode feature for the mobile app. It would be easier on the eyes at night.",
                    timestamp: '2023-05-17T14:20:00'
                },
                {
                    id: 2,
                    sender: 'super_admin',
                    text: "Thank you for the suggestion. We've added this to our roadmap for Q3 development.",
                    timestamp: '2023-05-17T15:00:00'
                }
            ]
        }
    ];

    const [complaints, setComplaints] = useState(initialComplaints);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Filter complaints based on search and status
    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleComplaintSelect = (complaint) => {
        setSelectedComplaint(complaint);
        setNewMessage('');
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedComplaint) return;

        const updatedComplaints = complaints.map(complaint => {
            if (complaint.id === selectedComplaint.id) {
                const newMsg = {
                    id: complaint.messages.length + 1,
                    sender: 'super_admin',
                    text: newMessage,
                    timestamp: new Date().toISOString()
                };

                return {
                    ...complaint,
                    messages: [...complaint.messages, newMsg],
                    status: complaint.status === 'open' ? 'in_progress' : complaint.status
                };
            }
            return complaint;
        });

        setComplaints(updatedComplaints);
        setSelectedComplaint(updatedComplaints.find(c => c.id === selectedComplaint.id));
        setNewMessage('');
    };

    const updateStatus = (complaintId, newStatus) => {
        const updatedComplaints = complaints.map(complaint => {
            if (complaint.id === complaintId) {
                return { ...complaint, status: newStatus };
            }
            return complaint;
        });

        setComplaints(updatedComplaints);
        setSelectedComplaint(updatedComplaints.find(c => c.id === complaintId));
    };

    const refreshComplaints = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const copyComplaintId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open':
                return <FiAlertCircle className="text-red-500" />;
            case 'in_progress':
                return <FiRefreshCw className="text-yellow-500" />;
            case 'resolved':
                return <FiCheckCircle className="text-green-500" />;
            default:
                return <FiClock className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-red-100 text-red-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex h-screen bg-gray-50 my-9 mx-0">
            {/* Sidebar - Complaint List */}
            <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Complaint Management</h1>

                    <div className="mt-4 flex space-x-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search complaints or IDs..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            onClick={refreshComplaints}
                            disabled={isLoading}
                        >
                            <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="mt-3 flex space-x-2 overflow-x-auto">
                        <button
                            className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${statusFilter === 'open' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setStatusFilter('open')}
                        >
                            <FiAlertCircle size={14} />
                            <span>Open</span>
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${statusFilter === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setStatusFilter('in_progress')}
                        >
                            <FiRefreshCw size={14} />
                            <span>In Progress</span>
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${statusFilter === 'resolved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setStatusFilter('resolved')}
                        >
                            <FiCheckCircle size={14} />
                            <span>Resolved</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredComplaints.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No complaints found
                        </div>
                    ) : (
                        filteredComplaints.map(complaint => (
                            <div
                                key={complaint.id}
                                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedComplaint?.id === complaint.id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleComplaintSelect(complaint)}
                            >
                                <div className="flex justify-between items-start gap-1.5 flex-col">
                                    <div className='flex items-center space-x-2 justify-between w-full flex-wrap'>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                            {complaint.complaintId}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-medium text-gray-900">{complaint.subject}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">{complaint.customer} • {complaint.email}</p>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <FiMessageSquare className="mr-1" size={14} />
                                        <span>{complaint.messages.length} messages</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(complaint.createdAt)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - Conversation */}
            <div className="flex-1 flex flex-col">
                {selectedComplaint ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h2 className="text-lg font-bold">{selectedComplaint.subject}</h2>
                                        <div className="relative group">
                                            <button
                                                onClick={() => copyComplaintId(selectedComplaint.complaintId)}
                                                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-sm transition"
                                            >
                                                <span className="font-mono">{selectedComplaint.complaintId}</span>
                                                <FiCopy size={14} className="text-gray-500" />
                                            </button>
                                            <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${copiedId === selectedComplaint.complaintId ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                                                Copied to clipboard!
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">{selectedComplaint.customer}</span> • {selectedComplaint.email}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <select
                                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComplaint.status}
                                        onChange={(e) => updateStatus(selectedComplaint.id, e.target.value)}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            <div className="space-y-4">
                                {selectedComplaint.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'super_admin' ? 'justify-end' : message.sender === 'agent' ? 'justify-start' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-3/4 rounded-lg p-3 ${message.sender === 'super_admin'
                                                ? 'bg-blue-500 text-white'
                                                : message.sender === 'agent'
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-200 text-gray-800'}`}
                                        >
                                            <div className="flex items-center mb-1">
                                                {message.sender === 'super_admin' ? (
                                                    <span className="font-medium">You (Super Admin)</span>
                                                ) : message.sender === 'agent' ? (
                                                    <span className="font-medium">Agent</span>
                                                ) : (
                                                    <span className="font-medium">Customer</span>
                                                )}
                                            </div>
                                            <p>{message.text}</p>
                                            <div className="text-xs mt-1 opacity-80">
                                                {formatDate(message.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                >
                                    <FiSend className="mr-1" />
                                    Send
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Tip: You can reply to customers or give instructions to agents.
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                        <FiMessageSquare size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Select a complaint</h3>
                        <p className="text-gray-500 mt-1">Choose a complaint from the list to view and respond</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintManagement;