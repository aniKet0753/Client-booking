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
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NoToursFound = ({ tourType }) => {
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
            // Here you would typically send the email to your backend
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
    const tourTypeName = tourType || "Adventure";

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                {/* Header with animated background */}
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-10 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white"
                                style={{
                                    width: Math.random() * 100 + 50,
                                    height: Math.random() * 100 + 50,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, Math.random() * 100 - 50],
                                    x: [0, Math.random() * 100 - 50],
                                    opacity: [0.1, 0.2, 0.1],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 10,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                            />
                        ))}
                    </div>
                    <div className="relative z-10">
                        <motion.div 
                            className="flex justify-center mb-6"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            {icon}
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">Exciting {tourTypeName} Tours</h1>
                        <p className="text-xl md:text-2xl mb-2 font-light">
                            Are Coming Soon!
                        </p>
                        <div className="mt-6">
                            <motion.div 
                                className="inline-block"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <MdOutlineNotificationsActive className="text-3xl animate-pulse" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    <div className="flex justify-center mb-10">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <FaCalendarAlt className="text-6xl text-blue-400" />
                        </motion.div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
                        Our <span className="text-blue-600">{tourTypeName}</span> adventures are being crafted
                    </h2>

                    <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-2xl mx-auto">
                        We're working hard to create unforgettable {tourTypeName.toLowerCase()} experiences that will 
                        take your breath away. Our travel experts are designing unique itineraries 
                        that combine adventure, comfort, and authentic local experiences.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                        {features.map((feature, index) => (
                            <motion.div 
                                key={index}
                                className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${hoveredIcon === index ? 'transform scale-105' : ''}`}
                                onMouseEnter={() => setHoveredIcon(index)}
                                onMouseLeave={() => setHoveredIcon(null)}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`${feature.color} mb-3 text-center`}>
                                    {feature.icon}
                                </div>
                                <p className="text-sm font-medium text-gray-700">{feature.title}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mb-10">
                        <h3 className="text-xl font-medium text-gray-700 mb-5">
                            Get notified when we launch!
                        </h3>
                        {subscribed ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-100 text-green-700 p-4 rounded-lg max-w-md mx-auto"
                            >
                                <p className="font-medium">Thank you! We'll notify you soon.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <div className="relative flex-grow">
                                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Your email address"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <motion.button 
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Notify Me
                                </motion.button>
                            </form>
                        )}
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors border border-gray-200"
                        >
                            <FaArrowLeft className="text-lg" />
                            Back to Home
                        </Link>
                    </motion.div>
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