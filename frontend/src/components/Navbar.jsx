import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MainLogo from '../../public/Images/main-logo-03.svg';
import { FaUser, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import axios from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("username");
    return username ? { name: username } : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
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
    const token = localStorage.getItem("Token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (username && username !== 'null' && username !== 'undefined') {
      setUser({ name: username });
    } else {
      setUser(null);
    }

    if (token && token !== 'null' && token !== 'undefined' && !profile) {
      fetchProfile(token, role);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("Token");

      if (username && username !== 'null' && username !== 'undefined') {
        setUser({ name: username });
      } else {
        setUser(null);
      }

      if (token && token !== 'null' && token !== 'undefined' && !profile) {
        const role = localStorage.getItem("role");
        fetchProfile(token, role);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [profile]);

  const fetchProfile = async (token, role) => {
    if (!token || token === 'null' || token === 'undefined') {
      console.warn("Invalid token");
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      const route = role === 'superadmin' ? 'api/admin/profile' :
        role === 'customer' ? 'api/customer/profile' :
          'api/agents/profile';

      const res = await axios.get(route, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role,
        },
      });
      setProfile(res.data);
      if (res.data.name) {
        setUser({ name: res.data.name });
        localStorage.setItem("username", res.data.name);
      }
    } catch (err) {
      console.log(err);
      localStorage.removeItem("Token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      setUser(null);
      setProfile(null);
      toast.error("Session expired. Please log in again.");
    }
  };

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

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setProfile(null);
    toast.success("Logged out successfully");
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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/About", label: "About Us" },
    { path: "/tour-programs/leisure tour", label: "Leisure Tour" },
    { path: "/tour-programs/Medical Tour", label: "Medical Tour" },
    { path: "/l2g-services", label: "L2G Services" },
    { path: "/customer-forum", label: "Forum" },
    { path: "/blog-list", label: "Community" },
    { path: "/connect-us", label: "Contact" }
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#0c3588] text-white text-center py-2 px-4 text-sm">
        <p>✨ Special offers available! Book now and get 10% off on selected tours. ✨</p>
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-[#011A4D]'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo */}
            <div className="flex-shrink-0 z-50">
              <Link to='/' className="flex items-center">
                <div className="relative inline-block">
                  <img
                    src={MainLogo}
                    alt="L2G Cruise & Cure"
                    className="h-12 lg:h-[90px] transition-all duration-300"
                    style={{
                      filter: isScrolled ? 'none' : 'invert(1) brightness(100)',
                      height: isScrolled ? '60px' : '90px',
                    }}
                  />
                  <span className="absolute top-0 -right-1.5 text-[14px] lg:text-sm font-semibold" style={{
                    filter: isScrolled ? 'none' : 'invert(1) brightness(100)',
                  }}>™</span>
                </div>
                <span className="ml-5 text-xs text-[#011A4D] font-bold hidden sm:block"
                  style={{
                    filter: isScrolled ? 'none' : 'invert(1) brightness(100)',
                  }}>
                  <span className="block text-lg lg:text-xl">L2G Cruise & Cure</span>
                  <span className="text-sm">Travel Management</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-[15px] font-medium transition-colors duration-200
                    ${isActive ?
                      'text-[#F4B41A] font-bold' :
                      `hover:text-[#F4B41A] ${isScrolled ? 'text-[#011A4D]' : 'text-white'}`
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
                <FaBars className={`w-6 h-6 ${isScrolled ? 'text-[#011A4D]' : 'text-white'}`} />
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
    </>
  );
};

export default Navbar;