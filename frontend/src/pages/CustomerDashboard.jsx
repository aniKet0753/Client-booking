import { useState, useEffect, useRef } from 'react';
import axios from '../api'; // Ensure this path is correct for your axios instance
import {
  FiShoppingCart, FiClock, FiMapPin, FiCalendar, FiUsers,
  FiDollarSign, FiStar, FiChevronDown, FiChevronUp, FiInfo,
  FiFileText, // New icon for complaints
  FiMessageSquare, // For message input/sending
  FiFile,
  FiDownload,
} from 'react-icons/fi';
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function getInvoiceHtml(invoice) {
  if (!invoice) return '';

  return `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 15px; background-color: #f0f0f0;">
    <div style="max-width:900px; width:100%; margin: 0 auto; background-color: white; padding: 25px; box-shadow: 0 0 15px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="text-align: center; padding-bottom: 10px;">
            <span style="display: block; text-align: center; margin-bottom: 12px;">
              <img src="https://reboot-l2g.onrender.com/assets/main-logo-03-BS_a2pPl.svg" alt="Company Logo" />
            </span>
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">L2G CRUISE & CURE</h1>
            <p style="margin: 5px 0; font-size: 14px; letter-spacing: 1px;"><strong>T R A V E L  M A N A G E M E N T</strong></p>
            <p style="margin: 5px 0; font-size: 14px; letter-spacing: 1px;"><strong>P R I V A T E   L I M I T E D</strong></p>
          </td>
        </tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <p style="margin: 3px 0; font-size: 13px;"><strong>Invoice No:</strong> ${invoice.invoiceNo || 'L2G/TOUR/FY2025-2026/………'}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Date:</strong> ${invoice.date ? new Date(invoice.date).toLocaleDateString() : '………/………../………'}</p>
          </td>
          <td style="width: 50%; vertical-align: top; text-align: right;">
            <p style="margin: 3px 0; font-size: 11px;"><strong>Office Address:</strong> H. No. 6, Netaji Path, Gobindnagar,</p>
            <p style="margin: 3px 0; font-size: 11px;">Uliyan, Kadma, Jamshedpur 831005, Jharkhand, India</p>
            <p style="margin: 3px 0; font-size: 11px;">+91 8209976417    ankana.l2gcruise@gmail.com</p>
            <p style="margin: 3px 0; font-size: 11px;"><strong>CIN -US2291JH2025PTC023980    GSTIN:20AAGCL135911ZO</strong></p>
          </td>
        </tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
        <tr>
          <td style="width: 50%; padding: 8px; border: 1px solid #ddd;">
            <strong>Customer Name:</strong> ${invoice.customerName || ''}
          </td>
          <td style="width: 50%; padding: 8px; border: 1px solid #ddd;">
            <strong>No. Of passengers:</strong> ${invoice.totalPassengers || ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Customer Booking ID:</strong> ${invoice.bookingID || ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Date of Journey:</strong> ${invoice.journeyDate || ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Customer Email ID:</strong> ${invoice.customerEmail || ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Tour Package:</strong> ${invoice.tourPackageName || ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;" colspan="2">
            <strong>Days / Night of Tour:</strong> ${invoice.tourDuration || ''}
          </td>
        </tr>
      </table>

      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="vertical-align: top; width: 50%;">
            ${invoice.inclusions && invoice.inclusions.length > 0 ? `
              <div>
                <strong style="font-size: 15px; color: #2563eb;">What's Included:</strong>
                <ul style="margin: 8px 0 0 18px; color: #222; font-size: 13px;">
                  ${invoice.inclusions.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </td>
          <td style="vertical-align: top; width: 50%;">
            ${invoice.exclusions && invoice.exclusions.length > 0 ? `
              <div>
                <strong style="font-size: 15px; color: #dc2626;">What's Not Included:</strong>
                <ul style="margin: 8px 0 0 18px; color: #444; font-size: 13px;">
                  ${invoice.exclusions.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 12px; border: 1px solid #ddd; text-align: left; width: 50%;">Particulars</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 16%;">Basic Price</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 17%;">No. Of passengers</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 17%;">Sub-Total</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;" colspan="4">LEISURE TOUR SERVICES</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Tour package</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${(invoice.basePrice || 0).toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.numPassengersForCalc || invoice.totalPassengers || 0}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${((invoice.basePrice || 0) * (invoice.numPassengersForCalc || invoice.totalPassengers || 0)).toFixed(2)}</td>
        </tr>

        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Tour package (Child)</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${(invoice.childBasePrice || 0).toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.childPassengers || 0}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${((invoice.childBasePrice || 0) * (invoice.childPassengers || 0)).toFixed(2)}</td>
        </tr>

        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Air Fare (Extra)</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.airFare ? `₹${invoice.airFare.toFixed(2)}` : ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.airFarePassengers || ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.airFare ? `₹${invoice.airFare.toFixed(2)}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Train Tickets from Home station and back</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.trainFare ? `₹${invoice.trainFare.toFixed(2)}` : ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.trainFarePassengers || ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.trainFare ? `₹${invoice.trainFare.toFixed(2)}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Foodings</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.foodings ? `₹${invoice.foodings.toFixed(2)}` : ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.foodingsPassengers || ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.foodings ? `₹${invoice.foodings.toFixed(2)}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Hotel / Home-stay upgradation charges</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.hotelUpgrade ? `₹${invoice.hotelUpgrade.toFixed(2)}` : ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.hotelUpgradePassengers || ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.hotelUpgrade ? `₹${invoice.hotelUpgrade.toFixed(2)}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Conveyance charges not included in basic package (Extra)</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.conveyance ? `₹${invoice.conveyance.toFixed(2)}` : ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${invoice.conveyancePassengers || ''}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${invoice.conveyance ? `₹${invoice.conveyance.toFixed(2)}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;" colspan="3">SUB-TOTAL</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(invoice.subTotal || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;" colspan="3">GST @${((invoice.gstRate || 0) * 100).toFixed(0)}%</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(invoice.gstAmount || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;" colspan="3">TOTAL</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(invoice.totalAmount || 0).toFixed(2)}</td>
        </tr>
      </table>
      <table style="width: 100%; margin-top: 40px;">
        <tr>
          <td style="text-align: right; padding-right: 50px;">
            <p style="margin-bottom: 50px; font-weight: bold;">Authorized signatory</p>
            <p style="border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center;">Stamp/Signature</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
  `;
}
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'previous', 'complaints'
  const [expandedTour, setExpandedTour] = useState(null);
  const [upcomingTour, setUpcomingTour] = useState([]);
  const [previousTours, setPreviousTours] = useState([]);
  const [showItineraryTourId, setShowItineraryTourId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for complaints
  const [ongoingComplaints, setOngoingComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [activeComplaintSubTab, setActiveComplaintSubTab] = useState('ongoing'); // 'ongoing' or 'resolved'
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [replyMessage, setReplyMessage] = useState(''); // For sending new messages to complaints

  const [invoices, setInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoicePrintRef = useRef();

  const token = localStorage.getItem('Token'); // Get token once

  // 1. Replace error state with three separate error states:
  const [bookingError, setBookingError] = useState(null);
  const [complaintError, setComplaintError] = useState(null);
  const [invoiceError, setInvoiceError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setBookingError(null);

    try {
      const response = await axios.get('/api/bookings/my-bookings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const allBookings = response.data;
      const today = new Date();
      const upcoming = [];
      const previous = [];

      if (!Array.isArray(allBookings)) {
        console.error('API response for bookings is not an array:', allBookings);
        setBookingError('Received invalid booking data from server.');
        setLoading(false);
        return;
      }

      allBookings.forEach(booking => {
        const tourStartDate = booking.tour?.startDate ? new Date(booking.tour.startDate) : new Date();
        const bookingData = {
          id: booking._id,
          title: booking.tour?.name || 'Unknown Tour',
          date: tourStartDate.toISOString().split('T')[0],
          location: booking.tour?.country || 'N/A',
          price: booking.payment?.totalAmount || 'N/A',
          paymentStatus: booking.payment?.paymentStatus || 'N/A',
          people: booking.travelers?.length || 0,
          rating: booking.tour?.rating || 0,
          image: booking.tour?.image || 'https://via.placeholder.com/400x200',
          description: booking.tour?.description || '',
          status: booking.status,
          bookingID: booking.bookingID,
          itinerary: (booking.tour?.itinerary || []).filter(item => typeof item === 'object' && item !== null),
          inclusions: booking.tour?.inclusions || [],
          exclusions: booking.tour?.exclusions || [],
        };

        if (tourStartDate >= today) {
          upcoming.push(bookingData);
        } else {
          previous.push(bookingData);
        }
      });

      setUpcomingTour(upcoming);
      setPreviousTours(previous);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setBookingError('No bookings found for your account.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setBookingError('Authentication failed. Please log in again.');
        } else {
          setBookingError(`Failed to fetch bookings: ${err.response.data.message || err.message}`);
        }
      } else if (err.request) {
        setBookingError('Network error. Please check your internet connection.');
      } else {
        setBookingError(`An unexpected error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch complaints
  const fetchComplaints = async () => {
    setLoading(true);
    setComplaintError(null);
    try {
      const response = await axios.get('/api/complaints/my-complaints', { // Assuming this endpoint exists
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const allComplaints = response.data;
      if (!Array.isArray(allComplaints)) {
        console.error('API response for complaints is not an array:', allComplaints);
        setComplaintError('Received invalid complaint data from server.');
        setLoading(false);
        return;
      }

      const ongoing = allComplaints.filter(c => c.status !== 'resolved');
      const resolved = allComplaints.filter(c => c.status === 'resolved');

      setOngoingComplaints(ongoing);
      setResolvedComplaints(resolved);

    } catch (err) {
      console.error('Error fetching complaints:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setComplaintError('No complaints found for your account.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setComplaintError('Authentication failed. Please log in again to view complaints.');
        } else {
          setComplaintError(`Failed to fetch complaints: ${err.response.data.message || err.message}`);
        }
      } else if (err.request) {
        setComplaintError('Network error. Please check your internet connection.');
      } else {
        setComplaintError(`An unexpected error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message to an ongoing complaint
  const handleSendMessage = async (complaintId) => {
    if (!replyMessage.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    try {
      await axios.post(`/api/complaints/${complaintId}/reply`, {
        message: replyMessage,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setReplyMessage('');
      // Refresh complaints to show the new message
      fetchComplaints();
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send message. Please try again.';
      alert(errorMessage);
    }
  };

  useEffect(() => {
    setInvoiceLoading(true);
    setInvoiceError(null);
    axios.get('/api/invoices/my-invoices', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('Token')}`,
      },
    }).then(res => {
      setInvoices(res.data || []);
      setInvoiceLoading(false);
    }).catch(err => {
      setInvoiceError('Failed to fetch invoices');
      setInvoiceLoading(false);
    });
  }, []);

  useEffect(() => {
    // Fetch data based on the active tab
    if (activeTab === 'upcoming' || activeTab === 'previous') {
      fetchBookings();
    } else if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab]); // Re-fetch when activeTab changes

  const toggleTourExpand = (id) => {
    setExpandedTour(expandedTour === id ? null : id);
  };

  const toggleComplaintExpand = (id) => {
    setExpandedComplaintId(expandedComplaintId === id ? null : id);
  };

  const openInvoiceModal = async (bookingId) => {
    setInvoiceLoading(true);
    setInvoiceError(null);
    try {
      const token = localStorage.getItem('Token');
      const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch invoice data');
      }

      const data = await res.json();
      setSelectedInvoice(data);
      setShowInvoiceModal(true);
    } catch (error) {
      setInvoiceError(error.message || 'Failed to load invoice data');
      console.error("Invoice fetch error:", error);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  }

  // Print invoice modal content
  const handlePrintInvoice = (invoice = selectedInvoice) => {
    const invoiceHtml = getInvoiceHtml(invoice);
    const printWindow = window.open('', '', 'width=900,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Print View</title>
        </head>
        <body>
          ${invoiceHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Download Invoice as HTML
  const handleDownloadInvoice = async (invoice) => {
    if (!invoice) return;
    const invoiceHtml = getInvoiceHtml(invoice);
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoice._id || 'preview'}.html`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8"> {/* Added main content wrapper */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center sm:text-left">My Dashboard</h1>

          <div className="flex flex-col sm:flex-row border-b border-gray-200 mb-8">
            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'upcoming' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <FiShoppingCart className="mr-2 text-xl" />
              Upcoming Tours <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{upcomingTour.length}</span>
            </button>
            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'previous' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('previous')}
            >
              <FiClock className="mr-2 text-xl" />
              Previous Tours <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{previousTours.length}</span>
            </button>
            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'complaints' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <FiFileText className="mr-2 text-xl" />
              My Complaints <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{ongoingComplaints.length + resolvedComplaints.length}</span>
            </button>

            <button
              className={`py-3 px-6 font-semibold flex items-center justify-center sm:justify-start transition-all duration-300 ${activeTab === 'invoice' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('invoice')}
            >
              <FiFile className="mr-2 text-xl" />
              Invoice <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{invoices.length}</span>
            </button>

          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-600 text-lg">Loading your data...</div>
          ) : (
            <>
              {activeTab === 'upcoming' || activeTab === 'previous' ? (
                bookingError ? (
                  <div className="text-center py-20 text-red-600">
                    <FiInfo className="mx-auto text-5xl mb-6 text-red-500" />
                    <p className="text-xl font-medium">{bookingError}</p>
                  </div>
                ) : (
                  <>
                    {(activeTab === 'upcoming' ? upcomingTour : previousTours).length === 0 ? (
                      <div className="text-center py-16">
                        {activeTab === 'upcoming' ? (
                          <FiShoppingCart className="mx-auto text-6xl text-gray-400 mb-6" />
                        ) : (
                          <FiClock className="mx-auto text-6xl text-gray-400 mb-6" />
                        )}
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                          {activeTab === 'upcoming' ? 'No upcoming tours booked!' : 'No previous tours completed yet.'}
                        </h3>
                        <p className="text-gray-500 text-lg mt-2">
                          {activeTab === 'upcoming' ?
                            'It looks like you haven\'t booked any tours yet. Explore our exciting destinations!' :
                            'Your past adventures will appear here once you complete them.'}
                        </p>
                      </div>
                    ) : (
                      (activeTab === 'upcoming' ? upcomingTour : previousTours).map((tour) => (
                        <div key={tour.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-6 border border-gray-100">
                          <div className="md:flex">
                            <div className="md:w-56 h-56 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${tour.image})` }}></div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{tour.title}</h2>
                                    <div className="flex items-center text-gray-600 text-sm">
                                      <FiMapPin className="mr-1 text-base" />
                                      <span>{tour.location}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                      <FiStar className="mr-1 text-base" />
                                      <span>{tour.rating === 0 ? 'N/A' : tour.rating.toFixed(1)}</span>
                                    </div>
                                    <button
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold shadow transition cursor-pointer"
                                      onClick={() => openInvoiceModal(tour.id)}
                                      title="View Invoice"
                                    >
                                      Invoice
                                    </button>
                                  </div>
                                </div>


                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-gray-700 text-base">
                                  <div className="flex items-center">
                                    <FiCalendar className="mr-2 text-gray-500 text-lg" />
                                    <span>{new Date(tour.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <FiUsers className="mr-2 text-gray-500 text-lg" />
                                    <span>{tour.people} {tour.people > 1 ? 'People' : 'Person'}</span>
                                  </div>
                                  <div className="flex items-center font-semibold">
                                    <span>{tour.paymentStatus === 'Pending' ? 'Payment: Pending' : `Paid: ₹${tour.price}`}</span>
                                  </div>
                                </div>
                              </div>

                              <button onClick={() => toggleTourExpand(tour.id)} className="mt-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 self-start">
                                {expandedTour === tour.id ? (
                                  <>
                                    <span className="font-medium">Show less details</span>
                                    <FiChevronUp className="ml-1 text-lg" />
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium">View full details</span>
                                    <FiChevronDown className="ml-1 text-lg" />
                                  </>
                                )}
                              </button>

                              {expandedTour === tour.id && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                  <p className="text-gray-700 leading-relaxed mb-4">{tour.description}</p>
                                  <p className="text-gray-600 text-sm mb-1"><span className="font-semibold text-gray-800">Booking ID:</span> {tour.bookingID}</p>
                                  <p className="text-gray-600 text-sm mb-4"><span className="font-semibold text-gray-800">Status:</span> <span className="capitalize">{tour.status}</span></p>

                                  {tour.inclusions.length > 0 && (
                                    <div className="mb-4">
                                      <p className="font-bold text-gray-800 mb-2">What's Included:</p>
                                      <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
                                        {tour.inclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                                      </ul>
                                    </div>
                                  )}

                                  {tour.exclusions.length > 0 && (
                                    <div className="mb-6">
                                      <p className="font-bold text-gray-800 mb-2">What's Not Included:</p>
                                      <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
                                        {tour.exclusions.map((item, idx) => <li key={idx}>{item}</li>)}
                                      </ul>
                                    </div>
                                  )}

                                  {activeTab === 'upcoming' && (
                                    <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                      <button
                                        onClick={() =>
                                          setShowItineraryTourId(
                                            showItineraryTourId === tour.id ? null : tour.id
                                          )
                                        }
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-lg font-medium"
                                      >
                                        {showItineraryTourId === tour.id ? 'Hide Itinerary' : 'View Itinerary'}
                                      </button>

                                      {showItineraryTourId === tour.id && tour.itinerary.length > 0 && (
                                        <div className="mt-4 bg-blue-50 p-5 rounded-lg shadow-inner w-full">
                                          <h4 className="text-lg font-semibold text-blue-800 mb-3">Detailed Itinerary:</h4>
                                          <ul className="space-y-5">
                                            {tour.itinerary.map((item, i) => (
                                              <li key={item._id || i} className="border-l-4 border-blue-300 pl-4">
                                                <p className="text-blue-700 text-md font-bold mb-1">Day {item.dayNumber}: {item.title}</p>
                                                <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                                                {item.activities?.length > 0 && (
                                                  <ul className="ml-4 list-disc text-gray-600 text-sm space-y-0.5">
                                                    {item.activities.map((act, j) => (
                                                      <li key={j} className="flex items-center"><span className="mr-2 text-blue-400">&bull;</span> {act.title} - <span className="font-medium ml-1">{act.time}</span></li>
                                                    ))}
                                                  </ul>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      <button className="px-6 py-3 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 text-lg font-medium">
                                        Cancel Tour
                                      </button>
                                    </div>
                                  )}

                                  {activeTab === 'previous' && (
                                    <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-medium">
                                      Book Again
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )
              ) : activeTab === 'complaints' ? (
                complaintError ? (
                  <div className="text-center py-20 text-red-600">
                    <FiInfo className="mx-auto text-5xl mb-6 text-red-500" />
                    <p className="text-xl font-medium">{complaintError}</p>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="flex border-b border-gray-200 mb-8">
                      <button
                        className={`py-3 px-6 font-semibold flex items-center transition-all duration-300 ${activeComplaintSubTab === 'ongoing' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
                        onClick={() => setActiveComplaintSubTab('ongoing')}
                      >
                        Ongoing <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{ongoingComplaints.length}</span>
                      </button>
                      <button
                        className={`py-3 px-6 font-semibold flex items-center transition-all duration-300 ${activeComplaintSubTab === 'resolved' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-500'}`}
                        onClick={() => setActiveComplaintSubTab('resolved')}
                      >
                        Resolved <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{resolvedComplaints.length}</span>
                      </button>
                    </div>

                    {(activeComplaintSubTab === 'ongoing' ? ongoingComplaints : resolvedComplaints).length === 0 ? (
                      <div className="text-center py-16 text-gray-600">
                        <FiFileText className="mx-auto text-6xl text-gray-400 mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                          {activeComplaintSubTab === 'ongoing' ? 'No ongoing complaints.' : 'No resolved complaints.'}
                        </h3>
                        <p className="text-gray-500 text-lg mt-2">
                          {activeComplaintSubTab === 'ongoing' ?
                            'All your active complaints will appear here for tracking.' :
                            'Your completed complaints will be archived here.'}
                        </p>
                      </div>
                    ) : (
                      (activeComplaintSubTab === 'ongoing' ? ongoingComplaints : resolvedComplaints).map(complaint => (
                        <div key={complaint._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-6 border border-gray-100">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">{complaint.subject}</h2>
                                <p className="text-sm text-gray-600">Type: <span className="font-medium">{complaint.type}</span></p>
                                <p className="text-sm text-gray-600">Filed on: <span className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</span></p>
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${complaint.status === 'open' ? 'bg-red-100 text-red-800' :
                                complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                {complaint.status.replace('_', ' ')}
                              </span>
                            </div>

                            <button onClick={() => toggleComplaintExpand(complaint._id)} className="mt-2 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 self-start">
                              {expandedComplaintId === complaint._id ? (
                                <>
                                  <span className="font-medium">Hide conversation</span>
                                  <FiChevronUp className="ml-1 text-lg" />
                                </>
                              ) : (
                                <>
                                  <span className="font-medium">View conversation history</span>
                                  <FiChevronDown className="ml-1 text-lg" />
                                </>
                              )}
                            </button>

                            {expandedComplaintId === complaint._id && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                  <span className="font-bold text-gray-800">Your Original Description: </span>
                                  {complaint.description}
                                </p>
                                {complaint.preferredResolution && (
                                  <p className="text-gray-700 leading-relaxed mb-4">
                                    <span className="font-bold text-gray-800">Your Preferred Resolution: </span>
                                    {complaint.preferredResolution}
                                  </p>
                                )}
                                {complaint.agentInfo?.name && (
                                  <p className="text-gray-700 leading-relaxed mb-4">
                                    <span className="font-bold text-gray-800">Assigned Agent: </span>
                                    {complaint.agentInfo.name}
                                    {complaint.agentInfo.id && ` (ID: ${complaint.agentInfo.id})`}
                                  </p>
                                )}

                                <h3 className="font-bold text-gray-900 mb-4 text-xl">Conversation History</h3>
                                <div className="relative">
                                  <div className="space-y-4 h-60 overflow-y-auto pr-2 custom-scrollbar p-2 bg-gray-50 rounded-lg shadow-inner">
                                    {complaint.adminReplies.length === 0 ? (
                                      <p className="text-gray-600 text-sm text-center py-4">No messages in this conversation yet.</p>
                                    ) : (
                                      complaint.adminReplies.map((reply, index) => {
                                        const isCustomerReply = reply.repliedByType === 'Customer';
                                        const senderName = isCustomerReply ? 'You' : 'Admin';

                                        return (
                                          <div
                                            key={index}
                                            className={`p-4 rounded-xl shadow-sm ${isCustomerReply
                                              ? 'bg-blue-100 self-end ml-auto max-w-[80%]'
                                              : 'bg-gray-200 self-start mr-auto max-w-[80%]'
                                              }`}
                                          >
                                            <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                                              <span className="font-bold text-sm">
                                                {senderName}
                                              </span>
                                              <span className="text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-800 text-base whitespace-pre-line break-words">{reply.message}</p>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none"></div>
                                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                                </div>

                                {complaint.status !== 'resolved' && activeComplaintSubTab === 'ongoing' && (
                                  <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-3 text-xl">Send a New Message</h3>
                                    <textarea
                                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4 text-gray-700 resize-y"
                                      rows="4"
                                      placeholder="Type your message here..."
                                      value={replyMessage}
                                      onChange={(e) => setReplyMessage(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => handleSendMessage(complaint._id)}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                                      >
                                        <FiMessageSquare className="mr-2 text-xl" /> Send Message
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {complaint.status === 'resolved' && (
                                  <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-600">
                                    <p className="font-semibold text-xl mb-2">This complaint has been resolved!</p>
                                    <p className="text-md">You cannot send further messages for resolved complaints.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )
              ) : activeTab === 'invoice' && (
                invoiceError ? (
                  <div className="text-center py-20 text-red-600">
                    {/* ... error display ... */}
                  </div>
                ) : (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">My Invoices</h2>
                    {invoiceLoading ? (
                      <div className="text-center py-16 text-gray-600">Loading invoices...</div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-16 text-gray-600">
                        {/* ... no invoices display ... */}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {invoices.map(inv => (
                          <div key={inv._id} className="bg-white rounded-xl shadow-lg ...">
                            <div>
                              <p className="font-bold ...">Invoice No: {inv.invoiceNumber}</p>
                              {/* ... other invoice summary details ... */}
                            </div>
                            <div className="flex gap-3 mt-4 md:mt-0">
                              <button
                                className="px-4 py-2 bg-blue-600 ..."
                                // ✅ KEY CHANGE HERE: Pass the ID instead of the whole object
                                onClick={() => openInvoiceModal(inv._id)}
                              >
                                View
                              </button>
                              <button
                                className="px-4 py-2 bg-green-600 ..."
                                onClick={() => handlePrintInvoice(inv)}
                              >
                                Print
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
      <Footer />


      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-12 max-w-4xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
              onClick={closeInvoiceModal}
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Invoice Preview</h2>
            <div className="overflow-x-auto max-h-[70vh] border rounded-lg p-6 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: getInvoiceHtml(selectedInvoice) }} />
            </div>
            <div className="flex gap-4 mt-8 justify-end">
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                onClick={() => handlePrintInvoice(selectedInvoice)}
              >
                Print
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Dashboard;