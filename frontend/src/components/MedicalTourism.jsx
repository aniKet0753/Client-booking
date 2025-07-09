import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ArrowLeft from "../../public/icons/arrow-left.svg";
import ArrowRight from "../../public/icons/arrow-right.svg";
// import TavelHeadingIcon from "../../public/icons/travel-section-icon.svg";
import TravelBackground01 from "../../public/Images/travel-section-bg-1.jpg";

const medicalTourismPackages = [
    {
        title: "Homestay Services",
        description: "Comfortable and caring environment for medical tourists.",
        image: "/Images/Home-stay-service-01.jpg",
    },
    {
        title: "Rental Service and Medical Hub",
        description: "Comfortable and caring environment for medical tourists.",
        image: "/Images/Home-stay-service-03.jpg",
    },
    {
        title: "Non-emergency Cab Services",
        description: "Reliable transportation for all your medical appointments.",
        image: "/Images/Home-stay-service-02.jpg",
    },
    {
        title: "Arogyabandhan",
        description: "Arogyabandhan: Strengthening health bonds for a happier, healthier future.",
        image: "/Images/Home-stay-service-03.jpg",
    },
];

const MedicalTourismSection = () => {


    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });


    return (
        <>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
            >

                <section ref={ref} className="bg-[#53974A80] py-12 px-6">
                    <div className="max-w-[1440px] mx-auto">
                        <h2 className="lg:text-6xl text-3xl font-bold text-black mb-10">
                            <span className="text-[#011A4D]">Health Meets Travel:</span>
                            <br className="max-lg:hidden" />
                            <span className="inline-flex gap-6 text-[#086A16]">Redefining Medical Tourism</span>
                        </h2>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="max-w-[850px] w-full">
                                <div className="relative">
                                    {/* Swiper Slider */}
                                    <div className="max-w-full sm:max-w-[760px] mx-auto">
                                        <Swiper
                                            modules={[Navigation]}
                                            spaceBetween={20}
                                            slidesPerView={1}
                                            breakpoints={{
                                                640: { slidesPerView: 1 },
                                                768: { slidesPerView: 1 },
                                            }}
                                            navigation={{
                                                nextEl: ".swiper-button-next",
                                                prevEl: ".swiper-button-prev",
                                            }}
                                            className="py-4 sm:py-6"
                                        >
                                            {medicalTourismPackages.map((item, index) => (
                                                <SwiperSlide key={index}>
                                                    <div className="bg-[#E8F3FF] rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-3 sm:p-5 m-2 sm:m-6">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full sm:w-1/2 max-h-[180px] sm:max-h-[260px] h-full object-cover rounded-lg"
                                                        />
                                                        <div className="mt-4 sm:mt-12 w-full">
                                                            <h4 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-[#011A4D]">{item.title}</h4>
                                                            <p className="text-[#4A4A4A] mt-1 sm:mt-2 text-sm sm:text-base">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                    {/* Navigation Buttons */}
                                    <button className="swiper-button-prev absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 bg-[#011A4D] transition-all shadow-md rounded-lg !w-10 !h-10 sm:!w-12 sm:!h-12 hover:bg-black p-0 after:hidden z-10">
                                        <img src={ArrowLeft} alt="" />
                                    </button>
                                    <button className="swiper-button-next absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 bg-[#011A4D] transition-all shadow-md rounded-lg !w-10 !h-10 sm:!w-12 sm:!h-12 hover:bg-black p-0 after:hidden z-10">
                                        <img src={ArrowRight} alt="" />
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-lg overflow-hidden max-xl:flex-grow">
                                <img src={TravelBackground01} alt="" className="max-xl:w-full max-h-[250px] object-cover" />
                            </div>
                        </div>
                    </div>
                </section>
                
            </motion.div>
        </>
    );
};

export default MedicalTourismSection;
