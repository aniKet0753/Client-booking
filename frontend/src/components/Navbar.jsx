import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MainLogo from '../../public/Images/main-logo-03.svg';
import { FaBars, FaTimes, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { useAuth } from '../hooks/useAuth';
import { FaUmbrellaBeach, FaHeartbeat } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/About", label: "About Us" },
    { path: "/tour-programs/leisure tour", label: "Leisure Tour" },
    { path: "/medical-tourism", label: "Medical Tour" },
    { path: "/customer-forum", label: "Forum" },
    { path: "/community-list", label: "Community" },
    { path: "/connect-us", label: "Contact" }
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="relative bg-gradient-to-r from-[#3a7bd5] to-[#00d2ff] text-white text-center py-4 px-6 uppercase overflow-hidden group">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a504a] to-[#559aa8] group-hover:from-[#559aa8] group-hover:to-[#0a504a] transition-all duration-1000 ease-in-out"></div>

        {/* New Wave Effect */}
        <div className="ocean">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>

        {/* Main Content with animations */}
        <div className="relative z-10 space-y-2">
          <svg
            viewBox="0 0 500 80"
            className="w-full max-w-md h-auto mx-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="halfStroke" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="50%" stopColor="white" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="50%"
              fill="url(#halfStroke)"
              stroke="white"
              strokeWidth="0.6"
              strokeLinejoin="round"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="40"
              fontWeight="bold"
              letterSpacing="3"
              className="xl:text-5xl lg:text-xl"
            >
              L2G Cruise & Cure
            </text>
          </svg>
        </div>

        {/* Animated Tour & Medical Icons */}
        <div className="absolute top-4 right-6 text-3xl opacity-70 hover:opacity-100 transition-opacity duration-300 animate-float">
          <FaUmbrellaBeach className="text-amber-300" />
        </div>
        <div className="absolute bottom-6 left-6 text-3xl opacity-70 hover:opacity-100 transition-opacity duration-300 animate-float-reverse">
          <FaHeartbeat className="text-red-300" />
        </div>
      </div>
      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white'}`}>
        <div className="xl:container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo */}
            <div className="flex-shrink-0 z-50">
              <Link to='/' className="flex items-center">
                <div className="relative inline-block">
                  <img
                    src={MainLogo}
                    alt="L2G Cruise & Cure"
                    className="h-12 lg:h-[100px] transition-all duration-300"
                    style={{
                      height: isScrolled ? '70px' : '105px',
                    }}

                  />
                  <span className="absolute top-0 -right-1.5 text-[14px] lg:text-sm font-semibold">™</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md xl:text-[17px] text-[15px] font-medium transition-colors duration-200
                    ${isActive ?
                      'text-[#F4B41A] font-bold' :
                      `hover:text-[#F4B41A] ${isScrolled ? 'text-[#011A4D]' : 'text-[#011A4D]'}`
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* User Actions */}
              {!user ? (
                <div className="hidden md:flex space-x-3">
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isScrolled ? 'bg-[#011A4D] text-white' : 'bg-white text-[#011A4D]'} hover:bg-opacity-90`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-full bg-[#F4B41A] text-[#011A4D] text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-full ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-[#002366]'} transition-colors`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F4B41A] flex items-center justify-center">
                      <span className="text-[#011A4D] font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isDropdownOpen ? (
                      <FaChevronUp className={`w-3 h-3 ${isScrolled ? 'text-[#011A4D]' : 'text-white'}`} />
                    ) : (
                      <FaChevronDown className={`w-3 h-3 ${isScrolled ? 'text-[#011A4D]' : 'text-white'}`} />
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-700">Hi, {user.name}</p>
                      </div>
                      <Link
                        to={
                          localStorage.getItem('role') === 'superadmin' ? '/superadmin/dashboard' :
                            localStorage.getItem('role') === 'customer' ? '/customer-dashboard' :
                              localStorage.getItem('role') === 'agent' ? '/agent/dashboard' : '/'
                        }
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md focus:outline-none"
                aria-label="Open menu"
              >
                <FaBars className={`w-6 h-6 ${isScrolled ? 'text-[#011A4D]' : 'text-[#011A4D]'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="bg-white h-full w-4/5 max-w-sm shadow-xl overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={MainLogo} alt="L2G Logo" className="h-10" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md focus:outline-none"
                >
                  <FaTimes className="w-6 h-6 text-[#011A4D]" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="p-4 border-b">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#F4B41A]"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-2 text-[#011A4D]"
                  >
                    <FaSearch className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <nav className="p-4">
                <ul className="space-y-3">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 rounded-md ${isActive ? 'bg-[#F4B41A] text-white' : 'text-[#011A4D] hover:bg-gray-100'}`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t">
                  {!user ? (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        className="block w-full px-4 py-2 bg-[#011A4D] text-white text-center rounded-md hover:bg-opacity-90"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full px-4 py-2 bg-[#F4B41A] text-[#011A4D] text-center rounded-md hover:bg-opacity-90"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to={
                          localStorage.getItem('role') === 'superadmin' ? '/superadmin/dashboard' :
                            localStorage.getItem('role') === 'customer' ? '/customer-dashboard' :
                              localStorage.getItem('role') === 'agent' ? '/agent/dashboard' : '/'
                        }
                        className="block px-4 py-2 bg-gray-100 text-[#011A4D] rounded-md hover:bg-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 bg-gray-100 text-[#011A4D] rounded-md hover:bg-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 bg-[#011A4D] text-white rounded-md hover:bg-opacity-90"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      <style>{`
        .ocean { 
          height: 0%;
          width:100%;
          position:absolute;
          bottom:0;
          left:0;
          background: #015871;
        }

        .wave {
          background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg) repeat-x; 
          position: absolute;
          top: -50px;
          width: 6400px;
          height: 198px;
          animation: wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) infinite;
          transform: translate3d(0, 0, 0);
        }

        .wave:nth-of-type(2) {
          top: -55px;
          animation: wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) -.125s infinite, swell 7s ease -1.25s infinite;
          opacity: 1;
        }

        @keyframes wave {
          0% {
            margin-left: 0;
          }
          100% {
            margin-left: -1600px;
          }
        }

        @keyframes swell {
          0%, 100% {
            transform: translate3d(0,-25px,0);
          }
          50% {
            transform: translate3d(0,5px,0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
        
        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0) rotate(5deg);
          }
          50% {
            transform: translateY(10px) rotate(-5deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 6s ease-in-out infinite;
        }
      `}</style>

    </>
  );
};


export default Navbar;