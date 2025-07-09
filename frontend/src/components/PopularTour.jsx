import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const popularTours = [
    {
        title: "Romantic Getaway",
        description: "Special moments for couples in magical settings.",
        image: "/Images/Goa-1.jpg",
        icon: "/icons/heart-icon.svg",
    },
    {
        title: "Romantic Getaway",
        description: "Special moments for couples in magical settings.",
        image: "/Images/Goa-1.jpg",
        icon: "/icons/heart-icon.svg",
    },
    {
        title: "Romantic Getaway",
        description: "Special moments for couples in magical settings.",
        image: "/Images/Goa-1.jpg",
        icon: "/icons/heart-icon.svg",
    },
];

const PopularTourSection = () => {

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
            >

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
                                {popularTours.map((tour, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                                            <img
                                                src={tour.image}
                                                alt={tour.title}
                                                className="w-full max-h-[270px] h-full object-cover "
                                            />
                                            <div className="flex items-start gap-2 p-4">
                                                <span className="rounded-full pt-[5px] shrink-0">
                                                    <img src={tour.icon} alt="" />
                                                </span>
                                                <div>
                                                    <h4 className="font-bold capitalize text-[20px] text-[#011A4D]">
                                                        {tour.title}
                                                    </h4>
                                                    <p className="text-black mt-2 text-[15px]">{tour.description}</p>
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

export default PopularTourSection;
