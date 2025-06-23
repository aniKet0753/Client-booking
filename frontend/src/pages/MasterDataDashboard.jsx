import { useState, useEffect } from 'react';
import axios from '../api';
import {
    FiUsers,
    FiUserCheck,
    FiDollarSign,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiDownload
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [timeFilter, setTimeFilter] = useState('currentMonth');
    const itemsPerPage = 5;
    const token = localStorage.getItem('Token');
    // Fetch Agents
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                setLoadingAgents(true);
                // Use the correct API endpoint from index.js
                const response = await axios.get('/api/admin/all-users',{
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAgents(response.data);
            } catch (err) {
                setErrorAgents('Failed to fetch agents.');
                console.error('Error fetching agents:', err);
            } finally {
                setLoadingAgents(false);
            }
        };
        fetchAgents();
    }, []);

    // Fetch Customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoadingCustomers(true);
                // Use the correct API endpoint from index.js
                const response = await axios.get('/api/customer');
                setCustomers(response.data);
            } catch (err) {
                setErrorCustomers('Failed to fetch customers.');
                console.error('Error fetching customers:', err);
            } finally {
                setLoadingCustomers(false);
            }
        };
        fetchCustomers();
    }, []);

    // Fetch Payments (Transactions and Bookings for payment info)
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoadingPayments(true);
                // Use the correct API endpoint from index.js (located in BookingRoutes)
                const response = await axios.get('/api/bookings/payments-overview');
                setPayments(response.data);
            } catch (err) {
                setErrorPayments('Failed to fetch payments.');
                console.error('Error fetching payments:', err);
            } finally {
                setLoadingPayments(false);
            }
        };
        fetchPayments();
    }, []);


    // Filter data based on search term
    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phone_calling.includes(searchTerm) // Using phone_calling from Agent model
    );

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

    const totalPendingPaymentsCount = payments.filter(p => p.paymentStatus === 'Pending').length; // Corrected property to paymentStatus
    const totalCommissionEarned = agents.reduce((sum, agent) => sum + (agent.walletBalance || 0), 0); // Using walletBalance for total commission

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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Master Data Dashboard</h1>

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

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full mr-4">
                        <FiDollarSign className="text-yellow-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Pending Payments</p>
                        {loadingPayments ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">{totalPendingPaymentsCount}</p>}
                        {errorPayments && <p className="text-red-500 text-xs">{errorPayments}</p>}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FiDollarSign className="text-purple-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Commission</p>
                        {loadingAgents ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">${totalCommissionEarned.toLocaleString()}</p>}
                        {errorAgents && <p className="text-red-500 text-xs">{errorAgents}</p>}
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b">
                    <div className="flex space-x-2 mb-4 md:mb-0">
                        <button
                            onClick={() => { setActiveTab('agents'); setCurrentPage(1); }}
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
                            <FiRefreshCw />
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 overflow-x-auto">
                    {activeTab === 'agents' && (
                        <>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Commission</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">${(agent.walletBalance || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {agent.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentCustomers.length > 0 ? (
                                            currentCustomers.map(customer => (
                                                <tr key={customer._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer._id}</td>
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
                                                    <FiDollarSign className="text-green-600 text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Received Amount</p>
                                                    <p className="text-xl font-bold">${totalReceivedAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center">
                                                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                                                    <FiDollarSign className="text-yellow-600 text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Pending Amount</p>
                                                    <p className="text-xl font-bold">${totalPendingAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                    <FiDollarSign className="text-blue-600 text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Total Commission</p>
                                                    <p className="text-xl font-bold">${totalCommissionFromPayments.toLocaleString()}</p>
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
                                                            <div className="text-sm text-gray-500">ID: #{payment.agent?.agentID || 'N/A'}</div> {/* Corrected to agentID */}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{payment.customer?.name || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">ID: #{payment.customer?.id || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.tour?.name || 'N/A'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">${(payment.payment?.totalAmount || 0).toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            ${(payment.commissionAmount || 0).toLocaleString()} {/* Use commissionAmount from the mapped data */}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                ${payment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}> {/* Corrected to paymentStatus */}
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

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-100 rounded-md flex items-center disabled:opacity-50"
                        >
                            <FiChevronLeft className="mr-1" />
                            Previous
                        </button>

                        <div className="flex space-x-1">
                            {Array.from({
                                length: Math.ceil(
                                    activeTab === 'agents' ? filteredAgents.length / itemsPerPage :
                                        activeTab === 'customers' ? filteredCustomers.length / itemsPerPage :
                                            filteredPayments.length / itemsPerPage
                                )
                            }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => paginate(index + 1)}
                                    className={`w-8 h-8 rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => {
                                const totalPages = Math.ceil(
                                    activeTab === 'agents' ? filteredAgents.length / itemsPerPage :
                                        activeTab === 'customers' ? filteredCustomers.length / itemsPerPage :
                                            filteredPayments.length / itemsPerPage
                                );
                                return Math.min(prev + 1, totalPages);
                            })}
                            disabled={
                                currentPage === Math.ceil(
                                    activeTab === 'agents' ? filteredAgents.length / itemsPerPage :
                                        activeTab === 'customers' ? filteredCustomers.length / itemsPerPage :
                                            filteredPayments.length / itemsPerPage
                                ) ||
                                (activeTab === 'agents' && filteredAgents.length === 0) ||
                                (activeTab === 'customers' && filteredCustomers.length === 0) ||
                                (activeTab === 'payments' && filteredPayments.length === 0)
                            }
                            className="px-3 py-1 bg-gray-100 rounded-md flex items-center disabled:opacity-50"
                        >
                            Next
                            <FiChevronRight className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
            {/* <Navbar /> */}
            {/* <Footer /> */}
        </div>
    );
};

export default MasterDataDashboard;