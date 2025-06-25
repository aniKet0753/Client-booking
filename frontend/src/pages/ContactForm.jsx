import React, { useEffect } from 'react';
import InnerBanner from '../components/InnerBanner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaHome, FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const ContactForm = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    return (
        <div className="bg-[#E8F3FF]">
            <Navbar />
            <InnerBanner
                title="Contact Us"
                backgroundImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />

            <span className="bg-[#111827] h-[580px] block w-full"></span>

            <section className="text-white py-12 px-4 md:px-10 xl:px-20 relative z-10 -mt-[550px] mb-[130px] max-w-[1260px] mx-auto">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl sm:text-5xl md:text-[60px] font-bold mb-4">Get In Touch</h2>
                    <p className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut tempor ipsum dolor sit amet. labore
                    </p>

                    <div className="bg-white text-black rounded-md shadow-md flex flex-col md:flex-row overflow-hidden py-8">
                        {/* FORM SECTION */}
                        <div className="w-full md:w-2/3 p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full">
                                    <label className="block mb-1 font-semibold text-sm sm:text-base">Name</label>
                                    <input type="text" className="w-full border border-blue-400 rounded-md px-3 py-2" />
                                </div>
                                <div className="w-full">
                                    <label className="block mb-1 font-semibold text-sm sm:text-base">Email Address</label>
                                    <input type="email" className="w-full border border-blue-400 rounded-md px-3 py-2" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full">
                                    <label className="block mb-1 font-semibold text-sm sm:text-base">Phone Number</label>
                                    <input type="text" className="w-full border border-blue-400 rounded-md px-3 py-2" />
                                </div>
                                <div className="w-full">
                                    <label className="block mb-1 font-semibold text-sm sm:text-base">Address</label>
                                    <input type="text" className="w-full border border-blue-400 rounded-md px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-sm sm:text-base">Message</label>
                                <textarea className="w-full border border-blue-400 rounded-md px-3 py-2 h-28"></textarea>
                            </div>
                            <button className="w-full bg-[#0D2044] text-white py-2 rounded-full text-lg font-semibold hover:bg-[#0a1835] transition duration-300">
                                Submit
                            </button>
                        </div>

                        {/* CONTACT INFO SECTION */}
                        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-gray-300 p-4 sm:p-6 bg-white">
                            <h3 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-[#0D2044] mb-4 border-b pb-2">Contact Info</h3>
                            <ul className="space-y-4 text-sm sm:text-base">
                                <li className="flex items-start gap-3">
                                    <FaHome className="text-[#0D2044] mt-1" />
                                    <span>Plaza X, XY Floor, Street, XYZ</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaEnvelope className="text-[#0D2044] mt-1" />
                                    <span>admin@gmail.com</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaPhone className="text-[#0D2044] mt-1" />
                                    <span>+123-456-7890</span>
                                </li>
                            </ul>

                            <div className="flex gap-4 mt-6 text-[#0D2044] text-lg">
                                <FaFacebookF className="cursor-pointer hover:text-blue-600" />
                                <FaTwitter className="cursor-pointer hover:text-blue-400" />
                                <FaLinkedinIn className="cursor-pointer hover:text-blue-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactForm;
