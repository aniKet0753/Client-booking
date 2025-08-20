import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import axios from '../api';
import { FaMountain, FaUmbrellaBeach, FaLandmark, FaTree, FaChurch, FaTimes } from 'react-icons/fa';

const PopularTourSection = () => {
    const [attractions, setAttractions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const iconComponents = {
        mountain: <FaMountain className="text-green-600" size={24} />,
        beach: <FaUmbrellaBeach className="text-blue-400" size={24} />,
        landmark: <FaLandmark className="text-yellow-500" size={24} />,
        park: <FaTree className="text-green-500" size={24} />,
        church: <FaChurch className="text-purple-500" size={24} />
    };

    useEffect(() => {
        const fetchAttractions = async () => {
            try {
                const response = await axios.get('/api/attractions');
                setAttractions(response.data);
            } catch (err) {
                setError("Failed to fetch attractions. Please try again later.");
                console.error("Error fetching attractions:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttractions();
    }, []);

    const openModal = (attraction) => {
        setSelectedAttraction(attraction);
        setIsModalOpen(true);
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAttraction(null);
        // Restore body scrolling when modal is closed
        document.body.style.overflow = 'auto';
    };

    // Close modal when clicking outside of modal content
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    // Close modal with Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.keyCode === 27) {
                closeModal();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    if (isLoading) {
        return (
            <section className="bg-blue-50 py-12 px-6 min-h-screen flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-700">Loading attractions...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-blue-50 py-12 px-6 min-h-screen flex items-center justify-center">
                <div className="text-xl font-semibold text-red-600">{error}</div>
            </section>
        );
    }
    
    if (attractions.length === 0) {
        return (
            <section className="bg-blue-50 py-12 px-6 min-h-screen flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-500">No attractions available.</div>
            </section>
        );
    }

    return (
        // <motion.div
        //     initial={{ opacity: 0, y: 50 }}
        //     animate={isInView ? { opacity: 1, y: 0 } : {}}
        //     transition={{ duration: 1, ease: 'easeOut' }}
        // >
        // </motion.div>
            <section ref={ref} className="bg-blue-50 py-12 px-6">
                <div className="max-w-[1440px] mx-auto">
                    <h2 className="lg:text-6xl text-3xl font-bold text-black mb-10">Other Attractions</h2>
                    <div className="m-8">
                        <Swiper
                            spaceBetween={20}
                            slidesPerView={1}
                            breakpoints={{
                                640: { slidesPerView: 1 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            navigation={false}
                        >
                            {attractions.map((attraction) => (
                                <SwiperSlide key={attraction._id}>
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                                        {attraction.image ? (
                                            <img
                                                src={attraction.image}
                                                alt={attraction.title}
                                                className="w-full max-h-[270px] h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full max-h-[270px] h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2 p-4">
                                            <span className="rounded-full pt-[5px] shrink-0">
                                                {iconComponents[attraction.icon]}
                                            </span>
                                            <div>
                                                <h4 className="font-bold capitalize text-[20px] text-[#011A4D]">
                                                    {attraction.title}
                                                </h4>
                                                <p className="text-black mt-2 text-[15px]">{attraction.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </section>
    );
};

export default PopularTourSection;