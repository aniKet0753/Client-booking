import { useState, useEffect } from 'react';
import axios from '../api';
import {
    FiUsers,
    FiUserCheck,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiToggleLeft, // Added for status change icon
    FiToggleRight, // Added for status change icon
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify'; // Import for toasts
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS

// Utility function to convert array of objects to CSV
const convertToCSV = (data) => {
    if (data.length === 0) return '';

    // Dynamically get headers from the first object, excluding Mongoose internal fields
    const headers = Object.keys(data[0]).filter(key => !key.startsWith('__') && key !== '_id' && key !== 'id' && key !== 'password');
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            let escaped = '';

            // Handle nested objects for addresses, banking, etc.
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    // For arrays of strings or simple objects (like highlights, inclusions)
                    escaped = JSON.stringify(value);
                } else {
                    // For single nested objects (like permanent_address, banking_details)
                    escaped = Object.values(value).join('; '); // Join nested object values
                }
            } else {
                escaped = ('' + value).replace(/"/g, '""'); // Escape double quotes
            }
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};


const MasterDataDashboard = () => {
    // State for fetched data
    const [agents, setAgents] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [payments, setPayments] = useState([]);

    // Loading and error states
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [errorAgents, setErrorAgents] = useState(null);
    const [errorCustomers, setErrorCustomers] = useState(null);
    const [errorPayments, setErrorPayments] = useState(null);

    const [activeTab, setActiveTab] = useState('agents');
    // New state for agent sub-tabs
    const [agentSubTab, setAgentSubTab] = useState('all'); // 'all', 'active', 'pending', 'rejected', 'inactive' (re-added based on user's prompt)

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [timeFilter, setTimeFilter] = useState('currentMonth');
    const itemsPerPage = 5;
    const token = localStorage.getItem('Token');

    // Helper to fetch agents (can be called by refresh button)
    const fetchAgents = async () => {
        try {
            setLoadingAgents(true);
            const response = await axios.get('/api/admin/all-agents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAgents(Array.isArray(response.data.agents) ? response.data.agents : []);
        } catch (err) {
            setErrorAgents('Failed to fetch agents.');
            setAgents([]);
            console.error('Error fetching agents:', err);
        } finally {
            setLoadingAgents(false);
        }
    };

    // Fetch Agents on component mount
    useEffect(() => {
        fetchAgents();
    }, [token]);

    // Fetch Customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoadingCustomers(true);
                const response = await axios.get('/api/admin/all-customers',{
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCustomers(Array.isArray(response.data.customers) ? response.data.customers : []);
            } catch (err) {
                setErrorCustomers('Failed to fetch customers.');
                setCustomers([]);
                console.error('Error fetching customers:', err);
            } finally {
                setLoadingCustomers(false);
            }
        };
        fetchCustomers();
    }, [token]);

    // Fetch Payments (Transactions and Bookings for payment info)
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoadingPayments(true);
                const response = await axios.get('/api/admin/booking-payments-overview',{
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(Array.isArray(response.data.bookings) ? response.data.bookings : []);
            } catch (err) {
                setErrorPayments('Failed to fetch payments.');
                setPayments([]);
                console.error('Error fetching payments:', err);
            } finally {
                setLoadingPayments(false);
            }
        };
        fetchPayments();
    }, [token]);


    // Filter data based on search term and agent sub-tab
    const filteredAgents = agents.filter(agent => {
        const matchesSearch =
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.phone_calling.includes(searchTerm);

        const matchesSubTab =
            agentSubTab === 'all' ||
            (agentSubTab === 'active' && agent.status === 'active') ||
            (agentSubTab === 'pending' && agent.status === 'pending') ||
            (agentSubTab === 'inactive' && agent.status === 'inactive') || // Re-added inactive filter
            (agentSubTab === 'rejected' && agent.status === 'rejected');

        return matchesSearch && matchesSubTab;
    });


    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const filteredPayments = payments.filter(payment => {
    const matchesSearch =
        (payment.agentName && payment.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.customerName && payment.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.tourName && payment.tourName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.paymentStatus && payment.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : null;
    const paymentMonth = paymentDate ? paymentDate.getMonth() + 1 : null;
    const paymentYear = paymentDate ? paymentDate.getFullYear() : null;

    const matchesTimeFilter =
        timeFilter === 'all' ||
        (paymentMonth === currentMonth && paymentYear === currentYear);

    return matchesSearch && matchesTimeFilter;
});


    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentAgents = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);


    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate totals for summary cards
    const totalAgents = agents.length;
    const totalCustomers = customers.length;

    const totalPendingPaymentsCount = payments.filter(p => p.paymentStatus === 'Pending').length;
    const totalCommissionEarned = agents.reduce((sum, agent) => sum + (agent.walletBalance || 0), 0);

    // Calculate payment summaries
    const totalReceivedAmount = filteredPayments.filter(p => p.paymentStatus === 'Paid').reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPendingAmount = filteredPayments.filter(p => p.paymentStatus === 'Pending').reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const totalCommissionFromPayments = filteredPayments.reduce((sum, payment) => sum + (payment.commissionAmount || 0), 0);

    // Function to trigger download
    const downloadCSV = (data, filename) => {
        const csvData = convertToCSV(data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('hidden', '');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- New: Function to toggle agent status ---
    const toggleAgentStatus = async (agentId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast.info(`Changing agent status to ${newStatus}...`);

        try {
            await axios.post(
                '/api/admin/update-status',
                JSON.stringify({ userId: agentId, status: newStatus }),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Update local state to reflect the change
            setAgents(prevAgents =>
                prevAgents.map(agent =>
                    agent._id === agentId ? { ...agent, status: newStatus } : agent
                )
            );
            toast.success(`Agent status updated to ${newStatus} successfully!`);
        } catch (error) {
            console.error('Failed to update agent status:', error);
            toast.error('Failed to update agent status.');
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Master Data Dashboard</h1>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FiUsers className="text-blue-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Agents</p>
                        {loadingAgents ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">{totalAgents}</p>}
                        {errorAgents && <p className="text-red-500 text-xs">{errorAgents}</p>}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                        <FiUserCheck className="text-green-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Customers</p>
                        {loadingCustomers ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">{totalCustomers}</p>}
                        {errorCustomers && <p className="text-red-500 text-xs">{errorCustomers}</p>}
                    </div>
                </div>

                <div className="bg-yellow-100 rounded-lg shadow p-4 flex items-center">
                    <div className="bg-yellow-200 p-3 rounded-full mr-4">
                        <FaRupeeSign className="text-yellow-700 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Pending Payments</p>
                        {loadingPayments ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">{totalPendingPaymentsCount}</p>}
                        {errorPayments && <p className="text-red-500 text-xs">{errorPayments}</p>}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FaRupeeSign className="text-purple-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Commission (yet to be paid)</p>
                        {loadingAgents ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold flex items-center gap-1"> <FaRupeeSign className='text-base'/> {totalCommissionEarned.toLocaleString()}</p>}
                        {errorAgents && <p className="text-red-500 text-xs">{errorAgents}</p>}
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b">
                    <div className="flex space-x-2 mb-4 md:mb-0">
                        <button
                            onClick={() => { setActiveTab('agents'); setAgentSubTab('all'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-md ${activeTab === 'agents' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Agents
                        </button>
                        <button
                            onClick={() => { setActiveTab('customers'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-md ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Customers
                        </button>
                        <button
                            onClick={() => { setActiveTab('payments'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-md ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Payments
                        </button>
                    </div>

                    <div className="flex w-full md:w-auto space-x-2">
                        <div className="relative flex-grow md:flex-grow-0">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (activeTab === 'agents') downloadCSV(filteredAgents, 'agents.csv');
                                if (activeTab === 'customers') downloadCSV(filteredCustomers, 'customers.csv');
                                if (activeTab === 'payments') downloadCSV(filteredPayments, 'payments.csv');
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700"
                        >
                            <FiDownload className="mr-1" />
                            <span className="hidden md:inline">Download CSV</span>
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-100 rounded-md"
                            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                        >
                            <FiRefreshCw onClick={fetchAgents} /> {/* Added onClick to refresh agents */}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 overflow-x-auto">
                    {activeTab === 'agents' && (
                        <>
                            {/* Agent Sub-Tabs */}
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={() => { setAgentSubTab('all'); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-md ${agentSubTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    All Agents
                                </button>
                                <button
                                    onClick={() => { setAgentSubTab('active'); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-md ${agentSubTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Active Agents
                                </button>
                                <button
                                    onClick={() => { setAgentSubTab('pending'); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-md ${agentSubTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Pending Agents
                                </button>
                                <button
                                    onClick={() => { setAgentSubTab('inactive'); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-md ${agentSubTab === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Inactive Agents
                                </button>
                                <button
                                    onClick={() => { setAgentSubTab('rejected'); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-md ${agentSubTab === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Rejected Agents
                                </button>
                            </div>
                            {loadingAgents ? (
                                <div className="text-center py-8">Loading agents...</div>
                            ) : errorAgents ? (
                                <div className="text-center py-8 text-red-500">{errorAgents}</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Commission</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* New Actions column */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentAgents.length > 0 ? (
                                            currentAgents.map(agent => (
                                                <tr key={agent._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{agent.agentID}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                                                        <div className="text-sm text-gray-500">{agent.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.phone_calling}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(agent.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(agent.walletBalance || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${agent.status === 'active' ? 'bg-green-100 text-green-800' :
                                                              agent.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                              agent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : // Added pending color
                                                              'bg-gray-100 text-gray-800' // Default for rejected or unknown
                                                            }`}>
                                                            {agent.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {/* Toggle Button for Active/Inactive */}
                                                        {agent.status === 'active' || agent.status === 'inactive' ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click from activating
                                                                    toggleAgentStatus(agent._id, agent.status);
                                                                }}
                                                                className={`p-2 rounded-full text-white transition-colors duration-200
                                                                    ${agent.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                                                title={agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'}
                                                            >
                                                                {agent.status === 'active' ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">N/A</span> // Cannot toggle pending/rejected
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No agents found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === 'customers' && (
                        <>
                            {loadingCustomers ? (
                                <div className="text-center py-8">Loading customers...</div>
                            ) : errorCustomers ? (
                                <div className="text-center py-8 text-red-500">{errorCustomers}</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentCustomers.length > 0 ? (
                                            currentCustomers.map(customer => (
                                                <tr key={customer._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                        <div className="text-sm text-gray-500">{customer.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No customers found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === 'payments' && (
                        <>
                            {loadingPayments ? (
                                <div className="text-center py-8">Loading payments...</div>
                            ) : errorPayments ? (
                                <div className="text-center py-8 text-red-500">{errorPayments}</div>
                            ) : (
                                <>
                                    {/* Payment Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center">
                                                <div className="bg-green-100 p-3 rounded-full mr-4">
                                                    <FaRupeeSign className="text-green-600 text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Received Amount</p>
                                                    <p className="text-xl font-bold">₹{totalReceivedAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center">
                                                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                                                    <FaRupeeSign className="text-yellow-600 text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Pending Amount</p>
                                                    <p className="text-xl font-bold">₹{totalPendingAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                    <FaRupeeSign className="text-blue-600 text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Total Commission</p>
                                                    <p className="text-xl font-bold">₹{totalCommissionFromPayments.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Filter Buttons */}
                                    <div className="flex space-x-2 mb-4">
                                        <button
                                            onClick={() => { setTimeFilter('currentMonth'); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-md ${timeFilter === 'currentMonth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Current Month
                                        </button>
                                        <button
                                            onClick={() => { setTimeFilter('all'); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-md ${timeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            All Payments
                                        </button>
                                    </div>

                                    {/* Payments Table */}
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentPayments.length > 0 ? (
                                                currentPayments.map(payment => (
                                                    <tr key={payment._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{payment.bookingID || payment.transactionId}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{payment.agent?.name || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">ID: #{payment.agent?.agentID || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{payment.customer?.name || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">ID: #{payment.customer?.id || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.tourName || 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(payment.amount || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{(payment.commissionAmount || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                ${payment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                  payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                  'bg-gray-100 text-gray-800'}`}>
                                                                {payment.paymentStatus || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No payments found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {(activeTab === 'agents' && filteredAgents.length > itemsPerPage) ||
                 (activeTab === 'customers' && filteredCustomers.length > itemsPerPage) ||
                 (activeTab === 'payments' && filteredPayments.length > itemsPerPage) ? (
                    <div className="p-4 flex justify-between items-center border-t border-gray-200">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 flex items-center"
                        >
                            <FiChevronLeft className="mr-2" /> Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of{' '}
                            {activeTab === 'agents'
                                ? Math.ceil(filteredAgents.length / itemsPerPage)
                                : activeTab === 'customers'
                                ? Math.ceil(filteredCustomers.length / itemsPerPage)
                                : Math.ceil(filteredPayments.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={
                                (activeTab === 'agents' && currentPage === Math.ceil(filteredAgents.length / itemsPerPage)) ||
                                (activeTab === 'customers' && currentPage === Math.ceil(filteredCustomers.length / itemsPerPage)) ||
                                (activeTab === 'payments' && currentPage === Math.ceil(filteredPayments.length / itemsPerPage))
                            }
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 flex items-center"
                        >
                            Next <FiChevronRight className="ml-2" />
                        </button>
                    </div>
                ) : null}
            </div>
            {/* <Navbar />
            <Footer /> */}
        </div>
    );
};

export default MasterDataDashboard;