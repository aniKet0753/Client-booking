import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import { FaClock } from "react-icons/fa";

const specialOffers = [
    {
        title: "Early Bird Special",
        description: "Book 60 days in advance and save up to 40% on international flights",
        image: "/Images/offers-01.jpg",
        validity: "Valid until 2024-05-30",
        badge: "40% OFF",
    },
    {
        title: "Family Package Deal ",
        description: "Special rates for family bookings with kids under 12 flying free",
        image: "/Images/offers-01.jpg",
        validity: "Valid until 2024-05-30",
        badge: "Kids Fly Free",
    },
];

const SpecialOffers = () => {

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <>
        <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
            <section ref={ref} className="bg-white py-8 px-4 sm:px-6 md:px-10 lg:px-12">
            <div className="max-w-[1440px] mx-auto">
                <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-[#011A4D] mb-8 sm:mb-10">Special Offers</h2>

                <div className="relative">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            1024: { slidesPerView: 2 },
                        }}
                        navigation={false}
                        className="py-4"
                    >
                        {specialOffers.map((offer, index) => (
                            <SwiperSlide key={index}>
                                <div className="bg-[#E8F3FF] rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row mb-6 h-full">
                                    <img
                                        src={offer.image}
                                        alt={offer.title}
                                        className="w-full sm:w-1/2 object-cover h-48 sm:h-auto"
                                    />
                                    <div className="p-4 sm:pl-5 sm:w-1/2">
                                        <div className="flex justify-between items-start sm:items-center pt-2 sm:pt-10 relative">
                                            <h4 className="font-bold text-[#011A4D] text-lg sm:text-xl">{offer.title}</h4>
                                            <span className="bg-[#086A16] text-white text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-full absolute sm:static top-0 right-0 sm:right-auto sm:top-auto font-bold whitespace-nowrap">
                                                {offer.badge}
                                            </span>
                                        </div>
                                        <p className="text-[#4A4A4A] mt-2 text-sm sm:text-base leading-snug">{offer.description}</p>
                                        <div className="flex items-center text-gray-500 mt-2 text-sm sm:text-base">
                                            <FaClock className="mr-2 text-black" />
                                            <span className="text-black">{offer.validity}</span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
            </section>
            </motion.div>
        </>
    );
};

export default SpecialOffers;