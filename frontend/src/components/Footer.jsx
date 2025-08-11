import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom"; // Make sure you have react-router-dom installed
import MainLogo from '../../public/Images/main-logo-03.svg'

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-300 py-10 pb-0">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8"> {/* Changed to 5 columns */}

        {/* Left Section - Company Info */}
        <div className="flex flex-col space-y-4">
          <img src={MainLogo} alt="Company Logo" className="w-28 filter brightness-0 invert" />
          <p className="text-sm">
            Book 60 days in advance and save up to 40% on international flights.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">Quick Links</h2>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/tours" className="hover:text-white">Tours</Link></li>
            <li><Link to="/destinations" className="hover:text-white">Destinations</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">Support</h2>
          <ul className="space-y-2">
            <li><Link to="/help-center" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/faqs" className="hover:text-white">FAQs</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-white">Terms of Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Grievance & Policies (New Section) */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">Legal</h2>
          <ul className="space-y-2">
            <li><Link to="/grievance-policy" className="hover:text-white">Grievance Policy</Link></li>
            <li><Link to="/policy" className="hover:text-white">Company Policies</Link></li>
            <li><Link to="/cancellation-policy" className="hover:text-white">Cancellation Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">Contact Info</h2>
          <p className="flex items-center gap-2 mb-5"><FaPhone /> +1 (555) 123-4567</p>
          <p className="flex items-center gap-2 mb-5"><FaEnvelope /> support@travelease.com</p>
          <p className="flex items-center gap-2 mb-5"><FaMapMarkerAlt /> 123 Travel Street, City, Country</p>
        </div>
      </div>
      <div className="h-14 bg-[#0B111C] mt-9"></div>
    </footer>
  );
};

export default Footer;