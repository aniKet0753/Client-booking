import React, { useEffect } from "react";
import { Link, useLocation, useNavigate, } from "react-router-dom";
import { motion } from "framer-motion";
import ArrowLeft from "../../public/icons/arrow-left.svg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InnerBanner from "../components/InnerBanner";

const RedefiningMedicalTourismDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const packageItem = location.state?.package;

  if (!packageItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Package not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-[#011A4D] text-white px-6 py-2 rounded-lg hover:bg-[#086A16] transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }


  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, []);

  return (
    <>

      <Navbar />

      <div>
        <InnerBanner 
          backgroundImage = {packageItem.image}
          title = {packageItem.title}
          description  = {packageItem.shortDescription}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        {/* <div className="bg-[#011A4D] text-white py-6">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <img src={ArrowLeft} alt="Back" className="w-5 h-5" />
              <span>Back to Services</span>
            </button>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div>
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                src={packageItem.image}
                alt={packageItem.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />

              {/* Price Box */}
              <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#086A16]">
                <h3 className="text-2xl font-bold text-[#011A4D] mb-2">Package Details</h3>
                <p className="text-xl font-semibold text-[#086A16]">{packageItem.price}</p>
                <button className="mt-4 w-full bg-[#011A4D] text-white py-3 rounded-lg hover:bg-[#086A16] transition-colors font-semibold">
                  Book Now
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h2 className="text-3xl font-bold text-[#011A4D] mb-4">Service Overview</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {packageItem.fullDescription}
                </p>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h2 className="text-3xl font-bold text-[#011A4D] mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageItem.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#086A16] rounded-full"></div>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Additional Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h2 className="text-3xl font-bold text-[#011A4D] mb-4">Why Choose This Service?</h2>
                <ul className="space-y-3 text-gray-700 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-[#086A16] font-bold">✓</span>
                    <span>Comprehensive care and support throughout your medical journey</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#086A16] font-bold">✓</span>
                    <span>Expert medical staff and modern facilities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#086A16] font-bold">✓</span>
                    <span>Personalized service tailored to your specific needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#086A16] font-bold">✓</span>
                    <span>Affordable pricing with transparent cost structure</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-[#011A4D] to-[#086A16] text-white p-12 rounded-2xl text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contact us today to learn more about our {packageItem.title} and how we can support your medical journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/connect-us" className="bg-white text-[#011A4D] px-8 py-4 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                Contact Us Now
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </>
  );
};

export default RedefiningMedicalTourismDetail;