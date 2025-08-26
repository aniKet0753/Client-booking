import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import axios from '../api'; // Use the correct axios instance

// Fallback content to ensure the page is never blank
const FALLBACK_CONTENT = {
    heading: 'Get to Know Us',
    paragraph1: 'This is fallback content. If you are seeing this, the dynamic content could not be loaded from the server. Please check your network connection or the server status.',
    paragraph2: 'We are a dedicated team committed to providing the best service to our clients. Our mission is to connect you with reliable agents and ensure a seamless experience.',
    paragraph3: 'Please note that the text content on this page is managed via a backend API, which may be temporarily unavailable.',
    buttonText: "Learn More",
};

const KnowUs = () => {
    // State to hold the dynamic content fetched from the backend
    const [content, setContent] = useState(FALLBACK_CONTENT);
    const [loading, setLoading] = useState(true);

    // Fetch the data from the backend on component mount
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get('/api/know-us-content', {
                    headers: {
                        'Content-Type': 'application/json' // Override the global header
                    }
                });
                const data = response.data;
                
                // Update the state with the fetched data
                setContent({
                    heading: data.heading || FALLBACK_CONTENT.heading,
                    paragraph1: data.paragraph1 || FALLBACK_CONTENT.paragraph1,
                    paragraph2: data.paragraph2 || FALLBACK_CONTENT.paragraph2,
                    paragraph3: data.paragraph3 || FALLBACK_CONTENT.paragraph3,
                    image1Base64: data.image1Base64, // Fetch Base64 data from the response
                    image2Base64: data.image2Base64, // Fetch Base64 data from the response
                    buttonText: "Learn More", // Kept static as per your backend
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch content:", err);
                // On error, the content state will remain as the FALLBACK_CONTENT
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const ref = useRef(null);

    // Display a loading indicator while fetching data
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl font-bold text-[#011A4D]">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <section ref={ref} className="flex flex-col lg:flex-row items-center gap-10 mb-16">
                {/* Image Section */}
                <div className="flex flex-col gap-4 basis-[50%]">
                    <div className="max-w-[400px] w-full overflow-hidden rounded-xl shadow-lg">
                        {/* Use the Base64 data from the state for the image source */}
                        {content.image1Base64 && (
                            <img
                                src={content.image1Base64}
                                alt="Group of travelers"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="flex justify-end">
                        <div className="max-w-[400px] w-full overflow-hidden rounded-xl shadow-lg">
                            {/* Use the Base64 data from the state for the image source */}
                            {content.image2Base64 && (
                                <img
                                    src={content.image2Base64}
                                    alt="Nurse with airplane in background"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="basis-[50%]">
                    <h2 className="lg:text-6xl text-3xl font-bold text-[#011A4D] mb-6">
                        {content.heading}
                    </h2>
                    {/* We use a check to ensure paragraphs only render if they have content */}
                    {content.paragraph1 && (
                        <p className="mt-4 text-black text-[22px]">
                            {content.paragraph1}
                        </p>
                    )}
                    {content.paragraph2 && (
                        <p className="mt-4 text-black text-[22px]">
                            {content.paragraph2}
                        </p>
                    )}
                    {content.paragraph3 && (
                        <p className="mt-4 text-black text-[22px]">
                            {content.paragraph3}
                        </p>
                    )}

                    {/* Button */}
                    <button className="mt-7 px-6 py-3 bg-[#011A4D] text-white font-bold rounded-full shadow-md hover:bg-green-700 transition text-[30px] max-w-[300px] w-full leading-none">
                        {content.buttonText}
                    </button>
                </div>
            </section>
        </>
    );
};

export default KnowUs;
