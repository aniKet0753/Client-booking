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
    FiDollarSign, // Icon for 'Pay' button
    FiChevronDown, // For accordion
    FiChevronUp // For accordion
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify'; // Import for toasts
// import 'react-toastify/dist/React-Toastify.css'; // Corrected import for toast CSS

// --- Agent-specific desired headers for CSV export ---
const AGENT_CSV_HEADERS = [
    'name', 'agentID', 'gender', 'dob', 'age', 'phone_calling',
    'phone_whatsapp', 'email', 'adhar_card', 'pan_card',
    'profession', 'income', 'office_address', 'permanent_address',
    'exclusive_zone', 'banking_details', 'parentAgent'
];

// Headers for Agent Commission Report CSV (more detailed per tour, for Agents tab)
const AGENT_COMMISSION_REPORT_HEADERS = [
    ...AGENT_CSV_HEADERS,
    'tourID', // Specific Tour ID
    'tourDueDate', // Specific Tour Due Date
    'tourCommission', // Specific Tour Commission
    'tourCommissionStatus', // Specific Tour Commission Status (Paid/Pending)
    'totalCommissionEarned', // Overall for agent
    'totalCommissionPaid', // Overall for agent
    'totalCommissionPending' // Overall for agent
];

// New headers for Paid Commissions Detailed Report CSV (for Payments tab)
const PAID_COMMISSIONS_DETAILED_HEADERS = [
    'name',
    'agentID',
    'tourID',
    'tourDueDate',
    'tourCommission',
    'tourCommissionStatus',
    'totalCommissionEarned',
    'totalCommissionPaid',
    'totalCommissionPending'
];


