import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import ArrowLeft from "../../public/icons/arrow-left.svg";
import ArrowRight from "../../public/icons/arrow-right.svg";
import TravelBackground01 from "../../public/Images/travel-section-bg-1.jpg";

const medicalTourismPackages = [
    {
        id: 1,
        title: "Homestay Services",
        shortDescription: "Comfortable and caring environment for medical tourists.",
        fullDescription: "Our Homestay Services provide a comfortable and caring environment specifically designed for medical tourists. We offer fully furnished accommodations with all modern amenities, 24/7 support staff, and proximity to major healthcare facilities. Our homestays are equipped with medical-grade facilities and provide a healing environment that promotes recovery and comfort.",
        image: "/Images/Home-stay-service-01.jpg",
        features: [
            "24/7 Medical Support Staff",
            "Proximity to Hospitals",
            "Medical-grade Facilities",
            "Comfortable Living Spaces",
            "Nutritional Meal Plans"
        ],
        price: "Starting from ₹ 2099/night"
    },
    {
        id: 2,
        title: "Rental Service and Medical Hub",
        shortDescription: "Comfortable and caring environment for medical tourists.",
        fullDescription: "Our Rental Service and Medical Hub offers comprehensive solutions for medical travelers. We provide medical equipment rentals, temporary accommodation, and access to our state-of-the-art medical hub featuring consultation rooms, rehabilitation centers, and specialized care facilities.",
        image: "/Images/Home-stay-service-03.jpg",
        features: [
            "Medical Equipment Rental",
            "Temporary Accommodation",
            "Consultation Facilities",
            "Rehabilitation Center",
            "Specialized Care Units"
        ],
        price: "Custom packages available"
    },
    {
        id: 3,
        title: "Non-emergency Cab Services",
        shortDescription: "Reliable transportation for all your medical appointments.",
        fullDescription: "Our Non-emergency Cab Services ensure reliable and comfortable transportation for all your medical appointments. Our drivers are trained to assist patients with mobility challenges and our vehicles are equipped with basic medical facilities. We prioritize punctuality and patient comfort for stress-free travel to and from medical facilities.",
        image: "/Images/Home-stay-service-02.jpg",
        features: [
            "Trained Medical Drivers",
            "Wheelchair Accessible Vehicles",
            "Punctual Service Guarantee",
            "Medical Equipment Storage",
            "24/7 Availability"
        ],
        price: "Affordable hourly rates"
    },
    {
        id: 4,
        title: "Arogyabandhan",
        shortDescription: "Strengthening health bonds for a happier, healthier future.",
        fullDescription: "Arogyabandhan is our comprehensive health bonding program that connects patients with specialized healthcare providers, creates supportive communities, and provides continuous health monitoring. We believe in strengthening health bonds for a happier, healthier future through personalized care plans and community support systems.",
        image: "/Images/Home-stay-service-03.jpg",
        features: [
            "Specialist Connections",
            "Health Community Building",
            "Continuous Monitoring",
            "Personalized Care Plans",
            "Support System Development"
        ],
        price: "Membership-based program"
    },
];

const MedicalTourismSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const navigate = useNavigate();

    const handlePackageClick = (packageItem) => {
        navigate(`/redefining-medical-tourism/${packageItem.id}`, { state: { package: packageItem } });
    };

    return (
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
                                                <div
                                                    className="bg-[#E8F3FF] rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-3 sm:p-5 m-2 sm:m-6 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                                    onClick={() => handlePackageClick(item)}
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full sm:w-1/2 max-h-[180px] sm:max-h-[260px] h-full object-cover rounded-lg"
                                                    />
                                                    <div className="mt-4 sm:mt-12 w-full">
                                                        <h4 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-[#011A4D]">{item.title}</h4>
                                                        <p className="text-[#4A4A4A] mt-1 sm:mt-2 text-sm sm:text-base">{item.shortDescription}</p>
                                                        <button className="mt-4 bg-[#011A4D] text-white px-6 py-2 rounded-lg hover:bg-[#086A16] transition-colors duration-300 cursor-pointer">
                                                            Learn More
                                                        </button>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                                <button className="swiper-button-prev absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 bg-[#011A4D] transition-all shadow-md rounded-lg !w-10 !h-10 sm:!w-12 sm:!h-12 hover:bg-black p-0 after:hidden z-10">
                                    <img src={ArrowLeft} alt="Previous" />
                                </button>
                                <button className="swiper-button-next absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 bg-[#011A4D] transition-all shadow-md rounded-lg !w-10 !h-10 sm:!w-12 sm:!h-12 hover:bg-black p-0 after:hidden z-10">
                                    <img src={ArrowRight} alt="Next" />
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg overflow-hidden max-xl:flex-grow">
                            <img src={TravelBackground01} alt="Medical Tourism" className="max-xl:w-full max-h-[250px] object-cover" />
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default MedicalTourismSection;