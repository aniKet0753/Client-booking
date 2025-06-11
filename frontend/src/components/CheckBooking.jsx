import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaPrint, FaFileInvoice, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHotel, FaBus, FaUtensils, FaHiking, FaCamera } from 'react-icons/fa';
import { FiCalendar, FiUsers, FiUserCheck, FiX, FiCheck } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineAccessTime, MdPayment } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { SlCalender } from 'react-icons/sl';

const BookingSearchPage = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [booking, setBooking] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Mock function to fetch booking data - replace with actual API call
    const fetchBookingDetails = async (id) => {
        setLoading(true);
        setError('');
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock data - replace with actual API response
            const mockBooking = {
                id: id,
                status: 'confirmed',
                bookingDate: '2023-06-15T10:30:00Z',
                tour: {
                    id: 'tour123',
                    name: 'Himalayan Adventure Trek',
                    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                    duration: 7,
                    startDate: '2023-07-20',
                    endDate: '2023-07-27',
                    pricePerHead: 25000,
                    GST: 5,
                    categoryType: 'Trekking',
                    country: 'India',
                    tourType: 'Adventure',
                    occupancy: 12,
                    remainingOccupancy: 5,
                    description: 'An unforgettable trek through the majestic Himalayas with breathtaking views and cultural experiences.',
                    highlights: ['Sunrise at Tiger Hill', 'Visit to Rumtek Monastery', 'River rafting in Teesta'],
                    itinerary: [
                        {
                            dayNumber: 1,
                            title: 'Arrival in Gangtok',
                            description: 'Arrive at Bagdogra Airport and transfer to Gangtok. Evening at leisure.',
                            activities: [
                                { type: 'travel', title: 'Airport Transfer', description: 'Pickup from Bagdogra Airport to Gangtok hotel', time: '3 hours' },
                                { type: 'accommodation', title: 'Hotel Check-in', description: 'Orientation and welcome drinks', time: 'Evening' }
                            ]
                        },
                        // More itinerary days...
                    ],
                    inclusions: ['Accommodation', 'Meals (Breakfast & Dinner)', 'Trekking permits', 'Experienced guide'],
                    exclusions: ['Airfare', 'Travel insurance', 'Personal expenses'],
                    thingsToPack: ['Warm clothing', 'Trekking shoes', 'Sunscreen', 'Water bottle']
                },
                customer: {
                    name: 'Rajesh Kumar',
                    email: 'rajesh.kumar@example.com',
                    phone: '+91 9876543210',
                    address: '123 MG Road, Bangalore, Karnataka 560001'
                },
                travelers: [
                    { name: 'Rajesh Kumar', age: 32, gender: 'male' },
                    { name: 'Priya Kumar', age: 29, gender: 'female' }
                ],
                payment: {
                    totalAmount: 52500,
                    paidAmount: 52500,
                    paymentStatus: 'paid',
                    paymentMethod: 'Credit Card',
                    transactionId: 'txn_789456123',
                    paymentDate: '2023-06-15T11:45:00Z',
                    breakdown: [
                        { item: 'Base Price (2 pax)', amount: 50000 },
                        { item: 'GST (5%)', amount: 2500 }
                    ]
                },
                agent: {
                    id: 'agent456',
                    name: 'Travel World Agency',
                    commission: 2000
                }
            };

            setBooking(mockBooking);
        } catch (err) {
            setError('Failed to fetch booking details. Please try again.');
            console.error('Error fetching booking:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!bookingId.trim()) {
            setError('Please enter a booking ID');
            return;
        }
        fetchBookingDetails(bookingId);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
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

    // When you click "Generate Invoice"
    const handleOpenInvoiceModal = () => {
        if (!booking) return;
        setInvoiceData({
            customerName: booking.customer.name,
            customerEmail: booking.customer.email,
            customerPhone: booking.customer.phone,
            tourName: booking.tour.name,
            totalAmount: booking.payment.totalAmount,
            paidAmount: booking.payment.paidAmount,
            invoiceDate: new Date().toISOString().slice(0, 10),
        });
        setInvoiceModalOpen(true);
    };

    // Handle invoice field changes
    const handleInvoiceChange = (field, value) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    };

    // Print or save invoice
    const handlePrintInvoice = () => {
        const printContent = `
            <html>
                <head>
                    <title>Invoice - ${invoiceData.tourName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
                        h1, h2 { color: #1d4ed8; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background: #f3f4f6; }
                    </style>
                </head>
                <body>
                    <h1>Invoice</h1>
                    <p><strong>Date:</strong> ${invoiceData.invoiceDate}</p>
                    <h2>Customer</h2>
                    <p>Name: ${invoiceData.customerName}</p>
                    <p>Email: ${invoiceData.customerEmail}</p>
                    <p>Phone: ${invoiceData.customerPhone}</p>
                    <h2>Tour</h2>
                    <p>${invoiceData.tourName}</p>
                    <table>
                        <tr><th>Total Amount</th><td>${invoiceData.totalAmount}</td></tr>
                        <tr><th>Paid Amount</th><td>${invoiceData.paidAmount}</td></tr>
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
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header and Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    {/* <div className="flex items-center mb-4 md:mb-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-blue-600 hover:text-blue-800 mr-6 text-sm sm:text-base"
                        >
                            <FaArrowLeft className="mr-2" /> Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Booking Search</h1>
                    </div> */}

                    <div className="w-full bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSearch} className="w-full">
                            <h2 className='mb-2 xl:text-lg font-bold'>Search Booking</h2>
                            <div className="relative rounded-md shadow-sm max-w-[600px]">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-400 rounded-md h-[48px]"
                                    placeholder="Enter Booking ID"
                                    value={bookingId}
                                    onChange={(e) => setBookingId(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-md hover:bg-blue-700 h-[50px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FiX className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {booking && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        {/* Booking Header */}
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Booking #{booking.id}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        Created on {formatDate(booking.bookingDate)}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                    {getStatusBadge(booking.status)}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Booking Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('tour')}
                                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'tour' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Tour Information
                                </button>
                                <button
                                    onClick={() => setActiveTab('travelers')}
                                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'travelers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Travelers
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment')}
                                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'payment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Payment
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 sm:p-6">
                            {activeTab === 'details' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Customer Information */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <FaUser className="mr-2 text-blue-500" />
                                            Customer Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Name</p>
                                                <p className="mt-1 text-sm text-gray-900">{booking.customer.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Email</p>
                                                <p className="mt-1 text-sm text-gray-900 flex items-center">
                                                    <FaEnvelope className="mr-2 text-gray-400" />
                                                    {booking.customer.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                <p className="mt-1 text-sm text-gray-900 flex items-center">
                                                    <FaPhone className="mr-2 text-gray-400" />
                                                    {booking.customer.phone}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Address</p>
                                                <p className="mt-1 text-sm text-gray-900 flex items-start">
                                                    <FaMapMarkerAlt className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    {booking.customer.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tour Summary */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <FiCalendar className="mr-2 text-blue-500" />
                                            Tour Summary
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Tour Name</p>
                                                <p className="mt-1 text-sm text-gray-900">{booking.tour.name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                                                    <p className="mt-1 text-sm text-gray-900">{formatDate(booking.tour.startDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">End Date</p>
                                                    <p className="mt-1 text-sm text-gray-900">{formatDate(booking.tour.endDate)}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Duration</p>
                                                    <p className="mt-1 text-sm text-gray-900">{booking.tour.duration} days</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Travelers</p>
                                                    <p className="mt-1 text-sm text-gray-900">{booking.travelers.length} people</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                <p className="mt-1 text-lg font-semibold text-green-600">
                                                    {formatCurrency(booking.payment.totalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agent Information */}
                                    {booking.agent && (
                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                <FiUserCheck className="mr-2 text-blue-500" />
                                                Agent Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Agent ID</p>
                                                    <p className="mt-1 text-sm text-gray-900">{booking.agent.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Agent Name</p>
                                                    <p className="mt-1 text-sm text-gray-900">{booking.agent.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Commission</p>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {formatCurrency(booking.agent.commission)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="md:col-span-2 flex justify-end space-x-3">
                                        <button
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={() => {
                                                if (!booking) return;
                                                // Create a printable window with booking info
                                                const printContent = `
                                                    <html>
                                                        <head>
                                                            <title>Booking #${booking.id} - Print</title>
                                                            <style>
                                                                body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
                                                                h1, h2, h3 { color: #1d4ed8; }
                                                                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                                                th, td { border: 1px solid #ddd; padding: 8px; }
                                                                th { background: #f3f4f6; }
                                                                .section { margin-bottom: 32px; }
                                                                .label { font-weight: bold; }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            <h1>Booking #${booking.id}</h1>
                                                            <div class="section">
                                                                <h2>Customer Information</h2>
                                                                <table>
                                                                    <tr><td class="label">Name</td><td>${booking.customer.name}</td></tr>
                                                                    <tr><td class="label">Email</td><td>${booking.customer.email}</td></tr>
                                                                    <tr><td class="label">Phone</td><td>${booking.customer.phone}</td></tr>
                                                                    <tr><td class="label">Address</td><td>${booking.customer.address}</td></tr>
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Tour Information</h2>
                                                                <table>
                                                                    <tr><td class="label">Tour Name</td><td>${booking.tour.name}</td></tr>
                                                                    <tr><td class="label">Start Date</td><td>${booking.tour.startDate}</td></tr>
                                                                    <tr><td class="label">End Date</td><td>${booking.tour.endDate}</td></tr>
                                                                    <tr><td class="label">Duration</td><td>${booking.tour.duration} days</td></tr>
                                                                    <tr><td class="label">Travelers</td><td>${booking.travelers.length}</td></tr>
                                                                    <tr><td class="label">Total Amount</td><td>${booking.payment.totalAmount}</td></tr>
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Travelers</h2>
                                                                <table>
                                                                    <tr><th>Name</th><th>Age</th><th>Gender</th></tr>
                                                                    ${booking.travelers.map(t => `<tr><td>${t.name}</td><td>${t.age}</td><td>${t.gender}</td></tr>`).join('')}
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Payment</h2>
                                                                <table>
                                                                    <tr><td class="label">Status</td><td>${booking.payment.paymentStatus}</td></tr>
                                                                    <tr><td class="label">Method</td><td>${booking.payment.paymentMethod}</td></tr>
                                                                    <tr><td class="label">Transaction ID</td><td>${booking.payment.transactionId}</td></tr>
                                                                    <tr><td class="label">Payment Date</td><td>${booking.payment.paymentDate}</td></tr>
                                                                    <tr><td class="label">Paid Amount</td><td>${booking.payment.paidAmount}</td></tr>
                                                                </table>
                                                            </div>
                                                            <div class="section">
                                                                <h2>Agent</h2>
                                                                <table>
                                                                    <tr><td class="label">Agent ID</td><td>${booking.agent?.id || '-'}</td></tr>
                                                                    <tr><td class="label">Agent Name</td><td>${booking.agent?.name || '-'}</td></tr>
                                                                    <tr><td class="label">Commission</td><td>${booking.agent?.commission || '-'}</td></tr>
                                                                </table>
                                                            </div>
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
                                            <FaPrint className="mr-2" />
                                            Print Booking
                                        </button>
                                        <button
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={handleOpenInvoiceModal}
                                        >
                                            <FaFileInvoice className="mr-2" />
                                            Generate Invoice
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tour' && (
                                <div className="space-y-6">
                                    {/* Tour Overview */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Tour Overview</h4>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            {booking.tour.image && (
                                                <img
                                                    src={booking.tour.image}
                                                    alt={booking.tour.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800">{booking.tour.name}</h3>
                                                        <p className="text-gray-600 flex items-center mt-1">
                                                            <IoLocationOutline className="mr-2 text-blue-500" />
                                                            {booking.tour.categoryType} | {booking.tour.country}
                                                        </p>
                                                    </div>
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {booking.tour.tourType}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mt-3">{booking.tour.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tour Highlights */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Highlights</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.tour.highlights?.map((highlight, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                                >
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Itinerary */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Itinerary</h4>
                                        <div className="space-y-4">
                                            {booking.tour.itinerary?.map((day, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                        <h5 className="font-medium text-gray-800">
                                                            Day {day.dayNumber || index + 1}: {day.title}
                                                        </h5>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-gray-600 mb-3">{day.description}</p>
                                                        <div className="space-y-3">
                                                            {day.activities?.map((activity, idx) => (
                                                                <div key={idx} className="flex items-start">
                                                                    <div className="flex-shrink-0 mt-0.5">
                                                                        {activity.type === 'travel' && <FaBus className="text-blue-500 mr-3" />}
                                                                        {activity.type === 'sightseeing' && <FaCamera className="text-purple-500 mr-3" />}
                                                                        {activity.type === 'meal' && <FaUtensils className="text-yellow-500 mr-3" />}
                                                                        {activity.type === 'accommodation' && <FaHotel className="text-green-500 mr-3" />}
                                                                        {activity.type === 'hiking' && <FaHiking className="text-red-500 mr-3" />}
                                                                        {!['travel', 'sightseeing', 'meal', 'accommodation', 'hiking'].includes(activity.type) && (
                                                                            <FaMapMarkerAlt className="text-gray-500 mr-3" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="font-medium text-gray-800">{activity.title}</h6>
                                                                        {activity.description && (
                                                                            <p className="text-gray-600 text-sm">{activity.description}</p>
                                                                        )}
                                                                        {activity.time && (
                                                                            <p className="text-gray-500 text-xs mt-1">
                                                                                <MdOutlineAccessTime className="inline mr-1" />
                                                                                {activity.time}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'travelers' && (
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Travelers Information</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Age
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Gender
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {booking.travelers.map((traveler, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {traveler.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {traveler.age}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {traveler.gender.charAt(0).toUpperCase() + traveler.gender.slice(1)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payment' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <MdPayment className="mr-2 text-blue-500" />
                                            Payment Details
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Payment Status</p>
                                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                {booking.payment.paymentStatus.charAt(0).toUpperCase() + booking.payment.paymentStatus.slice(1)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                                            <p className="mt-1 text-sm text-gray-900">{booking.payment.paymentMethod}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                                                            <p className="mt-1 text-sm text-gray-900">{booking.payment.transactionId}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Payment Date</p>
                                                            <p className="mt-1 text-sm text-gray-900">{formatDate(booking.payment.paymentDate)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                            <p className="mt-1 text-lg font-semibold text-green-600">
                                                                {formatCurrency(booking.payment.totalAmount)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                                                            <p className="mt-1 text-sm font-semibold text-green-600">
                                                                {formatCurrency(booking.payment.paidAmount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Breakdown</h4>
                                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Description
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Amount
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {booking.payment.breakdown.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {item.item}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                                {formatCurrency(item.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            Total Amount
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                            {formatCurrency(booking.payment.totalAmount)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            {invoiceModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Invoice</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.customerName}
                                    onChange={e => handleInvoiceChange('customerName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer Email</label>
                                <input
                                    type="email"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.customerEmail}
                                    onChange={e => handleInvoiceChange('customerEmail', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.customerPhone}
                                    onChange={e => handleInvoiceChange('customerPhone', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tour Name</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.tourName}
                                    onChange={e => handleInvoiceChange('tourName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                <input
                                    type="number"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.totalAmount}
                                    onChange={e => handleInvoiceChange('totalAmount', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                                <input
                                    type="number"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.paidAmount}
                                    onChange={e => handleInvoiceChange('paidAmount', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                                <input
                                    type="date"
                                    className="w-full border px-3 py-2 rounded"
                                    value={invoiceData.invoiceDate}
                                    onChange={e => handleInvoiceChange('invoiceDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setInvoiceModalOpen(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePrintInvoice}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Print/Save Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingSearchPage;