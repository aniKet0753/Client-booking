import React, { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';

function AgentDashboard() {
    const [moneyHistory, setMoneyHistory] = useState({ weekly: {}, monthly: {} });
    const [profile, setProfile] = useState({
        name: '',
        gender: '',
        dob: '',
        age: '',
        phone_calling: '',
        phone_whatsapp: '',
        email: '',
        password: '',
        aadhar_card: '',
        pan_card: '',
        photo: '',
        profession: '',
        income: '',
        office_address: '',
        permanent_address: {
            // Updated keys to match the new schema
            flatNo: '',
            locality: '',
            city: '',
            pincode: '',
            ps: '',
            state: '',
            altPhone: '',
            emergencyContact: '',
            disability: '',
            medicalCondition: '',
            medicalInsurance: '',
        },
        exclusive_zone: [],
        banking_details: {
            bank_name: '',
            acc_holder_name: '',
            acc_number: '',
            ifsc_code: '',
            branch_name: ''
        }
    });

    const [newPassword, setNewPassword] = useState('');
    const [listMessage, setListMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchMoneyHistory();
        fetchProfile();
    }, []);

    const fetchMoneyHistory = async () => {
        try {
            const response = await axios.get("/api/agents/money-history", {
                headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
            });
            setMoneyHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch money history", error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await axios.get("/api/agents/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` }
            });
            setProfile(response.data);
            // console.log(response.data);

        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("/api/agents/profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('Token')}`
                    }
                });
                // console.log('Profile Data:', res.data);
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile', error);
            }
        };

        fetchProfile();
    }, []);

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                email: profile.email,
            };

            if (newPassword.trim() !== '') {
                updateData.password = newPassword;
            }

            const response = await axios.put(
                "/api/agents/profile",
                JSON.stringify(updateData),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("Token")}`
                    }
                }
            );

            alert("Profile updated successfully!");
            setNewPassword(''); // Clear the field
        } catch (error) {
            alert("Failed to update profile: " + (error.response?.data?.error || "Unknown error"));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    
    return (
        <>
            <main className="min-h-screen bg-gray-100 p-6 text-white">

                {/* Header Section */}
                <div className='flex items-center justify-between'>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-extrabold text-black">Agent Dashboard</h2>
                        {/* <button
                        className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transform transition-all duration-300"
                        onClick={handleLogout}
                    >
                        Logout
                    </button> */}
                    </div>
                    
                    {/* Search Bar Section */}
                    <div className="relative mb-8">
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-white text-black border border-gray-300 rounded-lg pl-12 pr-6 py-3 w-full md:w-80 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-transparent shadow-lg"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-4 text-gray-400" />
                    </div>
                </div>

                {/* Money History and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    {/* Weekly Earnings */}
                    {/* <div className="bg-white text-black shadow-xl rounded-lg p-6 hover:scale-105 transform transition-all duration-300">
                        <h4 className="text-xl font-bold text-gray-800">Weekly Earnings</h4>
                        <ul className="mt-3 text-gray-700">
                            {Object.entries(moneyHistory.weekly).map(([day, amount]) => (
                                <li key={day} className="flex justify-between text-lg border-b border-gray-400 p-1 mb-2">
                                    <span className='text-[14px]'>{day}:</span>
                                    <span className="font-semibold text-indigo-500 text-[14px]">₹{amount}</span>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                    {/* Monthly Earnings */}
                    {/* <div className="bg-white text-black shadow-xl rounded-lg p-6 hover:scale-105 transform transition-all duration-300">
                        <h4 className="text-xl font-bold text-gray-800">Monthly Total</h4>
                        <p className="text-2xl font-bold text-blue-600 mt-4">
                            ₹{moneyHistory.monthly.total || 0}
                        </p>
                    </div> */}

                   {/* Account Status */}
                    <div className="bg-white text-black shadow-xl rounded-lg p-6 hover:scale-105 transform transition-all duration-300">
                        <h4 className="text-xl font-bold text-gray-800">Account Status</h4>
                        <p className={`text-2xl font-bold mt-4 ${profile.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {profile.status || 'N/A'}
                        </p>
                        <div className="relative mt-6">
                            <label className="absolute -top-2 left-2 bg-white text-xs text-gray-500 px-1">User ID</label>
                            <div className="border border-gray-300 rounded-md p-2 text-xs font-mono text-gray-700 bg-gray-50">
                                {profile.agentID || 'N/A'}
                            </div>
                        </div>
                    </div>                  

                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mb-8">
                    {/* <button
                        className="bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-800 transform transition-all duration-300"
                        onClick={() => {
                            if (profile.status === 'active') {
                                setListMessage("✅ You are allowed to list items.");
                            } else {
                                setListMessage("❌ You cannot list items as your status is not active. Please contact admin.");
                            }
                        }}
                    >
                        List Items
                    </button> */}
                    
                    {/* Add New Item */}
                    {/* <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:opacity-90 transform transition-all duration-300">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add New Item 
                    </button> */}
                </div>

                {/* List Message */}
                {listMessage && (
                    <div className={`p-6 rounded-lg text-lg font-semibold ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border mt-4`}>
                        {listMessage}
                    </div>
                )}

                {/* Profile Management Section */}
                <div className="bg-white shadow-xl rounded-lg p-8 mb-8 text-black mt-3">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Profile Management</h3>
                    <form onSubmit={updateProfile} className="space-y-5">
                        <div>
                            <label className="block text-gray-600">New Email:</label>
                            <input
                                type="text"
                                value={profile.email || ''}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full p-3 border rounded-lg shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600">New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                placeholder="Leave blank if you don't want to change password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border rounded-lg shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-800 transform transition-all duration-300"
                        >
                            Update Profile
                        </button>
                    </form>
                </div>

                {/* Agent Details Section */}
                <div className="bg-white shadow-xl rounded-lg p-8 mb-8 text-black">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Agent Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Name:</strong> {profile.name}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Gender:</strong> {profile.gender}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Email:</strong> {profile.email}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Phone:</strong> {profile.phone_calling}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>WhatsApp:</strong> {profile.phone_whatsapp}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>DOB:</strong> {new Date(profile.dob).toLocaleDateString()}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Age:</strong> {profile.age}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Profession:</strong> {profile.profession}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Income:</strong> ₹{profile.income}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Office Address:</strong> {profile.office_address}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Aadhar:</strong> {profile.aadhar_card}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>PAN:</strong> {profile.pan_card}</div>
                    </div>
                </div>

                {/* Permanent Address Section */}
                <div className="bg-white shadow-xl rounded-lg p-8 mb-8 text-black">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Permanent Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Updated to use new keys from the corrected schema */}
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Flat/House No:</strong> {profile.permanent_address?.flatNo}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Locality/Area:</strong> {profile.permanent_address?.locality}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>City:</strong> {profile.permanent_address?.city}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Pincode:</strong> {profile.permanent_address?.pincode}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Police Station:</strong> {profile.permanent_address?.ps}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>State:</strong> {profile.permanent_address?.state}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Alternate Phone:</strong> {profile.permanent_address?.altPhone}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Emergency Contact:</strong> {profile.permanent_address?.emergencyContact}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Disability:</strong> {profile.permanent_address?.disability}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Medical Condition:</strong> {profile.permanent_address?.medicalCondition}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Medical Insurance:</strong> {profile.permanent_address?.medicalInsurance}</div>
                    </div>
                </div>

                {/* Exclusive Zones Section */}
                <div className="bg-white shadow-xl rounded-lg p-8 mb-8 text-black">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Exclusive Zones</h3>
                    {profile.exclusive_zone?.map((zone, i) => (
                        <div key={i} className="bg-gray-100 p-6 rounded-lg shadow-md mb-4">
                            <div><strong>Pincode:</strong> {zone.pincode}</div>
                            <div><strong>Villages:</strong> {zone.village_preference.join(', ')}</div>
                        </div>
                    ))}
                </div>

                {/* Banking Details Section */}
                <div className="bg-white shadow-xl rounded-lg p-8 mb-8 text-black">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Banking Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Bank Name:</strong> {profile.banking_details?.bank_name}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Account Holder:</strong> {profile.banking_details?.acc_holder_name}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Account Number:</strong> {profile.banking_details?.acc_number}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>IFSC Code:</strong> {profile.banking_details?.ifsc_code}</div>
                        <div className='bg-gray-200 p-2 text-black rounded'><strong>Branch Name:</strong> {profile.banking_details?.branch_name}</div>
                    </div>
                </div>

                {/* Profile Photo */}
                {profile.photo && (
                    <div className="bg-white shadow-xl rounded-lg p-8 mt-8 text-black">
                        <p className="font-medium text-xl">Photo:</p>
                        <img src={profile.photo} alt="Agent Photo" className="w-40 h-40 rounded-full object-cover border mt-4" />
                    </div>
                )}

            </main>


        </>
    );
}

export default AgentDashboard;