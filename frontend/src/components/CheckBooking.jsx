import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api'; // Assuming your axios instance is exported from '../api'
import { FaSearch, FaPrint, FaFileInvoice, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHotel } from 'react-icons/fa';
import { FiCalendar, FiUsers, FiUserCheck, FiX, FiChevronRight } from 'react-icons/fi'; // Added FiChevronRight
import { MdPayment } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { SlCalender } from 'react-icons/sl';

const BookingSearchPage = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [tourID, setTourID] = useState('');
    const [tourName, setTourName] = useState('');
    const [tourStartDate, setTourStartDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State to hold all search results (array of bookings)
    const [searchResults, setSearchResults] = useState([]); 
    // State to hold the currently selected booking for detailed view
    const [selectedBooking, setSelectedBooking] = useState(null); 

    const [activeTab, setActiveTab] = useState('details');
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Function to fetch booking data from the API
    const fetchBookings = async (searchParams) => {
        setLoading(true);
        setError('');
        setSearchResults([]); // Clear previous search results
        setSelectedBooking(null); // Clear any selected booking

        try {
            const params = new URLSearchParams();
            if (searchParams.bookingId) params.append('bookingID', searchParams.bookingId);
            if (searchParams.tourID) params.append('tourID', searchParams.tourID);
            if (searchParams.tourName) params.append('tourName', searchParams.tourName);
            if (searchParams.tourStartDate) params.append('tourStartDate', searchParams.tourStartDate);

            const queryString = params.toString();
            const url = `/api/bookings${queryString ? `?${queryString}` : ''}`;

            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('Token')}`,
                },
            });

            const data = response.data; 
console.log(data)
            if (Array.isArray(data) && data.length > 0) {
                setSearchResults(data);
                // Optionally, automatically select the first booking if only one is returned, or if desired.
                // setSelectedBooking(data[0]); 
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                 // If the backend returns a single booking object directly
                setSearchResults([data]); // Wrap single object in an array for consistency
                // setSelectedBooking(data);
            }
            else {
                setError('No booking found matching your criteria.');
                setSearchResults([]);
            }
        } catch (err) {
            if (err.response) {
                console.error("Error response from server:", err.response.data);
                if (err.response.status === 404) {
                    setError(err.response.data.message || 'No booking found matching your criteria.');
                } else if (err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError(err.response.data.message || `Failed to fetch booking details (Status: ${err.response.status})`);
                }
            } else if (err.request) {
                console.error("No response received:", err.request);
                setError('Network error. No response from server. Please check your internet connection.');
            } else {
                console.error("Axios request setup error:", err.message);
                setError(`An unexpected error occurred: ${err.message}`);
            }
            setSearchResults([]);
            setSelectedBooking(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const searchParams = {
            bookingId: bookingId.trim(),
            tourID: tourID.trim(),
            tourName: tourName.trim(),
            tourStartDate: tourStartDate.trim(),
        };

        if (Object.values(searchParams).every(param => !param)) {
            setError('Please enter at least one search criterion.');
            setSearchResults([]);
            setSelectedBooking(null);
            return;
        }

        setError('');
        fetchBookings(searchParams);
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        // Optionally scroll to the detailed view
        const detailsSection = document.getElementById('booking-details-section');
        if (detailsSection) {
            detailsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const handleOpenInvoiceModal = () => {
        if (!selectedBooking) return; // Use selectedBooking
        setInvoiceData({
            customerName: selectedBooking.customer.name,
            customerEmail: selectedBooking.customer.email,
            customerPhone: selectedBooking.customer.phone,
            tourName: selectedBooking.tour.name,
            totalAmount: selectedBooking.payment.totalAmount,
            paidAmount: selectedBooking.payment.paidAmount,
            invoiceDate: new Date().toISOString().slice(0, 10),
            bookingId: selectedBooking.bookingID,
        });
        setInvoiceModalOpen(true);
    };

    const handleInvoiceChange = (field, value) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrintInvoice = () => {
        const printContent = `
            <html>
                <head>
                    <title>Invoice - Booking #${invoiceData.bookingId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
                        h1, h2 { color: #1d4ed8; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left;}
                        th { background: #f3f4f6; }
                        .text-right { text-align: right; }
                        .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;}
                        .invoice-header h1 { margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <h1>Invoice</h1>
                        <div>
                            <p><strong>Invoice Date:</strong> ${invoiceData.invoiceDate}</p>
                            <p><strong>Booking ID:</strong> ${invoiceData.bookingId}</p>
                        </div>
                    </div>

                    <h2>Customer Details</h2>
                    <table>
                        <tr><th>Name</th><td>${invoiceData.customerName}</td></tr>
                        <tr><th>Email</th><td>${invoiceData.customerEmail}</td></tr>
                        <tr><th>Phone</th><td>${invoiceData.customerPhone || 'N/A'}</td></tr>
                    </table>

                    <h2>Tour Details</h2>
                    <table>
                        <tr><th>Tour Name</th><td>${invoiceData.tourName}</td></tr>
                    </table>

                    <h2>Payment Summary</h2>
                    <table>
                        <tr><th>Description</th><th class="text-right">Amount</th></tr>
                        <tr><td>Total Booking Amount</td><td class="text-right">${formatCurrency(invoiceData.totalAmount || 0)}</td></tr>
                        <tr><td>Amount Paid</td><td class="text-right">${formatCurrency(invoiceData.paidAmount || 0)}</td></tr>
                        <tr><td><strong>Balance Due</strong></td><td class="text-right"><strong>${formatCurrency((invoiceData.totalAmount || 0) - (invoiceData.paidAmount || 0))}</strong></td></tr>
                    </table>
                    <p style="margin-top:40px;font-size:12px;color:#888;">Printed on ${new Date().toLocaleString()}</p>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = function () {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 400);
        };
        setInvoiceModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow-xl rounded-xl p-8 mb-8">
                    <h2 className='text-3xl font-extrabold text-gray-900 mb-6 text-center'>Find Any Booking</h2>
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Booking ID */}
                            <div>
                                <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="bookingId"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 sm:text-base border-gray-300 rounded-md transition-all duration-200 hover:border-blue-400"
                                        placeholder="e.g., BKG001"
                                        value={bookingId}
                                        onChange={(e) => setBookingId(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Tour ID */}
                            <div>
                                <label htmlFor="tourID" className="block text-sm font-medium text-gray-700 mb-1">Tour ID</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IoLocationOutline className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="tourID"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 sm:text-base border-gray-300 rounded-md transition-all duration-200 hover:border-blue-400"
                                        placeholder="e.g., 683ed99b3a44a7ade21e2d31"
                                        value={tourID}
                                        onChange={(e) => setTourID(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Tour Name */}
                            <div>
                                <label htmlFor="tourName" className="block text-sm font-medium text-gray-700 mb-1">Tour Name</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaHotel className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="tourName"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 sm:text-base border-gray-300 rounded-md transition-all duration-200 hover:border-blue-400"
                                        placeholder="e.g., Himalayan Adventure"
                                        value={tourName}
                                        onChange={(e) => setTourName(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Tour Start Date */}
                            <div>
                                <label htmlFor="tourStartDate" className="block text-sm font-medium text-gray-700 mb-1">Tour Start Date</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SlCalender className="text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        id="tourStartDate"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 sm:text-base border-gray-300 rounded-md transition-all duration-200 hover:border-blue-400"
                                        value={tourStartDate}
                                        onChange={(e) => setTourStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : (
                                    <>
                                        <FaSearch className="inline-block mr-3" /> Search Bookings
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 mb-8 border border-red-200 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FiX className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-base font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Display Search Results */}
                {searchResults.length > 0 && !selectedBooking && (
                    <div className="bg-white shadow-xl rounded-xl p-8 mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                            {searchResults.length} Booking{searchResults.length > 1 ? 's' : ''} Found
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map(bookingItem => (
                                <div 
                                    key={bookingItem._id} 
                                    className="bg-gray-50 rounded-lg shadow-sm p-5 border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
                                    onClick={() => handleViewDetails(bookingItem)}
                                >
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                Booking ID: {bookingItem.bookingID}
                                            </h4>
                                            {getStatusBadge(bookingItem.status)}
                                        </div>
                                        <p className="text-sm text-gray-700 mb-1">
                                            Tour: <span className="font-medium">{bookingItem.tour.name}</span>
                                        </p>
                                        <p className="text-sm text-gray-700 mb-1">
                                            Start Date: <span className="font-medium">{formatDate(bookingItem.tour.startDate)}</span>
                                        </p>
                                        <p className="text-sm text-gray-700 mb-3">
                                            Customer: <span className="font-medium">{bookingItem.customer.name}</span>
                                        </p>
                                    </div>
                                    <div className="flex justify-end items-center text-blue-600 font-medium hover:underline">
                                        View Details <FiChevronRight className="ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detailed Booking View */}
                {selectedBooking && (
                    <div id="booking-details-section" className="bg-white shadow-xl rounded-xl overflow-hidden mt-8">
                        <div className="px-6 py-5 sm:px-8 bg-blue-600 text-white flex flex-col sm:flex-row sm:justify-between sm:items-center rounded-t-xl">
                            <div>
                                <h3 className="text-xl leading-6 font-semibold">
                                    Booking #{selectedBooking.bookingID}
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm opacity-90">
                                    Created on {formatDate(selectedBooking.bookingDate)}
                                </p>
                            </div>
                            <div className="mt-2 sm:mt-0">
                                {getStatusBadge(selectedBooking.status)}
                            </div>
                        </div>

                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex bg-gray-50 rounded-b-xl overflow-hidden">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'details' ? 'border-blue-600 text-blue-800 bg-white shadow-inner' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
                                >
                                    Booking Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('tour')}
                                    className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'tour' ? 'border-blue-600 text-blue-800 bg-white shadow-inner' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
                                >
                                    Tour Information
                                </button>
                                <button
                                    onClick={() => setActiveTab('travelers')}
                                    className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'travelers' ? 'border-blue-600 text-blue-800 bg-white shadow-inner' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
                                >
                                    Travelers
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment')}
                                    className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'payment' ? 'border-blue-600 text-blue-800 bg-white shadow-inner' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
                                >
                                    Payment
                                </button>
                            </nav>
                        </div>

                        <div className="p-6 sm:p-8">
                            {activeTab === 'details' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                            <FaUser className="mr-3 text-blue-500 text-2xl" />
                                            Customer Information
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Name</p>
                                                <p className="mt-1 text-base text-gray-900">{selectedBooking.customer.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Email</p>
                                                <p className="mt-1 text-base text-gray-900 flex items-center">
                                                    <FaEnvelope className="mr-2 text-gray-500" />
                                                    {selectedBooking.customer.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Phone</p>
                                                <p className="mt-1 text-base text-gray-900 flex items-center">
                                                    <FaPhone className="mr-2 text-gray-500" />
                                                    {selectedBooking.customer.phone || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Address</p>
                                                <p className="mt-1 text-base text-gray-900 flex items-start">
                                                    <FaMapMarkerAlt className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                                                    {selectedBooking.customer.address || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                            <FiCalendar className="mr-3 text-blue-500 text-2xl" />
                                            Tour Summary
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Tour Name</p>
                                                <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">Start Date</p>
                                                    <p className="mt-1 text-base text-gray-900">{formatDate(selectedBooking.tour.startDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">End Date</p>
                                                    <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.endDate ? formatDate(selectedBooking.tour.endDate) : 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">Duration</p>
                                                    <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.duration || 'N/A'} days</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">Travelers</p>
                                                    <p className="mt-1 text-base text-gray-900">{selectedBooking.travelers.length} people</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Total Amount</p>
                                                <p className="mt-1 text-xl font-bold text-green-600">
                                                    {formatCurrency(selectedBooking.payment?.totalAmount || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedBooking.agent && (
                                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
                                            <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                                <FiUserCheck className="mr-3 text-blue-500 text-2xl" />
                                                Agent Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">Agent ID</p>
                                                    <p className="mt-1 text-base text-gray-900">{selectedBooking.agent.agentId || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">Agent Name</p>
                                                    <p className="mt-1 text-base text-gray-900">{selectedBooking.agent.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600">Commission</p>
                                                    <p className="mt-1 text-base text-gray-900">
                                                        {formatCurrency(selectedBooking.agent.commission || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
                                        {/* Print Booking Summary Button */}
                                        <button
                                            className="inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                            onClick={() => {
                                                if (!selectedBooking) return;
                                                const printContent = `
                                                    <html>
                                                        <head>
                                                            <title>Booking #${selectedBooking.bookingID} - Print Summary</title>
                                                            <style>
                                                                body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
                                                                h1, h2, h3 { color: #1d4ed8; }
                                                                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left;}
                                                                th { background: #f3f4f6; }
                                                                .section { margin-bottom: 32px; }
                                                                .label { font-weight: bold; }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            <h1>Booking Summary - #${selectedBooking.bookingID}</h1>
                                                            <div class="section">
                                                                <h2>Customer Information</h2>
                                                                <table>
                                                                    <tr><td class="label">Name</td><td>${selectedBooking.customer.name}</td></tr>
                                                                    <tr><td class="label">Email</td><td>${selectedBooking.customer.email}</td></tr>
                                                                    <tr><td class="label">Phone</td><td>${selectedBooking.customer.phone || 'N/A'}</td></tr>
                                                                    <tr><td class="label">Address</td><td>${selectedBooking.customer.address || 'N/A'}</td></tr>
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Tour Information</h2>
                                                                <table>
                                                                    <tr><td class="label">Tour Name</td><td>${selectedBooking.tour.name}</td></tr>
                                                                    <tr><td class="label">Tour ID</td><td>${selectedBooking.tour.tourID || selectedBooking.tour._id || 'N/A'}</td></tr>
                                                                    <tr><td class="label">Start Date</td><td>${formatDate(selectedBooking.tour.startDate)}</td></tr>
                                                                    <tr><td class="label">End Date</td><td>${selectedBooking.tour.endDate ? formatDate(selectedBooking.tour.endDate) : 'N/A'}</td></tr>
                                                                    <tr><td class="label">Duration</td><td>${selectedBooking.tour.duration || 'N/A'} days</td></tr>
                                                                    <tr><td class="label">Travelers</td><td>${selectedBooking.travelers.length}</td></tr>
                                                                    <tr><td class="label">Total Amount</td><td>${formatCurrency(selectedBooking.payment?.totalAmount || 0)}</td></tr>
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Travelers</h2>
                                                                <table>
                                                                    <tr><th>Name</th><th>Age</th><th>Gender</th></tr>
                                                                    ${selectedBooking.travelers.map(t => `<tr><td>${t.name}</td><td>${t.age || 'N/A'}</td><td>${t.gender || 'N/A'}</td></tr>`).join('')}
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Payment</h2>
                                                                <table>
                                                                    <tr><td class="label">Status</td><td>${selectedBooking.payment?.paymentStatus || 'N/A'}</td></tr>
                                                                    <tr><td class="label">Paid Amount</td><td>${formatCurrency(selectedBooking.payment?.paidAmount || 0)}</td></tr>
                                                                    <tr><td class="label">Total Amount</td><td>${formatCurrency(selectedBooking.payment?.totalAmount || 0)}</td></tr>
                                                                    <tr><td class="label">Balance Due</td><td>${formatCurrency((selectedBooking.payment?.totalAmount || 0) - (selectedBooking.payment?.paidAmount || 0))}</td></tr>
                                                                    <tr><td class="label">Method</td><td>${selectedBooking.payment?.paymentMethod || 'N/A'}</td></tr>
                                                                    <tr><td class="label">Transaction ID</td><td>${selectedBooking.payment?.transactionId || 'N/A'}</td></tr>
                                                                    <tr><td class="label">Payment Date</td><td>${selectedBooking.payment?.paymentDate ? formatDate(selectedBooking.payment.paymentDate) : 'N/A'}</td></tr>
                                                                </table>
                                                            </div>
                                                            ${selectedBooking.agent ? `
                                                                <div class="section">
                                                                    <h2>Agent Information</h2>
                                                                    <table>
                                                                        <tr><td class="label">Agent ID</td><td>${selectedBooking.agent.agentId || 'N/A'}</td></tr>
                                                                        <tr><td class="label">Name</td><td>${selectedBooking.agent.name || 'N/A'}</td></tr>
                                                                        <tr><td class="label">Commission</td><td>${formatCurrency(selectedBooking.agent.commission || 0)}</td></tr>
                                                                    </table>
                                                                </div>
                                                            ` : ''}
                                                            <p style="margin-top:40px;font-size:12px;color:#888;">Printed on ${new Date().toLocaleString()}</p>
                                                        </body>
                                                    </html>
                                                `;
                                                const printWindow = window.open('', '_blank');
                                                printWindow.document.open();
                                                printWindow.document.write(printContent);
                                                printWindow.document.close();
                                                printWindow.onload = function () {
                                                    setTimeout(() => {
                                                        printWindow.print();
                                                        printWindow.close();
                                                    }, 400);
                                                };
                                            }}
                                        >
                                            <FaPrint className="mr-2" /> Print Booking Summary
                                        </button>
                                        <button
                                            className="inline-flex items-center px-6 py-2.5 border border-blue-600 shadow-sm text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                            onClick={handleOpenInvoiceModal}
                                        >
                                            <FaFileInvoice className="mr-2" /> Generate/Print Invoice
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tour' && selectedBooking.tour && (
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">Tour Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Tour ID</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.tourID || selectedBooking.tour._id || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Tour Name</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Category</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.categoryType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Country</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.country || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Tour Type</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.tourType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Price Per Head</p>
                                            <p className="mt-1 text-base text-gray-900">{formatCurrency(selectedBooking.tour.pricePerHead || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">GST</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.GST || 0}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Duration</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.duration || 'N/A'} days</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Occupancy</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.occupancy || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Remaining Occupancy</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.remainingOccupancy || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Start Date</p>
                                            <p className="mt-1 text-base text-gray-900">{formatDate(selectedBooking.tour.startDate)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <p className="text-sm font-semibold text-gray-600">Description</p>
                                        <p className="mt-1 text-base text-gray-900">{selectedBooking.tour.description}</p>
                                    </div>
                                    {selectedBooking.tour.highlights && selectedBooking.tour.highlights.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-600">Highlights</p>
                                            <ul className="list-disc list-inside mt-2 text-base text-gray-900 space-y-1">
                                                {selectedBooking.tour.highlights.map((item, idx) => <li key={idx}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedBooking.tour.inclusions && selectedBooking.tour.inclusions.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-600">Inclusions</p>
                                            <ul className="list-disc list-inside mt-2 text-base text-gray-900 space-y-1">
                                                {selectedBooking.tour.inclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedBooking.tour.exclusions && selectedBooking.tour.exclusions.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-600">Exclusions</p>
                                            <ul className="list-disc list-inside mt-2 text-base text-gray-900 space-y-1">
                                                {selectedBooking.tour.exclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedBooking.tour.thingsToPack && selectedBooking.tour.thingsToPack.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-600">Things to Pack</p>
                                            <ul className="list-disc list-inside mt-2 text-base text-gray-900 space-y-1">
                                                {selectedBooking.tour.thingsToPack.map((item, idx) => <li key={idx}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedBooking.tour.itinerary && selectedBooking.tour.itinerary.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-600">Itinerary</p>
                                            <ul className="list-disc list-inside mt-2 text-base text-gray-900 space-y-3">
                                                {selectedBooking.tour.itinerary.map((item, idx) => (
                                                    typeof item === 'object' && item !== null ? (
                                                        <li key={item._id || idx} className="mb-2">
                                                            <p className="font-bold text-gray-900">Day {item.dayNumber}: {item.title}</p>
                                                            <p className="text-sm text-gray-700">{item.description}</p>
                                                            {item.activities?.length > 0 && (
                                                                <ul className="list-disc ml-6 mt-1 text-gray-700 text-sm space-y-0.5">
                                                                    {item.activities.map((activity, i) => (
                                                                        typeof activity === 'object' && activity !== null ? (
                                                                            <li key={i}>{activity.title || activity.description || `Activity (details missing)`}
                                                                                {activity.time && <span className="ml-1 text-gray-500 font-normal">({activity.time})</span>}
                                                                            </li>
                                                                        ) : (
                                                                            <li key={i}>{String(activity)}</li>
                                                                        )
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    ) : (
                                                        <li key={idx} className="mb-2 text-red-500">
                                                            Invalid itinerary item: {String(item)}
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {selectedBooking.tour.gallery && selectedBooking.tour.gallery.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-600">Gallery</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
                                                {selectedBooking.tour.gallery.map((imgSrc, idx) => (
                                                    <img key={idx} src={imgSrc} alt={`Gallery Image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'travelers' && selectedBooking.travelers && selectedBooking.travelers.length > 0 && (
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-800 mb-5">Traveler Details</h4>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        Age
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        Gender
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        ID Type
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        ID Number
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedBooking.travelers.map((traveler, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {traveler.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {traveler.age || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {traveler.gender || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {traveler.idType || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {traveler.idNumber || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payment' && selectedBooking.payment && (
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                        <MdPayment className="mr-3 text-blue-500 text-2xl" />
                                        Payment Details
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Payment Status</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.payment.paymentStatus || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Total Amount</p>
                                            <p className="mt-1 text-base text-gray-900">{formatCurrency(selectedBooking.payment.totalAmount || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Paid Amount</p>
                                            <p className="mt-1 text-base text-gray-900">{formatCurrency(selectedBooking.payment.paidAmount || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Balance Due</p>
                                            <p className="mt-1 text-base text-gray-900">
                                                {formatCurrency((selectedBooking.payment.totalAmount || 0) - (selectedBooking.payment.paidAmount || 0))}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Payment Method</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.payment.paymentMethod || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Transaction ID</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.payment.transactionId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600">Payment Date</p>
                                            <p className="mt-1 text-base text-gray-900">{selectedBooking.payment.paymentDate ? formatDate(selectedBooking.payment.paymentDate) : 'N/A'}</p>
                                        </div>
                                        {selectedBooking.payment.breakdown && selectedBooking.payment.breakdown.length > 0 && (
                                            <div className="mt-6">
                                                <p className="text-sm font-semibold text-gray-600">Payment Breakdown</p>
                                                <ul className="list-disc list-inside mt-2 text-base text-gray-900 space-y-0.5">
                                                    {selectedBooking.payment.breakdown.map((item, idx) => (
                                                        <li key={idx}>{item.item}: {formatCurrency(item.amount || 0)}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!loading && searchResults.length === 0 && !error && !selectedBooking && (
                    <div className="text-center py-16">
                        <FaSearch className="mx-auto text-5xl text-gray-400 mb-6" />
                        <h3 className="text-xl font-bold text-gray-700">Search for a booking</h3>
                        <p className="text-gray-500 mt-2 text-base">Enter details in the form above to find a specific booking.</p>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            {invoiceModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                            <h3 className="text-lg font-semibold text-gray-900">Generate Invoice</h3>
                            <button onClick={() => setInvoiceModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="invoiceCustomerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                                <input
                                    type="text"
                                    id="invoiceCustomerName"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.customerName || ''}
                                    onChange={(e) => handleInvoiceChange('customerName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invoiceCustomerEmail" className="block text-sm font-medium text-gray-700">Customer Email</label>
                                <input
                                    type="email"
                                    id="invoiceCustomerEmail"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.customerEmail || ''}
                                    onChange={(e) => handleInvoiceChange('customerEmail', e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invoiceCustomerPhone" className="block text-sm font-medium text-gray-700">Customer Phone</label>
                                <input
                                    type="text"
                                    id="invoiceCustomerPhone"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.customerPhone || ''}
                                    onChange={(e) => handleInvoiceChange('customerPhone', e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invoiceTourName" className="block text-sm font-medium text-gray-700">Tour Name</label>
                                <input
                                    type="text"
                                    id="invoiceTourName"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.tourName || ''}
                                    onChange={(e) => handleInvoiceChange('tourName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invoiceTotalAmount" className="block text-sm font-medium text-gray-700">Total Amount</label>
                                <input
                                    type="number"
                                    id="invoiceTotalAmount"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.totalAmount || 0}
                                    onChange={(e) => handleInvoiceChange('totalAmount', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invoicePaidAmount" className="block text-sm font-medium text-gray-700">Amount Paid</label>
                                <input
                                    type="number"
                                    id="invoicePaidAmount"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.paidAmount || 0}
                                    onChange={(e) => handleInvoiceChange('paidAmount', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">Invoice Date</label>
                                <input
                                    type="date"
                                    id="invoiceDate"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={invoiceData.invoiceDate || ''}
                                    onChange={(e) => handleInvoiceChange('invoiceDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => setInvoiceModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handlePrintInvoice}
                            >
                                Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingSearchPage;