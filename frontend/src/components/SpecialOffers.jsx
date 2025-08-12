import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { FaClock } from "react-icons/fa";
import axios from '../api'; // Assuming a configured axios instance

const SpecialOffers = () => {
    const [specialOffers, setSpecialOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await axios.get('/api/special-offers');
                console.log("Fetched offers data:", response.data);
                setSpecialOffers(response.data);
            } catch (err) {
                setError("Failed to fetch special offers. Please try again later.");
                console.error("Error fetching special offers:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOffers();
    }, []);

    if (isLoading) {
        return (
            <section className="bg-white py-8 px-4 sm:px-6 md:px-10 lg:px-12 min-h-[400px] flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-700">Loading special offers...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-white py-8 px-4 sm:px-6 md:px-10 lg:px-12 min-h-[400px] flex items-center justify-center">
                <div className="text-xl font-semibold text-red-600">{error}</div>
            </section>
        );
    }

    if (specialOffers.length === 0) {
        return (
            <section className="bg-white py-8 px-4 sm:px-6 md:px-10 lg:px-12 min-h-[400px] flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-500">No special offers available.</div>
            </section>
        );
    }

    return (
        // <motion.div
        //     initial={{ opacity: 0, y: 50 }}
        //     animate={isInView ? { opacity: 1, y: 0 } : {}}
        //     transition={{ duration: 1, ease: 'easeOut' }}
        // >
        //     <section ref={ref} className="bg-white py-8 px-4 sm:px-6 md:px-10 lg:px-12">
        //         <div className="max-w-[1440px] mx-auto">
        //             <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-[#011A4D] mb-8 sm:mb-10">Special Offers</h2>
        //             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        //                 {specialOffers.map((offer) => (
        //                     <div key={offer._id} className="bg-[#E8F3FF] rounded-xl shadow-lg overflow-hidden flex flex-col mb-6 h-full">
        //                         <img
        //                             src={offer.image}
        //                             alt={offer.title}
        //                             className="w-full object-cover h-48"
        //                         />
        //                         <div className="p-4 flex-grow">
        //                             <div className="flex justify-between items-start pt-2 relative">
        //                                 <h4 className="font-bold text-[#011A4D] text-lg sm:text-xl">{offer.title}</h4>
        //                                 <span className="bg-[#086A16] text-white text-xs px-3 py-1.5 rounded-full absolute sm:static top-0 right-0 font-bold whitespace-nowrap">
        //                                     {offer.badge}
        //                                 </span>
        //                             </div>
        //                             <p className="text-[#4A4A4A] mt-2 text-sm sm:text-base leading-snug">{offer.description}</p>
        //                             <div className="flex items-center text-gray-500 mt-4 text-sm sm:text-base">
        //                                 <FaClock className="mr-2 text-black" />
        //                                 <span className="text-black">{offer.validity}</span>
        //                             </div>
        //                         </div>
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     </section>
        // </motion.div>

        <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
    >
        <section ref={ref} className="bg-white py-8 px-4 sm:px-6 md:px-10 lg:px-12">
            <div className="max-w-[1440px] mx-auto">
                <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-[#011A4D] mb-8 sm:mb-10">Special Offers</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {specialOffers.map((offer, index) => (
                        <div key={offer._id || index} className="p-4 border">
                            <h3>{offer.title}</h3>
                            <p>{offer.description}</p>
                            <p>Badge: {offer.badge}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </motion.div>
    );
};

export default SpecialOffers;