import React, { useState } from "react";
import {
    FaCalendarAlt,
    FaMountain,
    FaUmbrellaBeach,
    FaCity,
    FaTree,
    FaGlobeAmericas,
    FaEnvelope,
    FaArrowLeft
} from "react-icons/fa";
import {
    GiVillage,
    GiDesert,
    GiIsland,
    GiRiver,
    GiCampingTent
} from "react-icons/gi";
import {
    MdOutlineTravelExplore,
    MdOutlineNotificationsActive
} from "react-icons/md";
import {
    RiCustomerService2Fill
} from "react-icons/ri";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const NoToursFound = ({ tourType, message }) => {
    const {categoryType} = useParams(); // Still useful for general context if needed
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('Token');
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [hoveredIcon, setHoveredIcon] = useState(null);

    const getTourTypeIcon = (tourType) => {
        if (!tourType || typeof tourType !== 'string') return <MdOutlineTravelExplore className="text-5xl" />;
        const type = tourType.toLowerCase();

        const icons = {
            mountain: <FaMountain className="text-5xl" />,
            beach: <FaUmbrellaBeach className="text-5xl" />,
            city: <FaCity className="text-5xl" />,
            village: <GiVillage className="text-5xl" />,
            desert: <GiDesert className="text-5xl" />,
            island: <GiIsland className="text-5xl" />,
            river: <GiRiver className="text-5xl" />,
            forest: <FaTree className="text-5xl" />,
            adventure: <GiCampingTent className="text-5xl" />,
            default: <MdOutlineTravelExplore className="text-5xl" />
        };

        for (const [key, icon] of Object.entries(icons)) {
            if (type.includes(key)) return icon;
        }

        return icons.default;
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            console.log("Subscribed with email:", email);
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const features = [
        { icon: <FaGlobeAmericas className="text-3xl mx-auto" />, title: "Unique Locations", color: "text-blue-500" },
        { icon: <FaTree className="text-3xl mx-auto" />, title: "Eco-Friendly", color: "text-green-500" },
        { icon: <GiVillage className="text-3xl mx-auto" />, title: "Local Experiences", color: "text-amber-500" },
        { icon: <RiCustomerService2Fill className="text-3xl mx-auto" />, title: "24/7 Support", color: "text-purple-500" }
    ];

    if (!isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-center"
            >
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="mb-6 flex justify-center">
                        <MdOutlineTravelExplore className="text-5xl text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">Explore Our Tours</h2>
                    <p className="mb-6 text-gray-600 text-lg">Login to discover amazing travel experiences tailored for you.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all font-semibold text-lg shadow-md hover:shadow-lg w-full"
                    >
                        Sign In
                    </button>
                    <p className="mt-4 text-gray-500">
                        Don't have an account?{' '}
                        <span
                            className="text-blue-600 cursor-pointer hover:underline"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </span>
                    </p>
                </div>
            </motion.div>
        );
    }

    const icon = getTourTypeIcon(tourType);
    // Use tourType to generate the common heading
    const commonHeading = `No ${tourType || 'Tours'} Available`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                <div className="relative bg-gradient-to-r from-blue-400 to-indigo-500 p-10 text-white overflow-hidden">
                    <div className="relative z-10">
                        <motion.div
                            className="flex justify-center mb-6"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            {icon}
                        </motion.div>

                        {/* Common Heading */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            {commonHeading}
                        </h1>

                        {/* Message from TourPrograms.jsx as a paragraph */}
                        {message && ( // Only render the paragraph if a message is provided
                            <p className="text-lg md:text-xl mb-8 leading-relaxed">
                                {message}
                            </p>
                        )}

                        <div className="mt-6">
                            <motion.button
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all font-semibold text-lg shadow-md hover:shadow-lg"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    navigate(`/#tours`);
                                }}
                            >
                                Show All tours and categories
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-gray-500 text-sm flex items-center gap-1">
                <RiCustomerService2Fill className="text-blue-400" />
                <p>Have suggestions? <Link to="/connect-us" className="text-blue-600 cursor-pointer hover:underline">Contact our travel experts</Link></p>
            </div>
        </motion.div>
    );
};

export default NoToursFound;