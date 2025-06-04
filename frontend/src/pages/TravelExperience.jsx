import React from "react";
import { FaUmbrellaBeach, FaMonument, FaTree, FaMountain, FaHiking, FaLandmark, FaUtensils, FaBuilding } from 'react-icons/fa';
import { GiTempleGate, GiTiger } from 'react-icons/gi';
import { PiHouseLineBold } from 'react-icons/pi';
<<<<<<< HEAD
import { Link } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Link is still useful for internal links, but not for the card click in this case
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
import InnerBanner from "../components/InnerBanner";
import InnerBannerImage from "../../public/Images/inner-banner-image.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NeedHelp from "../components/NeedHelp";
import TravelTips from "../components/TravelTips";

const experiences = [
  {
    title: "Leisure Tour",
    description: "Relax and unwind at beautiful beaches and serene locations",
    icon: FaUmbrellaBeach,
    places: ["Goa", "Kerala"],
    image: "https://plus.unsplash.com/premium_photo-1663011707758-9af31c6618e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Religious Tourism",
=======
    title: "Religious Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Explore sacred sites and spiritual destinations",
    icon: GiTempleGate,
    places: ["Varanasi", "Tirupati"],
    image: "https://images.unsplash.com/photo-1706790574525-d218c4c52b5c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Rural Tourism",
=======
    title: "Rural Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Experience authentic village life and traditions",
    icon: PiHouseLineBold,
    places: ["Rajasthan Villages", "Gujarat Crafts"],
    image: "https://plus.unsplash.com/premium_photo-1663036377788-a60733e5fb43?q=80&w=2091&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Heritage Tourism",
=======
    title: "Heritage Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Discover India's rich historical monuments",
    icon: FaMonument,
    places: ["Taj Mahal", "Hampi"],
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Nursery Tourism",
=======
    title: "Nursery Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Visit beautiful gardens and flower valleys",
    icon: FaTree,
    places: ["Valley of Flowers", "Sikkim Orchids"],
    image: "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Wildlife Tourism",
=======
    title: "Wildlife Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Explore India's diverse wildlife and national parks",
    icon: GiTiger,
    places: ["Jim Corbett", "Kaziranga"],
    image: "https://plus.unsplash.com/premium_photo-1661866819978-7393e9d985bc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Dark Tourism",
=======
    title: "Dark Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Visit historical sites with compelling past",
    icon: FaLandmark,
    places: ["Cellular Jail", "Jallianwala Bagh"],
    image: "https://images.unsplash.com/photo-1677772112152-f92ab9f59d49?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "Food Tourism",
=======
    title: "Food Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Savor India's diverse culinary traditions",
    icon: FaUtensils,
    places: ["Delhi Food Trail", "Lucknow Nawabi"],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
<<<<<<< HEAD
    title: "MICE Tourism",
=======
    title: "MICE Tour",
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
    description: "Perfect venues for corporate events and meetings",
    icon: FaBuilding,
    places: ["Mumbai", "Bangalore"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  }
];

const TravelExperience = () => {
<<<<<<< HEAD
  return (
    <>
      <Navbar />
=======
  const navigate = useNavigate();
  const handleCardClick = (title) => {
    // const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    console.log(`Redirecting to: ${window.origin}${window.location.pathname}/${title}`);
    navigate(`${window.location.pathname}/${title}`);
  };

  return (
    <>
      {/* <Navbar /> */}
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
      <InnerBanner
        backgroundImage={InnerBannerImage}
        title="Our Tour Programs"
      />
      <div className="min-h-screen bg-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="xl:text-[50px] font-bold text-[#011A4D] leading-none">Choose Your</h1>
          <h1 className="xl:text-[50px] font-bold text-[#011A4D] leading-none mb-4">Travel Experience</h1>
          <p className="text-gray-700 mb-8 max-w-2xl">
            Embark on a journey through India's diverse landscapes, rich culture, and timeless traditions. Select from our carefully curated collection of unique travel experiences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experiences.map((exp, index) => {
              const Icon = exp.icon;
              return (
                <div
                  key={index}
<<<<<<< HEAD
                  className="rounded-2xl shadow-md overflow-hidden bg-white min-h-[400px] hover:shadow-lg transition-shadow duration-300"
=======
                  className="rounded-2xl shadow-md overflow-hidden bg-white min-h-[400px] hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleCardClick(exp.title)}
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
                >
                  <div
                    className="h-[250px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${exp.image})` }}
                  >
                    <div className="h-full w-full flex items-center justify-center flex-col backdrop-brightness-50 gap-3">
                      <div className="flex items-center gap-2 rounded-full">
                        <Icon className="text-white text-2xl bg-[#31B462] p-2 w-[50px] h-[50px] rounded-xl" />
                        <span className="text-white xl:text-2xl font-bold text-md">{exp.title}</span>
                      </div>
                      <p className="text-white max-w-[290px] mx-auto text-center">{exp.description}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center lg:gap-3.5 gap-1.5 mb-4 py-6 border-b border-gray-200 flex-wrap">
                      {exp.places.map((place, i) => (
                        <span
                          key={i}
                          className="text-sm text-[#31B462] font-medium"
                        >
                          {place}
                        </span>
                      ))}
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        +1
                      </span>
                    </div>
<<<<<<< HEAD
                    <Link className="flex items-center justify-between w-full text-sm text-gray-600 font-medium gap-1">
                      Explore destinations
                      <span className="text-white bg-[#31B462] w-[20px] h-[20px] rounded-full flex items-center justify-center">→</span>
                    </Link>
=======
                    <div className="flex items-center justify-between w-full text-sm text-gray-600 font-medium gap-1">
                      Explore destinations
                      <span className="text-white bg-[#31B462] w-[20px] h-[20px] rounded-full flex items-center justify-center">→</span>
                    </div>
>>>>>>> 8dea90005557a2a1826d4363ddc66597f3e924ea
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <TravelTips />
      <NeedHelp className="!mt-0" />
      <Footer />
    </>
  );
};

export default TravelExperience;