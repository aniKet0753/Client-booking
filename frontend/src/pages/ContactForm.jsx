import React, { useState, useEffect } from 'react';
import axios from '../api'; // Import axios
import InnerBanner from '../components/InnerBanner'; // Assuming this component exists
import Navbar from '../components/Navbar'; // Assuming this component exists
import Footer from '../components/Footer'; // Assuming this component exists
import { FaHome, FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa'; // Font Awesome icons

const ContactForm = () => {
    // Loading state for UI feedback when fetching contact content
    const [loading, setLoading] = useState(true);
    // State to hold the contact page data, initialized with default values
    const [contactData, setContactData] = useState({
        heading: 'Get In Touch',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut tempor ipsum dolor sit amet. labore',
        address: 'Plaza X, XY Floor, Street, XYZ',
        email: 'admin@gmail.com',
        phone: '+123-456-7890',
        facebookUrl: 'https://facebook.com',
        twitterUrl: 'https://twitter.com',
        linkedinUrl: 'https://linkedin.com'
    });

    // New state to manage form input values
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        message: ''
    });

    // New state for form submission status
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

    // Effect for initial scroll to top and fetching content from backend
    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on component mount

        const fetchContactContent = async () => {
            setLoading(true); // Start loading
            try {
                // Make a GET request to your backend API using axios
                const response = await axios.get('/api/contact-content');
                console.log(response.data)
                setContactData(response.data); // Axios automatically parses JSON
            } catch (error) {
                console.error("Error fetching contact content:", error);
                const errorMessage = error.response?.data?.message || error.message || "Unknown error";
                console.error(`Detailed error: ${errorMessage}`);
                setContactData({ // Revert to defaults on error
                    heading: 'Get In Touch',
                    paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut tempor ipsum dolor sit amet. labore',
                    address: 'Plaza X, XY Floor, Street, XYZ',
                    email: 'admin@gmail.com',
                    phone: '+123-456-7890',
                    facebookUrl: 'https://facebook.com',
                    twitterUrl: 'https://twitter.com',
                    linkedinUrl: 'https://linkedin.com'
                });
            } finally {
                setLoading(false); // End loading regardless of success or failure
            }
        };

        fetchContactContent();
    }, []); // Empty dependency array means this runs once on mount

    // Function to handle changes to form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    // New function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form behavior (page reload)
        setSubmitting(true);
        setSubmitStatus(null);

        try {
            // Make a POST request to send the form data
            // You'll need to set up a corresponding endpoint in your backend
            const response = await axios.post('/api/contact-form', formData,{
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Form submitted successfully:', response.data);
            setSubmitStatus('success');
            // Optionally clear the form after successful submission
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                message: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            const errorMessage = error.response?.data?.message || error.message || "Unknown error during submission";
            console.error(`Detailed submission error: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };


    // Display a loading message while content is being fetched
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
                <div className="text-xl font-semibold text-gray-700">Loading contact information...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#E8F3FF] font-sans">
            <Navbar />
            <InnerBanner
                title="Contact Us"
                backgroundImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />

            {/* Spacer div to push content below the banner */}
            <span className="bg-[#111827] h-[580px] block w-full"></span>

            <section className="text-white py-12 px-4 md:px-10 xl:px-20 relative z-10 -mt-[550px] mb-[130px] max-w-[1260px] mx-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Dynamic Heading */}
                    <h2 className="text-4xl sm:text-5xl md:text-[60px] font-bold mb-4">{contactData.heading}</h2>
                    {/* Dynamic Paragraph */}
                    <p className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl">
                        {contactData.paragraph}
                    </p>

                    <div className="bg-white text-black rounded-md shadow-md flex flex-col md:flex-row overflow-hidden py-8">
                        {/* FORM SECTION */}
                        <div className="w-full md:w-2/3 p-4 sm:p-6 space-y-4">
                            {/* Submission status message */}
                            {submitStatus === 'success' && (
                                <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                                    Thank you! Your message has been sent successfully.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                                    Something went wrong. Please try again later.
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-full">
                                        <label htmlFor="name" className="block mb-1 font-semibold text-sm sm:text-base">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full border border-blue-400 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="email" className="block mb-1 font-semibold text-sm sm:text-base">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full border border-blue-400 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                    <div className="w-full">
                                        <label htmlFor="phone" className="block mb-1 font-semibold text-sm sm:text-base">Phone Number</label>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full border border-blue-400 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="address" className="block mb-1 font-semibold text-sm sm:text-base">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full border border-blue-400 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="message" className="block mb-1 font-semibold text-sm sm:text-base">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full border border-blue-400 rounded-md px-3 py-2 h-28"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full text-white py-2 rounded-full text-lg font-semibold transition duration-300 ${submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#0D2044] hover:bg-[#0a1835]'}`}
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </form>
                        </div>

                        {/* CONTACT INFO SECTION (now dynamic) */}
                        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-gray-300 p-4 sm:p-6 bg-white">
                            <h3 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-[#0D2044] mb-4 border-b pb-2">Contact Info</h3>
                            <ul className="space-y-4 text-sm sm:text-base">
                                <li className="flex items-start gap-3">
                                    <FaHome className="text-[#0D2044] mt-1" />
                                    <span>{contactData.address}</span> {/* Dynamic Address */}
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaEnvelope className="text-[#0D2044] mt-1" />
                                    <span>{contactData.email}</span> {/* Dynamic Email */}
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaPhone className="text-[#0D2044] mt-1" />
                                    <span>{contactData.phone}</span> {/* Dynamic Phone */}
                                </li>
                            </ul>

                            {/* Dynamic Social Media Links */}
                            <div className="flex gap-4 mt-6 text-[#0D2044] text-lg">
                                {contactData.facebookUrl && (
                                    <a href={contactData.facebookUrl} target="_blank" rel="noopener noreferrer">
                                        <FaFacebookF className="cursor-pointer hover:text-blue-600" />
                                    </a>
                                )}
                                {contactData.twitterUrl && (
                                    <a href={contactData.twitterUrl} target="_blank" rel="noopener noreferrer">
                                        <FaTwitter className="cursor-pointer hover:text-blue-400" />
                                    </a>
                                )}
                                {contactData.linkedinUrl && (
                                    <a href={contactData.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                        <FaLinkedinIn className="cursor-pointer hover:text-blue-700" />
                                    </a>
                                )}
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
