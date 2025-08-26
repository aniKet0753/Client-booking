import React, { useState, useEffect } from "react";
import axios from '../api';

const AdminKnowUsEditPage = () => {
    // State to hold the editable content, including Base64 images
    const [content, setContent] = useState({
        heading: "",
        paragraph1: "",
        paragraph2: "",
        paragraph3: "",
        image1Base64: "", // Store Base64 strings here
        image2Base64: "", // Store Base64 strings here
        buttonText: "Learn More",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null); // New state for success/error messages

    // Fetch the data from the backend on component mount
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get('/api/know-us-content', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = response.data;
                
                setContent(prevContent => ({
                    ...prevContent,
                    heading: data.heading || "",
                    paragraph1: data.paragraph1 || "",
                    paragraph2: data.paragraph2 || "",
                    paragraph3: data.paragraph3 || "",
                    // Set the Base64 image data from the backend
                    image1Base64: data.image1Base64 || "",
                    image2Base64: data.image2Base64 || ""
                }));
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch content:", err);
                setError("Failed to load content. Please try again later.");
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    // Handle input changes for text fields
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setContent(prevContent => ({
            ...prevContent,
            [name]: value,
        }));
    };

    // Handle image file selection and convert to Base64
    const handleImageChange = (e, imageNumber) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setContent(prevContent => ({
                    ...prevContent,
                    // Store the Base64 string in the correct state property
                    [`image${imageNumber}Base64`]: reader.result,
                }));
            };
            reader.readAsDataURL(file); // Convert file to a data URL (Base64)
        }
    };

    // Function to save the data to the backend
    const handleSave = async () => {
        try {
            await axios.put('/api/know-us-content', {
                heading: content.heading,
                paragraph1: content.paragraph1,
                paragraph2: content.paragraph2,
                paragraph3: content.paragraph3,
                image1Base64: content.image1Base64, // Send Base64 data
                image2Base64: content.image2Base64, // Send Base64 data
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('Token')}`
                }
            });

            console.log("Content saved successfully!");
            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000); // Clear message after 3 seconds
        } catch (err) {
            console.error("Error saving content:", err);
            setError("Failed to save content. Please try again.");
            setSaveStatus("error");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl font-bold text-[#011A4D]">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-8 rounded-xl shadow-lg m-4">
            <h1 className="text-4xl font-bold text-center text-[#011A4D] mb-8">Admin Edit Page</h1>

            {/* Display success or error message */}
            {saveStatus === "success" && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-center">
                    Content saved successfully!
                </div>
            )}
            {saveStatus === "error" && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-center">
                    Failed to save content. Please try again.
                </div>
            )}

            {/* Edit Form Section */}
            <div className="space-y-6">
                {/* Heading Input */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Heading</label>
                    <input
                        type="text"
                        name="heading"
                        value={content.heading}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                </div>

                {/* Paragraph 1 Input */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Paragraph 1</label>
                    <textarea
                        name="paragraph1"
                        value={content.paragraph1}
                        onChange={handleTextChange}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                </div>

                {/* Paragraph 2 Input */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Paragraph 2</label>
                    <textarea
                        name="paragraph2"
                        value={content.paragraph2}
                        onChange={handleTextChange}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                </div>

                {/* Paragraph 3 Input */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Paragraph 3</label>
                    <textarea
                        name="paragraph3"
                        value={content.paragraph3}
                        onChange={handleTextChange}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                </div>

                {/* Image File Inputs */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Image 1</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 1)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                    {content.image1Base64 && (
                        <img src={content.image1Base64} alt="Preview 1" className="mt-4 w-48 rounded-xl shadow-md" />
                    )}
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Image 2</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 2)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                    {content.image2Base64 && (
                        <img src={content.image2Base64} alt="Preview 2" className="mt-4 w-48 rounded-xl shadow-md" />
                    )}
                </div>

                {/* Button Text Input */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Button Text</label>
                    <input
                        type="text"
                        name="buttonText"
                        value={content.buttonText}
                        onChange={handleTextChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011A4D]"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full mt-7 px-6 py-3 bg-[#011A4D] text-white font-bold rounded-full shadow-md hover:bg-green-700 transition"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default AdminKnowUsEditPage;