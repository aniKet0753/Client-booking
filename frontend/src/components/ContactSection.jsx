import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link, } from "react-router-dom";
// import contactBg from "../../public/images/contact-bg-01.jpg";
import contactBg from '../../public/Images/contact-bg-01.jpg';

const ContactPage = () => {

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                <div ref={ref} className="bg-[#011A4D] py-10">
                    <div className="max-w-[1440px] w-full rounded-lg flex flex-col md:flex-row py-10">
                        {/* Left Section - Illustration */}
                        <div className="w-full rounded-lg relative text-center">

                            <h2 className="lg:text-6xl text-3xl font-bold text-white mb-16">Be a Part of Something Amazing</h2>

                            <div className="">
                                <Link to="/register">
                                    <button className="bg-[#F4B41A] max-w-[480px] w-full
                                    font-bold lg:text-3xl text-lg text-white px-6 py-3 rounded-full transition-all hover:shadow-lg">
                                        Go to Register
                                    </button>
                                </Link>
                            </div>

                        </div>

                        {/* Right Section - Form */}
                        {/* <div className="md:w-1/2 p-4 bg-blue-50 pl-8">
                        <h2 className="lg:text-6xl text-3xl font-bold text-[#113A5F] mb-3 leading-none">Get in Touch</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="" className="block font-bold text-xl mb-3">First Name</label>
                                    <input type="text" className="border p-2 rounded-lg w-full outline-[#3F67DB] transition-all" required />
                                </div>
                                <div>
                                    <label htmlFor="" className="block font-bold text-xl mb-3">Last Name</label>
                                    <input type="text" className="border p-2 rounded-lg w-full outline-[#3F67DB] transition-all" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="" className="block font-bold text-xl mb-3">Email Address</label>
                                    <input type="email" className="border p-2 rounded-lg w-full outline-[#3F67DB] transition-all" required />
                                </div>
                                <div>
                                    <label htmlFor="" className="block font-bold text-xl mb-3">Phone Number</label>
                                    <input type="tel" className="border p-2 rounded-lg w-full outline-[#3F67DB] transition-all" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="" className="block font-bold text-xl mb-3">Subject</label>
                                <input type="text" className="border p-2 rounded-lg w-full outline-[#3F67DB] transition-all" required />
                            </div>
                            <div>
                                <label htmlFor="" className="block font-bold text-xl mb-3">Message</label>
                                <textarea className="border p-2 rounded-lg w-full h-24 outline-[#3F67DB] transition-all resize-none" required></textarea>
                            </div>
                            <button type="submit" className="bg-[#53974A] font-bold text-3xl text-white py-2 px-4 rounded-full w-full hover:bg-green-700">
                                Send Message
                            </button>
                        </form>
                    </div> */}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default ContactPage;