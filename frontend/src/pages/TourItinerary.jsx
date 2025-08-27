import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { IoLocationOutline } from 'react-icons/io5';
import { MdOutlineAccessTime } from 'react-icons/md';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { SlCalender } from 'react-icons/sl';
import { FaArrowLeft, FaMapMarkerAlt, FaHotel, FaUtensils, FaBus, FaHiking, FaCamera, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaPrint } from 'react-icons/fa';
import { FiX, FiUsers, FiUserCheck, FiCalendar, FiCheck } from 'react-icons/fi';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import axios from '../api';
import NeedHelp from '../components/NeedHelp';
import Swal from 'sweetalert2'; // For better alert messages

const TourItinerary = () => {
    const { tourID } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    // activeDay = 0 for Overview, 1 for Day 1, 2 for Day 2, etc.
    const [activeDay, setActiveDay] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedTourDate, setSelectedTourDate] = useState(null); // Will hold the full tour object for booking
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [numberOfChildren, setNumberOfChildren] = useState(0);
    const [agentReferralId, setAgentReferralId] = useState('');
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');

    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchTour = async () => {
            try {
                setLoading(true);
                // Use the actual API call
                const FetchToursRoute = role === 'superadmin' ? 'api/admin/tours' : role === 'customer' ? 'api/customer/tours' : 'api/agents/tours';
                const response = await axios.get(`${FetchToursRoute}/${tourID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: role,
                    },
                });
                // Ensure data.tour is directly used as your backend sends { tour: tourObject }
                setTour(response.data.tour);
            } catch (error) {
                console.error('Error fetching tour:', error);
                Swal.fire('Error', error?.response?.data?.message || 'Failed to load tour details.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [tourID, token, role]);

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Invalid date string:", dateString, e);
            return 'Invalid Date yes';
        }
    };

    const handleModalContinue = async () => {
        const numPeople = parseInt(numberOfPeople, 10) + parseInt(numberOfChildren, 10);

        setBookingError("");
        setBookingSuccessMessage("");

        if (isNaN(numPeople) || numPeople <= 0) {
            setBookingError("Please enter a valid number of people (greater than 0).");
            return;
        }

        if (!selectedTourDate) {
            setBookingError("No tour selected. Please close and try again.");
            return;
        }

        if (numPeople > selectedTourDate.remainingOccupancy) {
            setBookingError(`Only ${selectedTourDate.remainingOccupancy} seats available. Please enter a lower number.`);
            return;
        }

        // Agent Referral ID validation (API call)
        if (agentReferralId) {
            try {
                const res = await axios.get(`/api/agents/verify-agentID/${agentReferralId.trim()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: role,
                    },
                });
                // If status is not 200, it means validation failed, but Axios throws error for non-2xx
                // So, if we reach here, it's valid.
                console.log("Agent validation successful:", res.data);
            } catch (err) {
                console.error("Agent validation error:", err);
                if (err.response && err.response.data && err.response.data.message) {
                    setBookingError(err.response.data.message);
                } else {
                    setBookingError("Agent Referral ID validation failed. Please try again.");
                }
                return;
            }
        }

        const agentID = agentReferralId ? agentReferralId.trim() : '';
        const tourID = selectedTourDate.tourID; // Use the actual tourID from fetched data

        const message = `Booking ${numPeople} people for ${selectedTourDate.name}. Redirecting to KYC page...`;
        setBookingSuccessMessage(message);

        const query = new URLSearchParams();
        if (agentID) query.append('a', agentID);  // 'a' for agent
        query.append('t', tourID);                // 't' for tour
        query.append('p', numPeople);             // 'p' for people

        const fullLink = `/kyc?${query.toString()}`;
        console.log("Navigating to:", fullLink);

        setTimeout(() => {
            setIsBookingModalOpen(false);
            navigate(fullLink);
        }, 1500); // Shorter timeout for better UX
    };

    const handlePrint = () => {
        // Create print content HTML with tables
        const printContent = `
        <html>
            <head>
                <title>${tour.name} - Itinerary</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .tour-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #222; }
                    .tour-image { width: 100%; max-height: 300px; object-fit: cover; margin-bottom: 20px; }
                    .section-title { font-size: 20px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin: 25px 0 15px 0; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .info-table td { padding: 8px; border: 1px solid #ddd; }
                    .info-table tr:nth-child(even) { background-color: #f9f9f9; }
                    .highlight { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
                    .activity-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .activity-table th { background-color: #f5f5f5; text-align: left; padding: 10px; border: 1px solid #ddd; }
                    .activity-table td { padding: 10px; border: 1px solid #ddd; vertical-align: top; }
                    .price { font-weight: bold; color: #2a6496; }
                    .footer { margin-top: 40px; font-size: 12px; color: #777; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="tour-title">${tour.categoryType} | ${tour.country}</h1>
                    <table class="info-table">
                        <tr>
                            <td width="25%">Location</td>
                            <td>${tour.name}</td>
                        </tr>
                        <tr>
                            <td>Duration</td>
                            <td>${tour.duration} days</td>
                        </tr>
                        <tr>
                            <td>Start Date</td>
                            <td>${formatDateForDisplay(tour.startDate)}</td>
                        </tr>
                        <tr>
                            <td>Tour Type</td>
                            <td>${tour.tourType}</td>
                        </tr>
                        <tr>
                            <td>Price</td>
                            <td class="price">₹${tour.pricePerHead?.toLocaleString()} per person</td>
                        </tr>
                        <tr>
                            <td>Available Spots</td>
                            <td>${tour.remainingOccupancy}</td>
                        </tr>
                    </table>
                </div>

                ${tour.image ? `<img src="${tour.image}" alt="${tour.name}" class="tour-image">` : ''}

                <h2 class="section-title">Tour Description</h2>
                <p>${tour.description}</p>

                ${tour.highlights?.length > 0 ? `
                    <h2 class="section-title">Tour Highlights</h2>
                    <p>${tour.highlights.map(h => `<span class="highlight">${h}</span>`).join(' ')}</p>
                ` : ''}

                <h2 class="section-title">Inclusions & Exclusions</h2>
                <table class="info-table">
                    <tr>
                        <td width="50%">
                            <strong>Inclusions</strong>
                            <ul style="margin-top: 5px; padding-left: 20px;">
                                ${tour.inclusions?.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </td>
                        <td>
                            <strong>Exclusions</strong>
                            <ul style="margin-top: 5px; padding-left: 20px;">
                                ${tour.exclusions?.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                </table>

                ${tour.thingsToPack?.length > 0 ? `
                    <h2 class="section-title">Things to Pack</h2>
                    <table class="info-table">
                        <tr>
                            <td>
                                <ul style="margin: 0; padding-left: 20px; columns: 2;">
                                    ${tour.thingsToPack.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </td>
                        </tr>
                    </table>
                ` : ''}

                <h2 class="section-title">Daily Itinerary</h2>
                ${tour.itinerary?.map((day, index) => `
                    <h3 style="font-size: 16px; margin: 20px 0 10px 0; background-color: #f5f5f5; padding: 8px;">
                        Day ${day.dayNumber || (index + 1)}: ${day.title}
                    </h3>
                    <p style="margin-bottom: 15px;">${day.description}</p>
                    <table class="activity-table">
                        <thead>
                            <tr>
                                <th width="20%">Time</th>
                                <th width="30%">Activity</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${day.activities?.map(activity => `
                                <tr>
                                    <td>${activity.time || 'All day'}</td>
                                    <td>${activity.title}</td>
                                    <td>${activity.description || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `).join('')}

                ${tour.gallery?.length > 0 ? `
                    <h2 class="section-title">Photo Gallery</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            ${tour.gallery.map((photo, i) => `
                                <td style="padding: 5px; ${i % 4 === 3 ? '' : 'border-right: 1px solid #ddd;'}">
                                    <img src="${photo}" style="width: 100%; height: 120px; object-fit: cover;" alt="Gallery image ${i + 1}">
                                </td>
                                ${i % 4 === 3 ? '</tr><tr>' : ''}
                            `).join('')}
                        </tr>
                    </table>
                ` : ''}

                <div class="footer">
                    <p>Generated on ${new Date().toLocaleDateString()} - For booking information, please contact our customer service.</p>
                </div>
            </body>
        </html>
    `;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = function () {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    <div className="h-64 sm:h-80 md:h-96 bg-gray-200 rounded-xl"></div>
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <h2 className="text-xl font-medium text-gray-800">Tour not found</h2>
                <button
                    onClick={() => {
                        navigate(-1);
                        setTimeout(() => window.scrollTo(0, 0), 0);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Back to tours
                </button>
            </div>
        );
    }

    return (
        <>
            {/* <Navbar /> */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm sm:text-base"
                >
                    <FaArrowLeft className="mr-2" /> Back to tours
                </button>

                {/* Tour header */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
                    {tour.image && (
                        <img
                            src={tour.image}
                            alt={tour.name}
                            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                        />
                    )}

                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                            <div className="mb-4 sm:mb-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">{tour.name}</h1>
                                <p className="text-gray-600 flex items-center text-sm sm:text-base">
                                    <IoLocationOutline className="mr-2 text-blue-500" />
                                    {tour.categoryType} | {tour.country}
                                </p>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="inline-block px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 mb-2">
                                    {tour.tourType}
                                </span>
                                <span className="text-lg sm:text-xl md:text-2xl font-semibold text-green-600">
                                    ₹{tour.pricePerHead?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Stats grid - changes layout on small screens */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <p className="text-gray-500 text-xs sm:text-sm">Duration</p>
                                <p className="text-gray-800 font-medium flex items-center text-sm sm:text-base">
                                    <MdOutlineAccessTime className="mr-2 text-blue-500" />
                                    {tour.duration} days
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <p className="text-gray-500 text-xs sm:text-sm">Occupancy</p>
                                <p className="text-gray-800 font-medium flex items-center text-sm sm:text-base">
                                    <HiOutlineUserGroup className="mr-2 text-blue-500" />
                                    {tour.occupancy} people
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <p className="text-gray-500 text-xs sm:text-sm">Remaining</p>
                                <p className="text-gray-800 font-medium flex items-center text-sm sm:text-base">
                                    <HiOutlineUserGroup className="mr-2 text-blue-500" />
                                    {tour.remainingOccupancy} spots
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <p className="text-gray-500 text-xs sm:text-sm">Start Date</p>
                                <p className="text-gray-800 font-medium flex items-center text-sm sm:text-base">
                                    <SlCalender className="mr-2 text-blue-500" />
                                    {formatDateForDisplay(tour.startDate)}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm sm:text-base mb-6">{tour.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {tour.highlights?.map((highlight, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm"
                                >
                                    {highlight}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile itinerary menu toggle */}
                <div className="sm:hidden mb-4">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-full flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                        <span className="font-medium text-gray-700">
                            {activeDay === 0 ? 'Overview' : `Day ${tour.itinerary[activeDay - 1]?.dayNumber || activeDay}`}
                        </span>
                        {mobileMenuOpen ? (
                            <FaChevronUp className="text-gray-500" />
                        ) : (
                            <FaChevronDown className="text-gray-500" />
                        )}
                    </button>

                    {mobileMenuOpen && (
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <button
                                onClick={() => {
                                    setActiveDay(0);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 ${activeDay === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                            >
                                Overview
                            </button>
                            {tour.itinerary?.map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setActiveDay(index + 1);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 border-t border-gray-200 ${activeDay === index + 1 ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                                >
                                    Day {day.dayNumber || (index + 1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Itinerary content - desktop and mobile */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
                    {/* Desktop tabs */}
                    <div className="hidden sm:block border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveDay(0)}
                                className={`py-3 px-4 sm:py-4 sm:px-6 text-center border-b-2 font-medium text-sm ${activeDay === 0 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Overview
                            </button>
                            {tour.itinerary?.map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveDay(index + 1)}
                                    className={`py-3 px-4 sm:py-4 sm:px-6 text-center border-b-2 font-medium text-sm ${activeDay === index + 1 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Day {day.dayNumber || (index + 1)} {/* Use dayNumber from backend if available, else index+1 */}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                        {activeDay === 0 ? (
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Tour Overview</h2>
                                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Inclusions</h3>
                                        <ul className="space-y-1 sm:space-y-2">
                                            {tour.inclusions?.map((item, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                                                    <span className="text-gray-600 text-sm sm:text-base">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Exclusions</h3>
                                        <ul className="space-y-1 sm:space-y-2">
                                            {tour.exclusions?.map((item, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-red-500 mr-2 mt-0.5">✗</span>
                                                    <span className="text-gray-600 text-sm sm:text-base">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {tour.thingsToPack && tour.thingsToPack.length > 0 && ( // Added check for thingsToPack length
                                    <div className="mt-4 sm:mt-6">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Things to Pack</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.thingsToPack.map((item, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Ensure tour.itinerary[activeDay - 1] exists before trying to access its properties
                            tour.itinerary[activeDay - 1] ? (
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                                        Day {tour.itinerary[activeDay - 1].dayNumber || activeDay}: {tour.itinerary[activeDay - 1].title}
                                    </h2>
                                    <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                                        {tour.itinerary[activeDay - 1].description}
                                    </p>

                                    <div className="space-y-3 sm:space-y-4">
                                        {tour.itinerary[activeDay - 1].activities?.map((activity, index) => (
                                            <div key={index} className="flex items-start">
                                                <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                                                    {/* Using switch for more readable activity type icons */}
                                                    {(() => {
                                                        switch (activity.type?.toLowerCase()) {
                                                            case 'travel': return <FaBus className="text-blue-500 mr-3 text-sm sm:text-base" />;
                                                            case 'sightseeing': return <FaCamera className="text-purple-500 mr-3 text-sm sm:text-base" />;
                                                            case 'meal': return <FaUtensils className="text-yellow-500 mr-3 text-sm sm:text-base" />;
                                                            case 'accommodation': return <FaHotel className="text-green-500 mr-3 text-sm sm:text-base" />;
                                                            case 'hiking': return <FaHiking className="text-red-500 mr-3 text-sm sm:text-base" />;
                                                            case 'location': return <FaMapMarkerAlt className="text-blue-500 mr-3 text-sm sm:text-base" />;
                                                            default: return <FaMapMarkerAlt className="text-gray-500 mr-3 text-sm sm:text-base" />; // Default icon
                                                        }
                                                    })()}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800 text-sm sm:text-base">{activity.title}</h4>
                                                    {activity.description && ( // Only show description if it exists
                                                        <p className="text-gray-600 text-xs sm:text-sm">{activity.description}</p>
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
                                        {tour.itinerary[activeDay - 1].activities?.length === 0 && (
                                            <p className="text-gray-500 text-sm">No activities listed for this day.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-red-500">Itinerary details for this day are missing.</p>
                            )
                        )}
                    </div>
                </div>

                {/* Gallery - responsive grid */}
                {tour.gallery && tour.gallery.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
                        <div className="p-4 sm:p-6 md:p-8">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Photo Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                {tour.gallery.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square overflow-hidden rounded-lg bg-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <img
                                            src={photo}
                                            alt={`Tour gallery ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking section - responsive layout */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 sm:p-6 border border-gray-100">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Book This Tour</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-3 sm:mb-0">
                            <p className="text-gray-600 text-sm sm:text-base mb-1">
                                Price per person: <span className="text-green-600 font-bold">₹{tour.pricePerHead?.toLocaleString()}</span>
                            </p>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Available spots: <span className="font-medium">{tour.remainingOccupancy}</span>
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <button
                                onClick={handlePrint}
                                className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 text-sm sm:text-base"
                            >
                                <FaPrint className="inline mr-2" />
                                Print Itinerary
                            </button>
                            <button
                                className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 text-sm sm:text-base"
                                onClick={() => {
                                    setSelectedTourDate(tour); // Pass the entire tour object
                                    setIsBookingModalOpen(true);
                                    setNumberOfPeople(1);
                                    setAgentReferralId('');
                                    setBookingError('');
                                    setBookingSuccessMessage('');
                                }}
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>

                {isBookingModalOpen && selectedTourDate && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            Book Your Adventure: <span className="block text-white/90 text-lg mt-1">{selectedTourDate.name}</span>
                                        </h2>
                                        <p className="text-sm opacity-90 mt-1 flex items-center">
                                            <FiCalendar className="mr-1" />
                                            {new Date(selectedTourDate.startDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsBookingModalOpen(false)}
                                        className="text-white hover:text-white/80 transition-colors p-1 rounded-full"
                                        aria-label="Close booking modal"
                                    >
                                        <FiX className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Number of People */}
                                    <div className="relative">
                                        <label htmlFor="numPeople" className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Travelers
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiUsers className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="number"
                                                id="numPeople"
                                                value={numberOfPeople}
                                                onChange={(e) => setNumberOfPeople(e.target.value)}
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 border-gray-300 rounded-md"
                                                min="1"
                                                placeholder="e.g., 2"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                                <span className="text-sm">people</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Number of Children */}
                                    <div className="relative">
                                        <label htmlFor="numPeople" className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Children
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiUsers className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="number"
                                                id="numChildren"
                                                value={numberOfChildren}
                                                onChange={(e) => setNumberOfChildren(e.target.value)}
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 border-gray-300 rounded-md"
                                                min="1"
                                                placeholder="e.g., 2"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                                <span className="text-sm">people</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agent Referral */}
                                    <div>
                                        <label htmlFor="agentReferral" className="block text-sm font-medium text-gray-700 mb-1">
                                            Agent Referral (Optional)
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiUserCheck className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                id="agentReferral"
                                                value={agentReferralId}
                                                onChange={(e) => setAgentReferralId(e.target.value)}
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 border-gray-300 rounded-md"
                                                placeholder="Enter Agent ID"
                                            />
                                        </div>
                                    </div>

                                    {/* Status Messages */}
                                    {bookingError && (
                                        <div className="rounded-md bg-red-50 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0 text-red-400">
                                                    <FiX className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800">{bookingError}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {bookingSuccessMessage && (
                                        <div className="rounded-md bg-green-50 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0 text-green-400">
                                                    <FiCheck className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-green-800">{bookingSuccessMessage}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                {numberOfPeople > 0 && tour.pricePerHead && (
                                    <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center text-blue-800 mb-2">
                                            <FaRegMoneyBillAlt className="mr-2" />
                                            <h3 className="font-medium">Price Breakdown</h3>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-700">
                                            <div className="flex justify-between">
                                                <span>Base Price ({numberOfPeople} × ₹{tour.pricePerHead.toLocaleString()})</span>
                                                <span>₹{(tour.pricePerHead * numberOfPeople).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Child Price ({numberOfChildren || 0}  × ₹{tour.packageRates.childRate.toLocaleString()})</span>
                                                <span>₹{(tour.packageRates.childRate * numberOfChildren).toLocaleString()}</span>
                                            </div>
                                            {tour.GST !== undefined && tour.GST !== null && (
                                                <div className="flex justify-between">
                                                    <span>GST ({tour.GST}%)</span>
                                                    <span>₹{(((tour.pricePerHead * numberOfPeople + tour.packageRates.childRate * numberOfChildren) * tour.GST) / 100).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200 my-1"></div>
                                            <div className="flex justify-between font-semibold text-blue-900">
                                                <span>Total Amount</span>
                                                <span>₹{(((tour.pricePerHead * numberOfPeople) + (tour.packageRates.childRate * numberOfChildren)) * (1 + (tour.GST / 100))).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setIsBookingModalOpen(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleModalContinue}
                                        disabled={!!bookingSuccessMessage || numberOfPeople <= 0}
                                        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 ${bookingSuccessMessage || numberOfPeople <= 0 ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                    >
                                        Continue Booking
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <NeedHelp />
            <Footer />
        </>
    );
};

export default TourItinerary;