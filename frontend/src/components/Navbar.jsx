import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MainLogo from '../../public/Images/main-logo-03.svg';
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import axios from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  // Initialize user with username from localStorage immediately
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("username");
    return username ? { name: username } : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null); // Keep profile state if needed for other dashboard logic
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username"); // Get username from localStorage

    // Set user state based on localStorage on initial mount
    if (username && username !== 'null' && username !== 'undefined') {
      setUser({ name: username });
    } else {
      setUser(null);
    }

    // Only fetch profile if a token exists and is valid
    if (token && token !== 'null' && token !== 'undefined' && !profile) { // Prevent re-fetching if profile already exists
      fetchProfile(token, role);
    }
  }, []); // Empty dependency array means this runs once on mount

  // This useEffect will listen for changes in localStorage 'username' or 'Token'
  // to update the user state across tabs/pages without full refresh
  useEffect(() => {
    const handleStorageChange = () => {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("Token");

      if (username && username !== 'null' && username !== 'undefined') {
        setUser({ name: username });
      } else {
        setUser(null);
      }

      // Re-fetch profile if token changes or becomes valid and profile is not set
      if (token && token !== 'null' && token !== 'undefined' && !profile) {
        const role = localStorage.getItem("role");
        fetchProfile(token, role);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [profile]); // Depend on profile to avoid continuous fetching if profile is already loaded


  const fetchProfile = async (token, role) => {
    if (!token || token === 'null' || token === 'undefined') {
      console.warn("Attempted to fetch profile with an invalid token string. Aborting.");
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      const route = role === 'superadmin' ? 'api/admin/profile' : role === 'customer' ? 'api/customer/profile' : 'api/agents/profile';

      const res = await axios.get(route, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role,
        },
      });
      setProfile(res.data);
      // Ensure user name is set from fetched profile if available
      if (res.data.name) {
        setUser({ name: res.data.name });
        localStorage.setItem("username", res.data.name); // Update localStorage with verified name
      }
    } catch (err) {
      console.log(err);
      // If fetching profile fails, clear local storage and user state to reflect logged-out status
      localStorage.removeItem("Token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      setUser(null);
      setProfile(null);
      toast.error("Session expired or invalid. Please log in again.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setProfile(null); // Clear profile on logout
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLinks = (
    <>
      {[
        { path: "/", label: "Home" },
        { path: "/About", label: "About Us" },
        { path: "/tour-programs/leisure tour", label: "Leisure Tour" },
        { path: "/tour-programs/Medical Tour", label: "Medical Tour" },
        { path: "/l2g-services", label: "L2G ad services" },
        { path: "/customer-forum", label: "Customer Forum" },
        { path: "/community-services", label: "Community Services" },
        { path: "/connect-us", label: "Connect Us" }
      ].map((link) => (
        <li key={link.path}>
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              isActive
                ? "!text-[#F4B41A] text-base md:text-base xl:text-xl font-bold hover:!text-[#F4B41A]"
                : "text-white text-base md:text-base xl:text-xl font-bold border-0 !outline-0 hover:text-[#F4B41A] transition-all duration-300"
            }

            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </>
  );

  return (
    <>
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-12 py-3 relative z-50">
        <div className="flex-shrink-0">
          <Link to='/' className="block">
            <span className="flex items-start text-[10px]">
              <img src={MainLogo} alt="Main Logo" className="h-12 xl:h-[150px] lg:h-[120px]" />
              TM
            </span>
          </Link>
        </div>

        {/* <div className="relative flex-grow flex justify-center mx-4 overflow-hidden max-w-[800px]">
          <svg
            className="absolute inset-0 w-full h-full rounded-t-2xl bg-[#98ae2a]"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 C200,0 600,0 800,100 L800,0 L0,0 Z"
              fill="#AAC236"
            />
          </svg>

          <p className="relative max-w-[800px] w-full py-4 px-2 lg:py-6 lg:px-6 text-center text-white font-bold text-md sm:text-lg lg:text-3xl rounded-t-2xl shadow-lg hidden md:block">
            L2G Cruise & Cure Travel Management Pvt. Ltd.
          </p>
        </div> */}

        <div className="relative flex-grow flex justify-center mx-4 overflow-hidden max-w-[850px]">
          <p className="relative max-w-[800px] w-full py-4 px-2 lg:py-6 lg:px-6 text-center text-[#011A4D] font-bold text-md sm:text-lg lg:text-[35px] xl:text-[46px] rounded-t-2xl  hidden md:block uppercase leading-tight">
            <span className="block">L2G Cruise & Cure</span> <span>Travel Management Pvt. Ltd.</span>
          </p>
        </div>


        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-[#011A4D] text-3xl p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
            >
              <FaBars />
            </button>
          </div>

          {!user ? (
            <div className="flex">
              <Link to="/login">
                <li className="list-none flex items-center gap-2 bg-[#011A4D] text-white rounded-full px-4 py-2 text-base sm:text-lg font-medium hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer">
                  <FaUser className="w-5 h-5 sm:w-6 sm:h-6" />
                  Login
                </li>
              </Link>
            </div>
          ) : (
            <div className="relative z-50" ref={dropdownRef}>
              <div
                tabIndex={0}
                role="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <div className="avatar">
                  <span className="flex items-center gap-2 bg-[#011A4D] text-white rounded-full px-4 py-2 text-base sm:text-lg font-medium hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer">
                    <FaUser className="w-5 h-5 sm:w-6 sm:h-6" />
                    {user.name}
                  </span>
                </div>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-content menu w-full p-0">
                  <ul
                    tabIndex={0}
                    className="bg-[#D9D9D9] rounded-box z-[100] w-[180px] p-2 shadow flex flex-col gap-2 absolute right-0 top-full mt-2 rounded-lg"
                  >
                    <li className="border-b border-[#113A5F] pb-2">
                      <Link
                        to={
                          localStorage.getItem('role') === 'superadmin'
                            ? '/superadmin/dashboard'
                            : localStorage.getItem('role') === 'customer'
                              ? '/customer-dashboard'
                              : localStorage.getItem('role') === 'agent'
                                ? '/agent/dashboard'
                                : '/'
                        }
                        className="text-md text-[#113A5F] font-bold"
                        onClick={() => {
                          setIsDropdownOpen(false);
                        }}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="text-md text-[#113A5F] font-bold cursor-pointer"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex justify-center bg-[#011A4D] sticky top-0 z-30 w-full py-3">
        <ul className="menu menu-horizontal px-1 flex flex-row gap-5">
          {navLinks}
        </ul>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#011A4D] w-[250px] fixed top-0 h-full left-0 z-50 shadow-lg pb-4">
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-white bg-red-700 text-xl cursor-pointer p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
          <ul className="menu menu-vertical px-4 py-2 flex flex-col gap-2 mt-12">
            {navLinks}

            {!user ? (
              <li>
                <Link to="/login" className="text-white text-xl font-bold hover:!text-[#F4B41A]" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </li>
            ) : (
              <>
                <li>
                  {/* Assuming 'Track Your Booking' link might be dynamic based on role,
                      you might want to adjust its path based on `localStorage.getItem('role')`
                      similar to the dashboard link. For now, it points to '/'. */}
                  <Link to='/' className="text-white lg:text-xl text-md font-bold hover:!text-[#F4B41A]" onClick={() => setIsMobileMenuOpen(false)}>
                    Track Your Booking
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-white lg:text-xl text-md font-bold hover:!text-[#F4B41A]"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;