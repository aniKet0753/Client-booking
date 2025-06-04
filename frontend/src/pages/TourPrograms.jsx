import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { FaSun, FaCloudRain, FaCloud } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdOutlineAccessTime, MdOutlineTour } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaCheck, FaEye, FaUserSlash } from "react-icons/fa";
import { useNavigate, useSearchParams, Link, useParams } from "react-router-dom";
import axios from "../api";
import NeedHelp from "../components/NeedHelp";
import Swal from "sweetalert2";

// Helper function to format date
const formatDateForDisplay = (isoDateString) => {
  if (!isoDateString) return "N/A";
  const date = new Date(isoDateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const TourPrograms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Initialize useSearchParams

  const [allTours, setAllTours] = useState([]); // This will store the initially fetched & tourType-filtered tours
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [toursForSelectedMonth, setToursForSelectedMonth] = useState([]);
  const [selectedTourDate, setSelectedTourDate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for the tooltip
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // States for the booking modal (kept for completeness, though Link is used now)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [agentReferralId, setAgentReferralId] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState("");

  const token = localStorage.getItem('Token');
  const role = localStorage.getItem('role');

  const {tourType} =  useParams();
  const tourTypeFromUrl = tourType;
  const pageTitleTourType = tourTypeFromUrl ? tourTypeFromUrl.replace(/%20/g, ' ') : 'All';

  // console.log(tourTypeFromUrl)

  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token || !role) {
          setError("You need to login first to view this section.");
          setLoading(false);
          return;
        }

        const FetchToursRoute = role === 'superadmin' ? 'api/admin/tours' : role === 'customer' ? 'api/customer/tours' : 'api/agents/tours';

        const res = await axios.get(FetchToursRoute, {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        });

        let toursData = res.data.tours;
        console.log("Fetched all tours data:", toursData);

        // --- NEW: Filter by tourType from URL ---
        if (tourTypeFromUrl) {
          const normalizedTourType = tourTypeFromUrl.toLowerCase();
          toursData = toursData.filter(tour =>
            tour.tourType && tour.tourType.toLowerCase() === normalizedTourType
          );
          if (toursData.length === 0) {
            setError(`No tours found for type: "${tourTypeFromUrl}".`);
            setLoading(false);
            return; // Exit if no tours of this type
          }
        }
        // --- END NEW ---

        setAllTours(toursData); // Set the (potentially filtered) tours

        const months = new Set();
        if (Array.isArray(toursData)) {
          toursData.forEach(pkg => {
            if (pkg.startDate) {
              const startDate = new Date(pkg.startDate);
              const monthName = startDate.toLocaleString('en-US', { month: 'long' });
              months.add(monthName);
            }
          });
        } else {
          console.warn("toursData is not an array after filtering:", toursData);
          setError("Unexpected data format from server after filtering.");
        }

        setAvailableMonths(Array.from(months));

      } catch (err) {
        let errorMessage = '';
        const message = err?.response?.data?.message;
        if (err.response?.data?.error === 'Unauthorized: Invalid token') {
          errorMessage = 'Unauthorized access or Session expired. Please re-login!!';
        } else if (message === 'Inactive user') {
          errorMessage = 'Your account is inactive. Please contact support.';
        } else {
          errorMessage = err.response?.data?.message || 'Error fetching tours. Try again later.';
        }
        setError(errorMessage);
        console.error("Error fetching tour data:", err);
        Swal.fire('Error', errorMessage, 'error'); // Use Swal for error display
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [token, role, tourTypeFromUrl]); // Add tourTypeFromUrl to dependency array

  useEffect(() => {
    if (selectedMonth && allTours.length > 0) {
      const filtered = allTours.filter(tour => {
        if (!tour.startDate) return false;
        const tourMonth = new Date(tour.startDate).toLocaleString('en-US', { month: 'long' });
        return tourMonth === selectedMonth;
      });
      setToursForSelectedMonth(filtered);
      setSelectedTourDate(null);
    } else {
      setToursForSelectedMonth([]);
      setSelectedTourDate(null);
    }
  }, [selectedMonth, allTours]);


  const handleMonthClick = (month) => {
    if (!availableMonths.includes(month)) {
      return; // Prevent selection of unavailable months
    }
    console.log(`Clicked on month: ${month}`);
    setSelectedMonth(month);
  };

  const handleTourDateClick = (tour) => {
    console.log("Selected Tour Date:", tour);
    setSelectedTourDate(tour);
    setNumberOfPeople(""); // Clear previous input when a new tour is selected
    setAgentReferralId(""); // Clear previous agent ID
    setBookingError(""); // Clear previous booking errors
    setBookingSuccessMessage(""); // Clear any previous success message
  };

  // This handleContinue is now less critical as you are using Link directly
  const handleContinue = () => {
    if (selectedTourDate) {
      // If you still want a modal before navigating, re-enable this.
      // For now, the Link component handles navigation directly.
      setIsBookingModalOpen(true);
    } else {
      Swal.fire('Oops!', 'Please select a tour date to continue.', 'warning');
    }
  };

  const handleModalContinue = () => {
    console.log("Booking logic would go here for selectedTourDate:", selectedTourDate);
  };

  const handleMouseEnterMonth = (month, event) => {
    if (!availableMonths.includes(month)) {
      setIsTooltipVisible(true);
      setTooltipText("No tours available for this month (for selected type)"); // More specific tooltip
      setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
    }
  };

  const handleMouseMoveMonth = (event) => {
    if (isTooltipVisible) {
      setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
    }
  };

  const handleMouseLeaveMonth = () => {
    setIsTooltipVisible(false);
    setTooltipText("");
  };

  const monthsData = [
    { month: "January", year: 2025, season: "Off-Peak Season", weather: "Pleasant", icon: <FaCloud /> },
    { month: "February", year: 2025, season: "Off-Peak Season", weather: "Pleasant", icon: <FaCloud /> },
    { month: "March", year: 2025, season: "Shoulder Season", weather: "Sunny", icon: <FaSun /> },
    { month: "April", year: 2025, season: "Shoulder Season", weather: "Sunny", icon: <FaSun /> },
    { month: "May", year: 2025, season: "Peak Season", weather: "Sunny", icon: <FaSun /> },
    { month: "June", year: 2025, season: "Peak Season", weather: "Sunny", icon: <FaSun /> },
    { month: "July", year: 2025, season: "Off-Peak Season", weather: "Monsoon", icon: <FaCloudRain /> },
    { month: "August", year: 2025, season: "Off-Peak Season", weather: "Monsoon", icon: <FaCloudRain /> },
    { month: "September", year: 2025, season: "Shoulder Season", weather: "Pleasant", icon: <FaCloud /> },
    { month: "October", year: 2025, season: "Shoulder Season", weather: "Pleasant", icon: <FaCloud /> },
    { month: "November", year: 2025, season: "Peak Season", weather: "Pleasant", icon: <FaCloud /> },
    { month: "December", year: 2025, season: "Peak Season", weather: "Pleasant", icon: <FaCloud /> },
  ];

  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-1.5">
          Select Your Travel Dates for <span className="text-blue-600">{pageTitleTourType}</span> Tours
        </h1>
        <p className="text-gray-600 mb-10">
          Select your preferred month and available dates
        </p>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-blue-600">Loading available tour dates...</p>
          </div>
        )}
        {error && (
          <div className="text-center text-lg text-red-500 bg-red-100 p-4 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {monthsData.map((month, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${selectedMonth === month.month
                    ? "border-blue-500 bg-blue-50"
                    : availableMonths.includes(month.month)
                      ? "border-gray-300 hover:border-blue-500 cursor-pointer"
                      : "border-gray-200 bg-gray-50 text-gray-400 opacity-70 cursor-not-allowed"
                    } flex justify-between items-start`}
                  onClick={() => handleMonthClick(month.month)}
                  onMouseEnter={(e) => handleMouseEnterMonth(month.month, e)}
                  onMouseMove={handleMouseMoveMonth}
                  onMouseLeave={handleMouseLeaveMonth}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {month.month} {month.year}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${month.season === "Peak Season"
                        ? "text-red-500"
                        : month.season === "Off-Peak Season"
                          ? "text-green-600"
                          : "text-orange-500"
                        }`}
                    >
                      {month.season}
                    </p>
                  </div>
                  <div className="text-gray-500 text-2xl ml-4 flex flex-col items-center">
                    {month.icon}
                    <span className="text-sm mt-1">{month.weather}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Details of Tour Section */}
            {selectedMonth && toursForSelectedMonth.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Available Tours for {selectedMonth}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toursForSelectedMonth.map((tour) => (
                    <div
                      key={tour.tourID}
                      className={`relative bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden ${selectedTourDate?.tourID === tour.tourID
                          ? "border-blue-500 ring-4 ring-blue-100"
                          : "border-gray-100 hover:border-blue-300"
                        }`}
                      onClick={() => handleTourDateClick(tour)}
                    >
                      {/* Selected badge */}
                      {selectedTourDate?.tourID === tour.tourID && (
                        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center">
                          <FaCheck className="mr-1" /> SELECTED
                        </div>
                      )}

                      {/* Tour Image */}
                      {tour.image && (
                        <div className="h-48 w-full overflow-hidden relative">
                          <img
                            src={tour.image}
                            alt={tour.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-white">{tour.name}</h3>
                            <div className="flex items-center text-white/90 text-sm mt-1">
                              <IoLocationOutline className="mr-1" />
                              {tour.categoryType} | {tour.country}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tour Details */}
                      <div className="p-5">
                        {/* Price and Tour Type */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-end">
                            <span className="text-2xl font-bold text-green-600">
                              ₹{tour.pricePerHead?.toLocaleString()}
                            </span>
                            <span className="text-md text-gray-500 ml-1">/person</span>
                          </div>
                          <span className="flex items-center text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            <MdOutlineTour className="mr-1" />
                            {tour.tourType}
                          </span>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <MdOutlineAccessTime className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Duration</div>
                              <div className="font-medium">{tour.duration} days</div>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-700">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <HiOutlineUserGroup className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Occupancy</div>
                              <div className="font-medium">{tour.occupancy}</div>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-700">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <FaUserSlash className="text-blue-600 text-sm" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Remaining</div>
                              <div className="font-medium">{tour.remainingOccupancy}</div>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-700">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <SlCalender className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Start Date</div>
                              <div className="font-medium">{formatDateForDisplay(tour.startDate)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {tour.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMonth && toursForSelectedMonth.length === 0 && (
              <div className="mt-12 text-center text-gray-600">
                No tours found for {selectedMonth} with the current filters. Please select another month or clear tour type filter.
              </div>
            )}


            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span>Selected</span>
                </div>
              </div>
              {selectedTourDate ? (
                <Link
                  to={`/tour-itinerary/${selectedTourDate.tourID}`}
                  className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Continue
                </Link>
              ) : (
                <button
                  className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed"
                  disabled
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

      </main>
      <NeedHelp />

      {/* Tooltip component */}
      {isTooltipVisible && (
        <div
          style={{
            position: "fixed",
            top: tooltipPosition.y,
            left: tooltipPosition.x,
            zIndex: 1000,
            pointerEvents: "none",
          }}
          className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg"
        >
          {tooltipText}
        </div>
      )}

      {/* Booking Modal (Potentially unused if using Link directly) */}
      {isBookingModalOpen && selectedTourDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Enter Booking Details for: {selectedTourDate.name}
            </h2>
            <div className="mb-4">
              <label htmlFor="numPeople" className="block text-gray-700 text-sm font-bold mb-2">
                Number of People:
              </label>
              <input
                type="number"
                id="numPeople"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                min="1"
                placeholder="e.g., 2"
              />

              {/* Agent Referral ID Input */}
              <label htmlFor="agentReferral" className="block text-gray-700 text-sm font-bold mb-2">
                Agent Referral ID (Optional):
              </label>
              <input
                type="text"
                id="agentReferral"
                value={agentReferralId}
                onChange={(e) => setAgentReferralId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter Agent ID"
              />

              {bookingError && (
                <p className="text-red-500 text-xs mt-2">{bookingError}</p>
              )}
              {bookingSuccessMessage && (
                <p className="text-green-600 text-sm mt-2 font-medium">{bookingSuccessMessage}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleModalContinue}
                className={`bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 ${bookingSuccessMessage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={!!bookingSuccessMessage}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TourPrograms;