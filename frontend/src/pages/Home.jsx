import { React, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLoaderData, useLocation } from "react-router-dom";
// import AllCountries from "../components/AllCountries";
import Banner from "../components/Banner";
// import ClientsReview from "../components/ClientsReview";
import Footer from "../components/Footer";
// import HomeTouristsSpots from "../components/HomeTouristsSpots";
// import TeamMembers from "../components/TeamMembers";
import KnowUs from "../components/KnowUs";
import TourSection from "../components/TourSection";
import MedicalTourism from "../components/MedicalTourism";
import PopularTourSection from "../components/PopularTour";
// import FeaturedProducts from "../components/FeaturedProducts";
import SpecialOffers from "../components/SpecialOffers";
import ContactPage from "../components/ContactSection";

const Home = () => {
  //   const allTouristsSpot = useLoaderData();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]); // Re-run this effect whenever the location object changes

  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
      >

        <div className="" ref={ref}>
          <Banner />
          <div className="px-10">
            <KnowUs />
          </div>
          <section id="tours">
            <TourSection />
          </section>
          <MedicalTourism />
          <PopularTourSection />
          <SpecialOffers />
          {/* <FeaturedProducts /> */}
          <ContactPage />
          {/* <HomeTouristsSpots allTouristsSpot={allTouristsSpot} />
      <AllCountries />
      <TeamMembers />
      <ClientsReview /> */}
          <Footer />
        </div>
      </motion.div>
    </>
  );
};

export default Home;