// Utility function to convert array of objects to CSV
const convertToCSV = (data, type) => {
    if (data.length === 0) return '';

    let headers = [];
    const csvRows = [];

    if (type === 'agents') {
        headers = AGENT_CSV_HEADERS;
    } else if (type === 'customers') {
        headers = ['name', 'email', 'phone', 'createdAt', 'totalBookings'];
    } else if (type === 'paymentsReceived') {
        headers = ['bookingId', 'tourName', 'agentName', 'agentID', 'customerName', 'amount', 'commissionAmount', 'paymentStatus', 'paymentDate'];
    } else if (type === 'paymentsPaid') {
        headers = ['tourID', 'agentName', 'agentID', 'dueDate', 'customerGiven', 'commission', 'CommissionPaid'];
    } else if (type === 'agentCommissionReport') {
        headers = AGENT_COMMISSION_REPORT_HEADERS;
    } else if (type === 'paymentsPaidDetailed') { // New type for the detailed payments report
        headers = PAID_COMMISSIONS_DETAILED_HEADERS;
    }
    else {
        headers = Object.keys(data[0]).filter(key =>
            !key.startsWith('__') && key !== '_id' && key !== 'id' && key !== 'password'
        );
    }

    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];
            let escaped = '';

            if (type === 'agents') {
                if (header === 'parentAgent') {
                    value = row.parentAgent || 'N/A,N/A';
                }
            } else if (type === 'paymentsReceived') {
                if (header === 'agentName' || header === 'agentID') {
                    value = row.agent?.[header.replace('agent', '').toLowerCase()] || 'N/A';
                    if (header === 'agentID') value = row.agent?.agentID || 'N/A';
                    if (header === 'agentName') value = row.agent?.name || 'N/A';
                } else if (header === 'customerName') {
                    value = row.customer?.name || 'N/A';
                }
            } else if (type === 'paymentsPaid') {
                if (header === 'CommissionPaid') {
                    value = value ? 'Paid' : 'Pending';
                } else if (header === 'dueDate') {
                    value = row.tourStartDate ? new Date(row.tourStartDate).toLocaleDateString() : 'N/A';
                } else if (header === 'commission') {
                    value = row.commissionReceived || 0;
                } else if (header === 'agentName') {
                    value = row.agentID?.name || 'N/A';
                } else if (header === 'agentID' && typeof row.agentID !== 'string') {
                    value = row.agentID?.agentID || 'N/A';
                }
            } else if (type === 'agentCommissionReport' || type === 'paymentsPaidDetailed') { // Apply similar logic for both detailed reports
                if (['totalCommissionEarned', 'totalCommissionPaid', 'totalCommissionPending', 'tourCommission'].includes(header)) {
                    // For tourCommission, ensure it's a number. For totals, keep as is for now.
                    value = value || 0;
                } else if (header === 'tourDueDate') {
                    value = value ? new Date(value).toLocaleDateString() : ''; // Use empty string for gaps
                } else if (header === 'tourCommissionStatus') {
                    value = (value === true) ? 'Paid' : ((value === false) ? 'Pending' : ''); // Use empty string for gaps
                } else if (header === 'parentAgent') {
                    value = row.parentAgent || 'N/A,N/A';
                }
            }


            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    escaped = value.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return Object.values(item).map(v => (v !== null && typeof v !== 'object') ? String(v) : (Array.isArray(v) ? v.join(',') : '')).filter(Boolean).join('; ');
                        }
                        return String(item);
                    }).filter(Boolean).join(' | ');

                } else {
                    escaped = Object.values(value).map(v => v !== null ? String(v) : '').filter(Boolean).join('; ');
                }
            } else {
                // Ensure empty string for null/undefined values to create gaps
                escaped = ('' + (value === undefined || value === null ? '' : value)).replace(/"/g, '""');
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
    const [paymentsReceived, setPaymentsReceived] = useState([]);
    const [paymentsPaid, setPaymentsPaid] = useState([]); // This will now hold AgentTourStats data

    // Loading and error states
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingPaymentsReceived, setLoadingPaymentsReceived] = useState(true);
    const [loadingPaymentsPaid, setLoadingPaymentsPaid] = useState(true); // For AgentTourStats
    const [errorAgents, setErrorAgents] = useState(null);
    const [errorCustomers, setErrorCustomers] = useState(null);
    const [errorPaymentsReceived, setErrorPaymentsReceived] = useState(null);
    const [errorPaymentsPaid, setErrorPaymentsPaid] = useState(null); // For AgentTourStats

    const [activeTab, setActiveTab] = useState('agents');
    const [agentSubTab, setAgentSubTab] = useState('all');
    const [paymentSubTab, setPaymentSubTab] = useState('received');

    // New state for Payments Paid view: 'table', 'agentWise', 'tourWise'
    const [commissionView, setCommissionView] = useState('table');
    // State to manage expanded accordions
    const [expandedAgents, setExpandedAgents] = useState({}); // For agent-wise view
    const [expandedTours, setExpandedTours] = useState({}); // For tour-wise view


    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [timeFilterReceived, setTimeFilterReceived] = useState('currentMonth');
    const [timeFilterPaid, setTimeFilterPaid] = useState('currentMonth');

    // State for custom date range for received payments
    const [startDateReceived, setStartDateReceived] = useState('');
    const [endDateReceived, setEndDateReceived] = useState('');

    // State for custom date range for paid payments (AgentTourStats)
    const [startDatePaid, setStartDatePaid] = useState('');
    const [endDatePaid, setEndDatePaid] = useState('');


    const itemsPerPage = 5;
    const token = localStorage.getItem('Token');

    const fetchAgents = async () => {
        try {
            setLoadingAgents(true);
            const response = await axios.get('/api/admin/all-agents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedAgents = Array.isArray(response.data.agents) ? response.data.agents : [];

            const agentsWithDerivedData = await Promise.all(fetchedAgents.map(async (agent) => {
                let parentAgentInfo = 'N/A,N/A';
                if (agent.parentAgent && typeof agent.parentAgent === 'string') {
                    try {
                        const parentResponse = await axios.get(`/api/admin/${agent.parentAgent}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (parentResponse.data && parentResponse.data.agent) {
                            const parent = parentResponse.data.agent;
                            parentAgentInfo = `${parent.name || 'N/A'},${parent.agentID || 'N/A'}`;
                        }
                    } catch (parentError) {
                        console.error(`Error fetching parent agent for ID ${agent.parentAgent}:`, parentError);
                        parentAgentInfo = `Error,Error`;
                    }
                }

                return {
                    name: agent.name || '',
                    agentID: agent.agentID || '',
                    gender: agent.gender || '',
                    dob: agent.dob ? new Date(agent.dob).toLocaleDateString() : '',
                    age: agent.age || 'N/A',
                    phone_calling: agent.phone_calling || '',
                    phone_whatsapp: agent.phone_whatsapp || '',
                    email: agent.email || '',
                    adhar_card: agent.aadhar_card || '',
                    pan_card: agent.pan_card || '',
                    profession: agent.profession || '',
                    income: agent.income || 0,
                    office_address: agent.office_address || {},
                    permanent_address: agent.permanent_address || {},
                    exclusive_zone: agent.exclusive_zone || [],
                    banking_details: agent.banking_details || {},
                    parentAgent: parentAgentInfo,
                    status: agent.status || '',
                    _id: agent._id,
                    createdAt: agent.createdAt,
                };
            }));

            setAgents(agentsWithDerivedData);
        } catch (err) {
            setErrorAgents('Failed to fetch agents.');
            setAgents([]);
            console.error('Error fetching agents:', err);
        } finally {
            setLoadingAgents(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, [token]);

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

    const fetchPaymentsReceived = async () => {
        try {
            setLoadingPaymentsReceived(true);
            let url = '/api/admin/booking-payments-overview';
            const params = {};

            if (timeFilterReceived === 'custom') {
                if (startDateReceived) params.startDate = startDateReceived;
                if (endDateReceived) params.endDate = endDateReceived;
            } else if (timeFilterReceived === 'currentMonth') {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
                params.startDate = firstDay;
                params.endDate = lastDay;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });
            setPaymentsReceived(Array.isArray(response.data.bookings) ? response.data.bookings : []);
        } catch (err) {
            setErrorPaymentsReceived('Failed to fetch received payments.');
            setPaymentsReceived([]);
            console.error('Error fetching received payments:', err);
        } finally {
            setLoadingPaymentsReceived(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'payments' && paymentSubTab === 'received') {
            fetchPaymentsReceived();
        }
    }, [token, timeFilterReceived, startDateReceived, endDateReceived, activeTab, paymentSubTab]);


    // Fetch Payments Paid (Commissions to Agents) using AgentTourStats model
    const fetchPaymentsPaid = async () => {
        try {
            setLoadingPaymentsPaid(true);
            let url = '/api/admin/agent-commission-stats';

            const params = {};

            if (timeFilterPaid === 'custom') {
                if (startDatePaid) params.startDate = startDatePaid;
                if (endDatePaid) params.endDate = endDatePaid;
            } else if (timeFilterPaid === 'currentMonth') {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
                params.startDate = firstDay;
                params.endDate = lastDay;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });
            setPaymentsPaid(Array.isArray(response.data.agentTourStats) ? response.data.agentTourStats : []);
        } catch (err) {
            setErrorPaymentsPaid('Failed to fetch paid payments (commissions).');
            setPaymentsPaid([]);
            console.error('Error fetching paid payments (commissions):', err);
        } finally {
            setLoadingPaymentsPaid(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'payments' && paymentSubTab === 'paid') {
            fetchPaymentsPaid();
        }
    }, [token, timeFilterPaid, startDatePaid, endDatePaid, activeTab, paymentSubTab]);


    // Function to mark commission as paid
    const handlePayCommission = async (tourStatsId) => {
        toast.info("Marking commission as paid...");
        try {
            const response = await axios.post(`/api/admin/pay-commission/${tourStatsId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Refresh the payments paid list after successful payment
                fetchPaymentsPaid();
            } else {
                toast.error(response.data.message || "Failed to mark commission as paid.");
            }
        } catch (error) {
            console.error('Error paying commission:', error);
            const errorMessage = error.response?.data?.message || 'Error marking commission as paid. Please try again.';
            toast.error(errorMessage);
        }
    };


    const filteredAgents = agents.filter(agent => {
        const matchesSearch =
            agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.phone_calling?.includes(searchTerm) ||
            agent.agentID?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSubTab =
            agentSubTab === 'all' ||
            (agentSubTab === 'active' && agent.status === 'active') ||
            (agentSubTab === 'pending' && agent.status === 'pending') ||
            (agentSubTab === 'inactive' && agent.status === 'inactive') ||
            (agentSubTab === 'rejected' && agent.status === 'rejected');

        return matchesSearch && matchesSubTab;
    });


    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

    const filteredPaymentsReceived = paymentsReceived.filter(payment => {
        const matchesSearch =
            (payment.agent?.name && payment.agent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.customer?.name && payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.tourName && payment.tourName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.bookingId && payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.paymentStatus && payment.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    // Filter AgentTourStats data
    const filteredPaymentsPaid = paymentsPaid.filter(stat => {
        const matchesSearch =
            (stat.agentID?.name && stat.agentID.name.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by agent name (populated)
            (stat.agentID && typeof stat.agentID === 'string' && stat.agentID.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by raw agent ID string
            (stat.tourID && stat.tourID.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (stat.CommissionPaid ? 'paid' : 'pending').includes(searchTerm.toLowerCase()); // Search by 'paid' or 'pending'

        return matchesSearch;
    });


    // Grouping for Agent-wise and Tour-wise views
    const groupedPaymentsPaidByAgent = filteredPaymentsPaid.reduce((acc, stat) => {
        const agentName = stat.agentID?.name || 'Unknown Agent';
        const agentID = stat.agentID?.agentID || stat.agentID; // Use populated agentID or raw string
        const key = `${agentName} (${agentID})`;
        if (!acc[key]) {
            acc[key] = {
                agentName: agentName,
                agentID: agentID,
                totalCommission: 0,
                totalPaid: 0,
                totalPending: 0,
                tours: []
            };
        }
        acc[key].tours.push(stat);
        acc[key].totalCommission += stat.commissionReceived || 0;
        if (stat.CommissionPaid) {
            acc[key].totalPaid += stat.commissionReceived || 0;
        } else {
            acc[key].totalPending += stat.commissionReceived || 0;
        }
        return acc;
    }, {});

    const groupedPaymentsPaidByTour = filteredPaymentsPaid.reduce((acc, stat) => {
        const tourName = stat.tourID || 'Unknown Tour';
        if (!acc[tourName]) {
            acc[tourName] = {
                tourName: tourName,
                totalCommission: 0,
                totalPaid: 0,
                totalPending: 0,
                agents: []
            };
        }
        acc[tourName].agents.push(stat);
        acc[tourName].totalCommission += stat.commissionReceived || 0;
        if (stat.CommissionPaid) {
            acc[tourName].totalPaid += stat.commissionReceived || 0;
        } else {
            acc[tourName].totalPending += stat.commissionReceived || 0;
        }
        return acc;
    }, {});


    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentAgents = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const currentPaymentsReceived = filteredPaymentsReceived.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination for payments paid is trickier with grouped data, will adjust
    // For now, let's keep it simple for the table view and handle other views separately.
    const currentPaymentsPaidTable = filteredPaymentsPaid.slice(indexOfFirstItem, indexOfLastItem);


    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate totals for summary cards
    const totalAgents = agents.length;
    const totalCustomers = customers.length;

    const totalPendingPaymentsCount = paymentsReceived.filter(p => p.paymentStatus === 'Pending').length;

    // Calculate payment summaries for Received Payments Tab
    const totalReceivedAmount = filteredPaymentsReceived.filter(p => p.paymentStatus === 'Paid').reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPendingAmount = filteredPaymentsReceived.filter(p => p.paymentStatus === 'Pending').reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalCommissionFromReceivedPayments = filteredPaymentsReceived.reduce((sum, payment) => sum + (payment.commissionAmount || 0), 0);

    // Calculate payment summaries for Paid Payments Tab (from AgentTourStats)
    const totalPaidCommission = filteredPaymentsPaid.filter(stat => stat.CommissionPaid).reduce((sum, stat) => sum + (stat.commissionReceived || 0), 0);
    const totalPendingCommissionToPay = filteredPaymentsPaid.filter(stat => !stat.CommissionPaid).reduce((sum, stat) => sum + (stat.commissionReceived || 0), 0);


    // Function to trigger download
    const downloadCSV = (data, filename, type) => {
        const csvData = convertToCSV(data, type);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('hidden', '');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // New function to prepare and download the Agent Commission Report CSV (for Agents tab)
    const downloadAgentCommissionReportCSV = () => {
        const reportRows = [];

        agents.forEach(agent => {
            const agentCommissions = paymentsPaid.filter(stat =>
                (stat.agentID?.agentID === agent.agentID) || // Check populated agentID
                (typeof stat.agentID === 'string' && stat.agentID === agent.agentID) // Check raw agentID string
            );

            let totalCommissionEarned = 0;
            let totalCommissionPaid = 0;
            let totalCommissionPending = 0;

            agentCommissions.forEach(commission => {
                totalCommissionEarned += commission.commissionReceived || 0;
                if (commission.CommissionPaid) {
                    totalCommissionPaid += commission.commissionReceived || 0;
                } else {
                    totalCommissionPending += commission.commissionReceived || 0;
                }
            });

            if (agentCommissions.length === 0) {
                // If agent has no commissions, create one row with N/A for tour details
                reportRows.push({
                    ...agent,
                    tourID: 'N/A',
                    tourDueDate: 'N/A',
                    tourCommission: 0,
                    tourCommissionStatus: 'N/A',
                    totalCommissionEarned: totalCommissionEarned,
                    totalCommissionPaid: totalCommissionPaid,
                    totalCommissionPending: totalCommissionPending,
                });
            } else {
                // For each commission record, create a row with agent details + tour details + overall totals
                agentCommissions.forEach(commission => {
                    reportRows.push({
                        ...agent,
                        tourID: commission.tourID || 'N/A',
                        tourDueDate: commission.tourStartDate, // Use tourStartDate as due date
                        tourCommission: commission.commissionReceived || 0,
                        tourCommissionStatus: commission.CommissionPaid,
                        totalCommissionEarned: totalCommissionEarned,
                        totalCommissionPaid: totalCommissionPaid,
                        totalCommissionPending: totalCommissionPending,
                    });
                });
            }
        });
        downloadCSV(reportRows, 'agent_commission_report.csv', 'agentCommissionReport');
    };

    // New function to prepare and download the Payments Paid Detailed Report CSV (for Payments tab)
    const downloadPaymentsPaidDetailedCSV = () => {
        const reportRows = [];

        // First, pre-calculate overall totals for each agent
        const agentOverallTotalsMap = new Map(); // Map<agentID, {earned, paid, pending}>
        paymentsPaid.forEach(stat => {
            const agentID = stat.agentID?.agentID || stat.agentID;
            if (!agentOverallTotalsMap.has(agentID)) {
                agentOverallTotalsMap.set(agentID, {
                    totalCommissionEarned: 0,
                    totalCommissionPaid: 0,
                    totalCommissionPending: 0
                });
            }
            const totals = agentOverallTotalsMap.get(agentID);
            totals.totalCommissionEarned += stat.commissionReceived || 0;
            if (stat.CommissionPaid) {
                totals.totalCommissionPaid += stat.commissionReceived || 0;
            } else {
                totals.totalCommissionPending += stat.commissionReceived || 0;
            }
        });

        // Iterate through all agents to ensure everyone is included, even if no tours
        agents.forEach(agent => {
            const agentCommissions = paymentsPaid.filter(stat =>
                (stat.agentID?.agentID === agent.agentID) ||
                (typeof stat.agentID === 'string' && stat.agentID === agent.agentID)
            );

            const overallTotals = agentOverallTotalsMap.get(agent.agentID) || {
                totalCommissionEarned: 0,
                totalCommissionPaid: 0,
                totalCommissionPending: 0
            };

            if (agentCommissions.length === 0) {
                // Agent has no tours, print one row with agent details and blank tour fields
                reportRows.push({
                    name: agent.name || '',
                    agentID: agent.agentID || '',
                    tourID: '', // Blank
                    tourDueDate: '', // Blank
                    tourCommission: '', // Blank
                    tourCommissionStatus: '', // Blank
                    totalCommissionEarned: overallTotals.totalCommissionEarned,
                    totalCommissionPaid: overallTotals.totalCommissionPaid,
                    totalCommissionPending: overallTotals.totalCommissionPending,
                });
            } else {
                // Agent has tours, iterate through them
                agentCommissions.forEach((commission, index) => {
                    reportRows.push({
                        name: index === 0 ? (agent.name || '') : '', // Only print name on first row
                        agentID: index === 0 ? (agent.agentID || '') : '', // Only print agentID on first row
                        tourID: commission.tourID || '',
                        tourDueDate: commission.tourStartDate,
                        tourCommission: commission.commissionReceived || 0,
                        tourCommissionStatus: commission.CommissionPaid,
                        // Only print total commission details on the LAST row for the agent
                        totalCommissionEarned: index === agentCommissions.length - 1 ? overallTotals.totalCommissionEarned : '',
                        totalCommissionPaid: index === agentCommissions.length - 1 ? overallTotals.totalCommissionPaid : '',
                        totalCommissionPending: index === agentCommissions.length - 1 ? overallTotals.totalCommissionPending : '',
                    });
                });
            }
        });
        downloadCSV(reportRows, 'payments_paid_detailed_report.csv', 'paymentsPaidDetailed');
    };


    // Function to toggle agent status
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

    const toggleAgentAccordion = (agentKey) => {
        setExpandedAgents(prevState => ({
            ...prevState,
            [agentKey]: !prevState[agentKey]
        }));
    };

    const toggleTourAccordion = (tourKey) => {
        setExpandedTours(prevState => ({
            ...prevState,
            [tourKey]: !prevState[tourKey]
        }));
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
                        <p className="text-gray-600 text-sm">Pending Customer Payments</p>
                        {loadingPaymentsReceived ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">{totalPendingPaymentsCount}</p>}
                        {errorPaymentsReceived && <p className="text-red-500 text-xs">{errorPaymentsReceived}</p>}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FaRupeeSign className="text-purple-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Commission (to be paid)</p>
                        {loadingPaymentsPaid ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold flex items-center gap-1"> <FaRupeeSign className='text-base'/> {totalPendingCommissionToPay.toLocaleString()}</p>}
                        {errorPaymentsPaid && <p className="text-red-500 text-xs">{errorPaymentsPaid}</p>}
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b">
                    <div className="flex space-x-2 mb-4 md:mb-0">
                        <button
                            onClick={() => { setActiveTab('agents'); setAgentSubTab('all'); setCurrentPage(1); setSearchTerm(''); }}
                            className={`px-4 py-2 rounded-md ${activeTab === 'agents' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Agents
                        </button>
                        <button
                            onClick={() => { setActiveTab('customers'); setCurrentPage(1); setSearchTerm(''); }}
                            className={`px-4 py-2 rounded-md ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Customers
                        </button>
                        <button
                            onClick={() => { setActiveTab('payments'); setCurrentPage(1); setSearchTerm(''); setPaymentSubTab('received'); setCommissionView('table'); }}
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
                                if (activeTab === 'agents') downloadCSV(filteredAgents, 'agents.csv', 'agents');
                                if (activeTab === 'customers') downloadCSV(filteredCustomers, 'customers.csv', 'customers');
                                if (activeTab === 'payments' && paymentSubTab === 'received') downloadCSV(filteredPaymentsReceived, 'payments_received.csv', 'paymentsReceived');
                                if (activeTab === 'payments' && paymentSubTab === 'paid') downloadCSV(filteredPaymentsPaid, 'payments_paid.csv', 'paymentsPaid');
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700"
                        >
                            <FiDownload className="mr-1" />
                            <span className="hidden md:inline">Download CSV</span>
                        </button>
                        {/* New button for Agent Commission Report (on Agents tab) */}
                        {activeTab === 'agents' && (
                            <button
                                onClick={downloadAgentCommissionReportCSV}
                                className="px-3 py-2 bg-purple-600 text-white rounded-md flex items-center hover:bg-purple-700"
                            >
                                <FiDownload className="mr-1" />
                                <span className="hidden md:inline">Agent Commission Report</span>
                            </button>
                        )}
                        {/* New button for Payments Paid Detailed Report (on Payments Paid sub-tab) */}
                        {activeTab === 'payments' && paymentSubTab === 'paid' && (
                            <button
                                onClick={downloadPaymentsPaidDetailedCSV}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
                            >
                                <FiDownload className="mr-1" />
                                <span className="hidden md:inline">Paid Commissions Detailed</span>
                            </button>
                        )}
                        <button
                            className="px-3 py-2 bg-gray-100 rounded-md"
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                                if (activeTab === 'agents') fetchAgents();
                                if (activeTab === 'customers') fetchCustomers();
                                if (activeTab === 'payments' && paymentSubTab === 'received') fetchPaymentsReceived();
                                if (activeTab === 'payments' && paymentSubTab === 'paid') fetchPaymentsPaid();
                            }}
                        >
                            <FiRefreshCw />
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${agent.status === 'active' ? 'bg-green-100 text-green-800' :
                                                              agent.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                              agent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                              'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {agent.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {agent.status === 'active' || agent.status === 'inactive' ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleAgentStatus(agent._id, agent.status);
                                                                }}
                                                                className={`p-2 rounded-full text-white transition-colors duration-200
                                                                    ${agent.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                                                title={agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'}
                                                            >
                                                                {agent.status === 'active' ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">N/A</span>
                                                        )}
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.totalBookings || 0}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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
                            {/* Payment Sub-Tabs */}
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={() => { setPaymentSubTab('received'); setCurrentPage(1); setTimeFilterReceived('currentMonth'); setStartDateReceived(''); setEndDateReceived(''); }}
                                    className={`px-4 py-2 rounded-md ${paymentSubTab === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Payments Received (from Customers)
                                </button>
                                <button
                                    onClick={() => { setPaymentSubTab('paid'); setCurrentPage(1); setTimeFilterPaid('currentMonth'); setStartDatePaid(''); setEndDatePaid(''); setCommissionView('table'); }}
                                    className={`px-4 py-2 rounded-md ${paymentSubTab === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Payments Paid (to Agents)
                                </button>
                            </div>

                            {paymentSubTab === 'received' && (
                                <>
                                    {/* Payment Received Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white rounded-lg shadow p-4 flex items-center">
                                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                                <FaRupeeSign className="text-green-600 text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Received Amount</p>
                                                <p className="text-2xl font-bold flex items-center gap-1"><FaRupeeSign className='text-base'/> {totalReceivedAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow p-4 flex items-center">
                                            <div className="bg-orange-100 p-3 rounded-full mr-4">
                                                <FaRupeeSign className="text-orange-600 text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Pending Amount</p>
                                                <p className="text-2xl font-bold flex items-center gap-1"><FaRupeeSign className='text-base'/> {totalPendingAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow p-4 flex items-center">
                                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                                <FaRupeeSign className="text-blue-600 text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Commission (from received)</p>
                                                <p className="text-2xl font-bold flex items-center gap-1"><FaRupeeSign className='text-base'/> {totalCommissionFromReceivedPayments.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Filter for Payments Received */}
                                    <div className="flex space-x-2 mb-4 items-center">
                                        <button
                                            onClick={() => { setTimeFilterReceived('currentMonth'); setStartDateReceived(''); setEndDateReceived(''); fetchPaymentsReceived(); }}
                                            className={`px-4 py-2 rounded-md ${timeFilterReceived === 'currentMonth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Current Month
                                        </button>
                                        <button
                                            onClick={() => { setTimeFilterReceived('all'); setStartDateReceived(''); setEndDateReceived(''); fetchPaymentsReceived(); }}
                                            className={`px-4 py-2 rounded-md ${timeFilterReceived === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            All Payments
                                        </button>
                                        <button
                                            onClick={() => setTimeFilterReceived('custom')}
                                            className={`px-4 py-2 rounded-md ${timeFilterReceived === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Custom Date Range
                                        </button>
                                        {timeFilterReceived === 'custom' && (
                                            <div className="flex space-x-2 ml-4">
                                                <input
                                                    type="date"
                                                    value={startDateReceived}
                                                    onChange={(e) => setStartDateReceived(e.target.value)}
                                                    className="p-2 border rounded-md"
                                                    placeholder="Start Date"
                                                />
                                                <input
                                                    type="date"
                                                    value={endDateReceived}
                                                    onChange={(e) => setEndDateReceived(e.target.value)}
                                                    className="p-2 border rounded-md"
                                                    placeholder="End Date"
                                                />
                                                <button
                                                    onClick={fetchPaymentsReceived}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {loadingPaymentsReceived ? (
                                        <div className="text-center py-8">Loading payments received...</div>
                                    ) : errorPaymentsReceived ? (
                                        <div className="text-center py-8 text-red-500">{errorPaymentsReceived}</div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentPaymentsReceived.length > 0 ? (
                                                    currentPaymentsReceived.map(payment => (
                                                        <tr key={payment._id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{payment.bookingId}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.tourName || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{payment.agent?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">ID: #{payment.agent?.agentID || 'N/A'}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.customer?.name || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(payment.amount || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(payment.commissionAmount || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                    ${payment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                      payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                      'bg-gray-100 text-gray-800'}`}>
                                                                    {payment.paymentStatus}
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
                                                            No received payments found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </>
                            )}

                            {paymentSubTab === 'paid' && (
                                <>
                                    {/* Payment Paid Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-white rounded-lg shadow p-4 flex items-center">
                                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                                <FaRupeeSign className="text-green-600 text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Commission Paid</p>
                                                <p className="text-2xl font-bold flex items-center gap-1"><FaRupeeSign className='text-base'/> {totalPaidCommission.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow p-4 flex items-center">
                                            <div className="bg-orange-100 p-3 rounded-full mr-4">
                                                <FaRupeeSign className="text-orange-600 text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Commission Pending To Pay</p>
                                                <p className="text-2xl font-bold flex items-center gap-1"><FaRupeeSign className='text-base'/> {totalPendingCommissionToPay.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Filter for Payments Paid */}
                                    <div className="flex space-x-2 mb-4 items-center">
                                        <button
                                            onClick={() => { setTimeFilterPaid('currentMonth'); setStartDatePaid(''); setEndDatePaid(''); fetchPaymentsPaid(); }}
                                            className={`px-4 py-2 rounded-md ${timeFilterPaid === 'currentMonth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Current Month
                                        </button>
                                        <button
                                            onClick={() => { setTimeFilterPaid('all'); setStartDatePaid(''); setEndDatePaid(''); fetchPaymentsPaid(); }}
                                            className={`px-4 py-2 rounded-md ${timeFilterPaid === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            All Payments
                                        </button>
                                        <button
                                            onClick={() => setTimeFilterPaid('custom')}
                                            className={`px-4 py-2 rounded-md ${timeFilterPaid === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Custom Date Range
                                        </button>
                                        {timeFilterPaid === 'custom' && (
                                            <div className="flex space-x-2 ml-4">
                                                <input
                                                    type="date"
                                                    value={startDatePaid}
                                                    onChange={(e) => setStartDatePaid(e.target.value)}
                                                    className="p-2 border rounded-md"
                                                    placeholder="Start Date"
                                                />
                                                <input
                                                    type="date"
                                                    value={endDatePaid}
                                                    onChange={(e) => setEndDatePaid(e.target.value)}
                                                    className="p-2 border rounded-md"
                                                    placeholder="End Date"
                                                />
                                                <button
                                                    onClick={fetchPaymentsPaid}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Commission View Toggles */}
                                    <div className="flex space-x-2 mb-4">
                                        <button
                                            onClick={() => { setCommissionView('table'); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-md ${commissionView === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Table View
                                        </button>
                                        <button
                                            onClick={() => { setCommissionView('agentWise'); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-md ${commissionView === 'agentWise' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Agent-wise
                                        </button>
                                        <button
                                            onClick={() => { setCommissionView('tourWise'); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-md ${commissionView === 'tourWise' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Tour-wise
                                        </button>
                                    </div>

                                    {loadingPaymentsPaid ? (
                                        <div className="text-center py-8">Loading payments paid...</div>
                                    ) : errorPaymentsPaid ? (
                                        <div className="text-center py-8 text-red-500">{errorPaymentsPaid}</div>
                                    ) : commissionView === 'table' ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th> {/* Now populated */}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th> {/* Renamed from Tour Start Date */}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Given</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th> {/* Renamed from Commission Received */}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> {/* Renamed from Payment Status */}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* For Pay Button */}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentPaymentsPaidTable.length > 0 ? (
                                                    currentPaymentsPaidTable.map(stat => (
                                                        <tr key={stat._id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.tourID || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{stat.agentID?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">ID: #{stat.agentID?.agentID || 'N/A'}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {stat.tourStartDate ? new Date(stat.tourStartDate).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.customerGiven || 0}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(stat.commissionReceived || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                    ${stat.CommissionPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                    {stat.CommissionPaid ? 'Paid' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                {!stat.CommissionPaid ? (
                                                                    <button
                                                                        onClick={() => handlePayCommission(stat._id)}
                                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                    >
                                                                        <FiDollarSign className="mr-1 h-4 w-4" /> Pay
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-500 text-xs">Already Paid</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                            No commission payments found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    ) : commissionView === 'agentWise' ? (
                                        <div className="space-y-4">
                                            {Object.keys(groupedPaymentsPaidByAgent).length > 0 ? (
                                                Object.entries(groupedPaymentsPaidByAgent).map(([agentKey, agentData]) => (
                                                    <div key={agentKey} className="border border-gray-200 rounded-lg shadow-sm">
                                                        <button
                                                            className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                                                            onClick={() => toggleAgentAccordion(agentKey)}
                                                        >
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                {agentData.agentName} (ID: #{agentData.agentID})
                                                            </h3>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="text-sm text-gray-600">Total Commission: <FaRupeeSign className='inline-block text-xs'/>{agentData.totalCommission.toLocaleString()}</span>
                                                                <span className="text-sm text-green-600">Paid: <FaRupeeSign className='inline-block text-xs'/>{agentData.totalPaid.toLocaleString()}</span>
                                                                <span className="text-sm text-orange-600">Pending: <FaRupeeSign className='inline-block text-xs'/>{agentData.totalPending.toLocaleString()}</span>
                                                                {expandedAgents[agentKey] ? <FiChevronUp /> : <FiChevronDown />}
                                                            </div>
                                                        </button>
                                                        {expandedAgents[agentKey] && (
                                                            <div className="p-4 border-t border-gray-200">
                                                                {agentData.tours.length > 0 ? (
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour ID</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Given</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {agentData.tours.map(tourStat => (
                                                                                <tr key={tourStat._id}>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{tourStat.tourID || 'N/A'}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{tourStat.tourStartDate ? new Date(tourStat.tourStartDate).toLocaleDateString() : 'N/A'}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{tourStat.customerGiven || 0}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">₹{(tourStat.commissionReceived || 0).toLocaleString()}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                                            ${tourStat.CommissionPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                                            {tourStat.CommissionPaid ? 'Paid' : 'Pending'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                                                        {!tourStat.CommissionPaid ? (
                                                                                            <button
                                                                                                onClick={() => handlePayCommission(tourStat._id)}
                                                                                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                                                                            >
                                                                                                <FiDollarSign className="mr-1 h-3 w-3" /> Pay
                                                                                            </button>
                                                                                        ) : (
                                                                                            <span className="text-gray-500 text-xs">Already Paid</span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                ) : (
                                                                    <p className="text-center text-gray-500 py-2">No tours for this agent.</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">No agent commission data found.</div>
                                            )}
                                        </div>
                                    ) : commissionView === 'tourWise' ? (
                                        <div className="space-y-4">
                                            {Object.keys(groupedPaymentsPaidByTour).length > 0 ? (
                                                Object.entries(groupedPaymentsPaidByTour).map(([tourKey, tourData]) => (
                                                    <div key={tourKey} className="border border-gray-200 rounded-lg shadow-sm">
                                                        <button
                                                            className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                                                            onClick={() => toggleTourAccordion(tourKey)}
                                                        >
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                Tour ID: {tourData.tourName}
                                                            </h3>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="text-sm text-gray-600">Total Commission: <FaRupeeSign className='inline-block text-xs'/>{tourData.totalCommission.toLocaleString()}</span>
                                                                <span className="text-sm text-green-600">Paid: <FaRupeeSign className='inline-block text-xs'/>{tourData.totalPaid.toLocaleString()}</span>
                                                                <span className="text-sm text-orange-600">Pending: <FaRupeeSign className='inline-block text-xs'/>{tourData.totalPending.toLocaleString()}</span>
                                                                {expandedTours[tourKey] ? <FiChevronUp /> : <FiChevronDown />}
                                                            </div>
                                                        </button>
                                                        {expandedTours[tourKey] && (
                                                            <div className="p-4 border-t border-gray-200">
                                                                {tourData.agents.length > 0 ? (
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Given</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {tourData.agents.map(agentStat => (
                                                                                <tr key={agentStat._id}>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{agentStat.agentID?.name || 'N/A'}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">#{agentStat.agentID?.agentID || 'N/A'}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{agentStat.tourStartDate ? new Date(agentStat.tourStartDate).toLocaleDateString() : 'N/A'}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{agentStat.customerGiven || 0}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">₹{(agentStat.commissionReceived || 0).toLocaleString()}</td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                                            ${agentStat.CommissionPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                                            {agentStat.CommissionPaid ? 'Paid' : 'Pending'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                                                        {!agentStat.CommissionPaid ? (
                                                                                            <button
                                                                                                onClick={() => handlePayCommission(agentStat._id)}
                                                                                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                                                                            >
                                                                                                <FiDollarSign className="mr-1 h-3 w-3" /> Pay
                                                                                            </button>
                                                                                        ) : (
                                                                                            <span className="text-gray-500 text-xs">Already Paid</span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                ) : (
                                                                    <p className="text-center text-gray-500 py-2">No agents for this tour.</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">No tour commission data found.</div>
                                            )}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </>
                    )}

                    {/* Pagination for all tabs */}
                    {((activeTab === 'agents' && filteredAgents.length > itemsPerPage) ||
                     (activeTab === 'customers' && filteredCustomers.length > itemsPerPage) ||
                     (activeTab === 'payments' && paymentSubTab === 'received' && filteredPaymentsReceived.length > itemsPerPage) ||
                     (activeTab === 'payments' && paymentSubTab === 'paid' && commissionView === 'table' && filteredPaymentsPaid.length > itemsPerPage)) ? ( // Only show pagination for table view of payments paid
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md mr-2 disabled:opacity-50"
                            >
                                <FiChevronLeft />
                            </button>
                            {Array.from({
                                length: Math.ceil(
                                    (activeTab === 'agents' ? filteredAgents.length :
                                     activeTab === 'customers' ? filteredCustomers.length :
                                     (activeTab === 'payments' && paymentSubTab === 'received' ? filteredPaymentsReceived.length :
                                      (activeTab === 'payments' && paymentSubTab === 'paid' && commissionView === 'table' ? filteredPaymentsPaid.length : 0))) / itemsPerPage
                                ),
                            }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`px-3 py-1 rounded-md mx-1 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={
                                    currentPage === Math.ceil(
                                        (activeTab === 'agents' ? filteredAgents.length :
                                         activeTab === 'customers' ? filteredCustomers.length :
                                         (activeTab === 'payments' && paymentSubTab === 'received' ? filteredPaymentsReceived.length :
                                          (activeTab === 'payments' && paymentSubTab === 'paid' && commissionView === 'table' ? filteredPaymentsPaid.length : 0))) / itemsPerPage
                                    )
                                }
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md ml-2 disabled:opacity-50"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
            {/* <Footer />
            <Navbar /> */}
        </div>
    );
};

export default MasterDataDashboard;
