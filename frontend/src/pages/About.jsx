import { useEffect, useState } from "react";
import { FaSearch, FaUserFriends } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DiscountCover from '../../public/Images/planning-img-About.jpg';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InnerBanner from '../components/InnerBanner';
import axios from '../api';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// const agents = [
//     {
//         id: 'AG001',
//         name: 'Rahul Kumar',
//         phone: '+91 98765 43210',
//         avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
//         position: [28.6139, 77.2090],
//     },
//     {
//         id: 'AG002',
//         name: 'Priya Singh',
//         phone: '+91 98765 43211',
//         avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
//         position: [19.0760, 72.8777],
//     },
// ];

const AboutL2G = () => {

    const [agents, setAgents] = useState([]);
    const token = localStorage.getItem('Token');

    const fetchAgents = async () => {
        const token = localStorage.getItem("Token"); // ✅ move this inside fetchAgents
        console.log("Token being used:", token);

        if (!token) {
            console.warn("⚠️ No token found in localStorage");
            return;
        }

        try {
            const res = await axios.get("api/agents/active-agents", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("✅ Fetched agents:", res.data);
        } catch (error) {
            if (error.response) {
                console.error("❌ Backend error:", error.response.status, error.response.data);
            } else {
                console.error("❌ Unknown error:", error.message);
            }
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    return (
        <>
            <Navbar />
            <InnerBanner
                title="About Us"
                backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <div className="bg-[#E8F3FF] text-[#0D2044] font-sans">
                {/* About */}
                <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">About L2G</h2>
                            <p className="mb-4 text-gray-700">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                            </p>
                            <p className="text-gray-700">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                            </p>
                        </div>
                        <div className="w-full md:w-1/3">
                            <img src="https://img.freepik.com/free-photo/group-tourist-hiking-mountain_1150-7414.jpg" alt="About" className="rounded-lg w-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Search Box */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <h3 className="flex gap-2 items-center mb-3 text-lg font-semibold"><FaSearch /> Agent Search</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="State" className="border border-gray-300 rounded-md px-4 py-2" />
                            <input type="text" placeholder="Village" className="border border-gray-300 rounded-md px-4 py-2" />
                            <input type="text" placeholder="City" className="border border-gray-300 rounded-md px-4 py-2" />
                            <input type="text" placeholder="District" className="border border-gray-300 rounded-md px-4 py-2" />
                            <input type="text" placeholder="Agent ID" className="border border-gray-300 rounded-md px-4 py-2" />
                            <button className="bg-[#0D2044] text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-[#09172f]">
                                <FaSearch /> Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">Agents</h3>
                    <div className="rounded-md overflow-hidden border border-gray-300 mb-8">
                        <MapContainer
                            center={[22.9734, 78.6569]}
                            zoom={5}
                            scrollWheelZoom={true}
                            className="h-[570px] w-full z-0"
                        >
                            {/* For Google-like roadmap style */}
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />

                            {agents.map((agent, idx) => (
                                <Marker key={idx} position={agent.position}>
                                    <Popup>{agent.name}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                    </div>
                </div>

                {/* Agents List */}
                <div className="bg-[#E8F3FF] p-4 md:p-6 rounded-lg w-full max-w-7xl mx-auto">
                    <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-[#0D2044] font-semibold text-lg">
                            <FaUserFriends />
                            <span>Agents List</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                                <thead className="text-gray-600 text-xs uppercase ">
                                    <tr>
                                        <th className="px-4 py-4 border-b border-gray-200 bg-gray-300">Agent</th>
                                        <th className="px-4 py-4 border-b border-gray-200 bg-gray-300">Agent ID</th>
                                        <th className="px-4 py-4 border-b border-gray-200 bg-gray-300">Mobile Number</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-800">
                                    {agents.map((agent) => (
                                        <tr key={agent.id} className="bg-white">
                                            <td className="px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                                                <img
                                                    src={agent.avatar}
                                                    alt={agent.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <span className="font-semibold text-sm">{agent.name}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-gray-200">{agent.id}</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{agent.phone}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative">
                    <img
                        src={DiscountCover}
                        alt="cta"
                        className="w-full h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">Start Planning Your Trip Now and</h3>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E87400] mb-4">Get 30% Discount</h1>
                            <p className="max-w-xl mx-auto mb-4 text-sm sm:text-base">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <button className="bg-[#0D2044] text-white px-[100px] py-2 rounded-full text-lg hover:bg-[#09172f]">Book Now</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AboutL2G;
