import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import KnowImg1 from '../../public/Images/know-01.jpg'
import KnowImg2 from '../../public/Images/know-02.jpg'


const KnowUs = () => {

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });


    return (

        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                <section ref={ref} className="flex flex-col lg:flex-row items-center gap-10 mb-16">


                    {/* Image Section */}
                    <div className="flex flex-col gap-4 basis-[50%]">
                        <div className="max-w-[400px] w-full overflow-hidden rounded-xl shadow-lg">
                            <img
                                src={KnowImg1}
                                alt="Group of travelers"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex justify-end">
                            <div className="max-w-[400px] w-full overflow-hidden rounded-xl shadow-lg">
                                <img
                                    src={KnowImg2}
                                    alt="Nurse with airplane in background"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="basis-[50%]">
                        <h2 className="lg:text-6xl text-3xl font-bold text-[#011A4D] mb-6">Get to Know Us</h2>
                        <p className="mt-4 text-black text-[22px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className="mt-4 text-black text-[22px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <p className="mt-4 text-black text-[22px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>

                        {/* Button */}
                        <button className="mt-7 px-6 py-3 bg-[#011A4D] text-white font-bold rounded-full shadow-md hover:bg-green-700 transition text-[30px] max-w-[300px] w-full leading-none">
                            Learn More
                        </button>
                    </div>
                </section>
            </motion.div>
        </>
    )


};

export default KnowUs;