"use client";

import { useRef } from "react"; // useEffect is not used, so it can be removed
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const tourPackages = [
  {
    title: "Low Budget Tour",
    description: "Experience amazing destinations without breaking the bank.",
    image: "/Images/place-01.jpg",
    icon: "/icons/low-tour.svg",
    bgColor: "bg-blue-100", // Note: bgColor is not currently used in the JSX
  },
  {
    title: "Standard Tour",
    description: "Perfect balance of comfort and adventure.",
    image: "/Images/place-02.jpg",
    icon: "/icons/standard-tour.svg",
    bgColor: "bg-green-100",
  },
  {
    title: "Premium Tour",
    description: "Tailored luxury experiences for the discerning traveler.",
    image: "/Images/place-03.jpg",
    icon: "/icons/Premium-tour.svg",
    bgColor: "bg-orange-100",
  },
];

const TourSection = () => {
  // 1. Correct way to initialize useNavigate hook
  const navigate = useNavigate();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const handleCardClick = (tourTitle) => {
    // It's good practice to encode URI components for URL safety
    navigate(`/travel-experience/${encodeURIComponent(tourTitle)}`);
    console.log(`Card clicked: ${tourTitle}`);
  };

  return (
    <section className="bg-blue-50 py-12 px-6">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="lg:text-6xl text-3xl font-bold text-black mb-10">
          <span className="text-[#011A4D]">Leisure Adventures:</span> <br />{" "}
          <span className="text-[#086A16]">Travel at Your Own Pace</span>
        </h2>

        <div className="relative">
          <div className="xl:px-[10vh]">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}

              navigation={true} // Changed from `false` to `true`
              className="py-6"
            >
              {tourPackages.map((tour, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[380px] mb-4 cursor-pointer"
                    onClick={() => handleCardClick(tour.title)}
                  >
                    <img
                      src={tour.image}
                      alt={tour.title}
                      className="w-full max-h-[270px] object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start gap-2">
                        <span className="rounded-full pt-[5px] shrink-0">
                          <img src={tour.icon} alt={`${tour.title} icon`} />
                        </span>
                        <div>
                          <h4 className="font-bold capitalize text-[20px] text-[#011A4D]">
                            {tour.title}
                          </h4>
                          <p className="text-[#4A4A4A] mt-2 text-[15px]">
                            {tour.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourSection;