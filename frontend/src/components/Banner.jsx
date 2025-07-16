import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// import required modules
import { Navigation } from "swiper/modules";
// import BannerImg1 from '../../public/Images/banner-01.jpg'
import BannerImg1 from '../../public/Images/banner-new-04.jpg'

const bgBanner =
  "https://www.jodogoairportassist.com/main/assets/images/blog/bangladesh/top-ten-tourist-places-to-visit-in-bangladesh-8.webp";

// import './styles.css';

const Banner = () => {
  return (
    <div className="mb-16">
      <Swiper
        rewind={true}
        navigation={false}
        modules={[Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div
            className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[700px] hero bg-cover bg-no-repeat bg-center flex items-center justify-center relative"
            style={{ backgroundImage: `url(${BannerImg1})` }}
          >
            {/* <div className="absolute inset-0 bg-black/40"></div> */}
            {/* <div className="w-full flex justify-center items-center h-full relative z-10">
              <div className="border-0 text-center flex flex-col gap-5 justify-center items-center w-full px-4 sm:px-8 md:px-16 lg:px-0 max-w-4xl mx-auto">
                <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[50px] text-white leading-tight">
                  Exclusive Leisure and Medical Tours for Your Ultimate Well-Being
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-50 my-6 sm:my-8">
                  Indulge in Premium Healthcare Experiences While Exploring Breathtaking Destinations
                </p>
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <button className="bg-[#011A4D] text-white rounded-full px-6 py-2 sm:px-8 sm:py-3 text-lg sm:text-xl md:text-2xl font-bold hover:opacity-90 transition w-full">
                    Contact Now
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </SwiperSlide>

        {/* <SwiperSlide>
          <div className="w-full lg:h-[540px] rounded-lg hero bg-[url(https://images.ctfassets.net/wv75stsetqy3/15er14j2Azz7yxXFRlT8p5/acc7ba4935aca368bacb6006cbcac6c3/The_Pros_and_Cons_of_Living_in_Malaysia.jpg?q=60&fit=fill&fm=webp)] bg-cover bg-no-repeat bg-center">
            <div className="hero-overlay bg-opacity-40 rounded-lg">
              <div className="px-8 lg:px-16 border-0 md:w-3/4 lg:w-1/2 flex flex-col gap-5 justify-center items-start border-black h-screen rounded-lg">
                <h1 className="font-bold uppercase text-4xl md:text-5xl lg:text-7xl text-white">
                  Malaysia
                </h1>
                <p className="text-base lg:text-lg text-gray-50">
                  Malaysia is a Southeast Asian country known for its modern
                  cities, rainforests, and cultural diversity. Kuala Lumpur, the
                  capital, is home to the iconic Petronas Twin Towers, while
                  Penang offers a rich colonial history and diverse culinary
                  experiences.
                </p>
                <div className="">
                  <button className="btn bg-green-500 text-white border-2 border-green-500 hover:bg-transparent hover:border-green-500 font-bold">
                    View More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="w-full lg:h-[540px] rounded-lg hero bg-[url(https://constructive-voices.com/wp-content/uploads/2024/04/Indonesia-Sacred-Natural-Sites-and-Biodiversity.jpg)] bg-cover bg-no-repeat bg-center">
            <div className="hero-overlay bg-opacity-40 rounded-lg">
              <div className="px-8 lg:px-16 border-0 md:w-3/4 lg:w-1/2 flex flex-col gap-5 justify-center items-start border-black h-screen rounded-lg">
                <h1 className="font-bold uppercase text-4xl md:text-5xl lg:text-7xl text-white">
                  Indonesia
                </h1>
                <p className="text-base lg:text-lg text-gray-50">
                  Indonesia is the world's largest archipelago, consisting of
                  over 17,000 islands, each with its unique charm and natural
                  beauty. Famous destinations like Bali attract visitors with
                  its stunning beaches, terraced rice fields, and vibrant arts
                  scene.
                </p>
                <div className="">
                  <button className="btn bg-green-500 text-white border-2 border-green-500 hover:bg-transparent hover:border-green-500 font-bold">
                    View More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide> */}
      </Swiper>
    </div>
  );
};

export default Banner;
