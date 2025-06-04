import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import MainLogo from '../../public/main-logo.png';
import { motion } from 'framer-motion';
import axios from '../api';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { z } from 'zod';

// --- Zod Schemas ---
const sectionASchema = z.object({
    name: z.string().min(1, 'Full Name is required'),
    dob: z.string().min(1, 'Date of Birth is required'),
    age: z.string().min(1, 'Age is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().min(1, 'Primary Phone is required'),
    aadhar: z.string().min(1, 'Aadhar Card Number is required'),
    homeAddress: z.string().min(1, 'Complete Address is required'),
    aadharFront: z.any().refine((file) => !!file, { message: 'Aadhar Front Image is required' }),
    aadharBack: z.any().refine((file) => !!file, { message: 'Aadhar Back Image is required' }),
    panCard: z.any().refine((file) => !!file, { message: 'PAN Card Image is required' }),
});

const sectionBSchema = z.object({
    packageSelected: z.string().min(1, 'Package selected is required'),
    selectedTrip: z.string().min(1, 'Selected Trip is required'),
});

const sectionCSchema = z.object({
    numPersons: z.string().min(1, 'Number of persons is required'),
    passengers: z.array(
        z.object({
            name: z.string().min(1, 'Name is required'),
            age: z.string().min(1, 'Age is required'),
            gender: z.string().min(1, 'Gender is required'),
            idType: z.string().min(1, 'ID Type is required'),
            idNumber: z.string().min(1, 'ID Number is required'),
        })
    ),
    // Add childPassengers validation if needed
});

const CustomerForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        // Section A
        name: '',
        dob: '',
        gender: '',
        age: '',
        phone: '',
        altPhone: '',
        whatsapp: '',
        email: '',
        aadhar: '',
        pan: '',
        disability: '',
        medicalCondition: '',
        medicalInsurance: 'no',
        homeAddress: '',
        aadharFront: null,
        aadharBack: null,
        panCard: null,

        // Section B
        packageSelected: '',
        throughAgent: 'no',
        agentName: '',
        agentId: '',
        selectedTrip: '',
        destination: '',

        // Section C
        numPersons: '',
        numChildren: '',
        passengers: Array(8).fill({ name: '', age: '', gender: '', idType: '', idNumber: '' }),
        childPassengers: Array(4).fill({ name: '', age: '', gender: '', idType: '', idNumber: '' }),

        // Section D
        paymentMethod: '',
        chequeDetails: Array(3).fill({ chequeIssuedTo: '', chequeNumber: '', date: '', bankName: '', ifsc: '', amount: '' }),
        upiDetails: Array(3).fill({ date: '', paidTo: '', transactionRef: '', accountHolder: '', upiId: '', amount: '' }),
        bankDetails: Array(2).fill({ date: '', paidTo: '', transactionRef: '', accountHolder: '', accountNumber: '', amount: '' }),
        agentNamePayment: '',
        accountHolderName: ''
    });

    const [errors, setErrors] = useState({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [currentSection, setCurrentSection] = useState('A');
    const [showModal, setShowModal] = useState(false);
    const [termsLink, setTermsLink] = useState('');
    const [generating, setGenerating] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [error, setError] = useState(false);
    const [errorData, setErrorData] = useState(null);
    const [tour, setTour] = useState(null);
    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role');
    const tourID = searchParams.get('t');
    
    const getTourDetails = async()=>{
        console.log("getTourDetails function is running");
        const FetchToursRoute = role === 'superadmin' ? 'api/admin/tours' : role === 'customer' ? 'api/customer/tours' : 'api/agents/tours';
        const res = await axios.get(`${FetchToursRoute}/${tourID}`,{
             headers: {
                Authorization: `Bearer ${token}`,
                Role: role,
            },
        });
        console.log(res.data.tour);
        setTour(res.data.tour);
    }

    useEffect(()=>{
        getTourDetails();
    },[tourID, token, role]);

    const generateTermsAndPaymentLink = async () => {
        const givenOccupancy = searchParams.get('p');
        // Get from searchParams or fallback to location.state
        // console.log(location.state);
        const agentID = searchParams.get('a') || '';
        const tourName = tour.name;
        const tourPricePerHead = tour.pricePerHead;
        const tourActualOccupancy = tour.occupancy;
        const tourGivenOccupancy = givenOccupancy;
        const tourStartDate = tour.startDate;
        setGenerating(true);
        setButtonDisabled(true);
        setError(false);
        try {
          const response = await axios.post(
            '/api/generate-payment-link',
            {
              tourID,
              agentID,
              tourName,
              tourPricePerHead,
              tourActualOccupancy,
              tourGivenOccupancy,
              tourStartDate,
              GST : tour.GST
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('Token')}`,
              },
            }
          );
      
          const paymentUrl = response.data.url;
          const uniqueId = crypto.randomUUID();
          const termsUrl = `${window.origin}/terms/${uniqueId}?redirect=${encodeURIComponent(paymentUrl)}`;
          setTermsLink(termsUrl);
        } catch (error) {
            console.error('Error generating payment link:', error.response.data.error);
            setError(true);
            setErrorData(error.response.data.error);
            //   alert('Failed to generate payment link');
        } finally {
            setGenerating(false);
            setTimeout(() => {
                setButtonDisabled(false);
            }, 5000);
        }
    };

    // --- Validation with Zod ---
    const validateSection = (section) => {
        let result;
        if (section === 'A') {
            result = sectionASchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors = {};
                result.error.errors.forEach(err => {
                    fieldErrors[err.path[0]] = err.message;
                });
                setErrors(fieldErrors);
                return false;
            }
        }
        if (section === 'B') {
            result = sectionBSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors = {};
                result.error.errors.forEach(err => {
                    fieldErrors[err.path[0]] = err.message;
                });
                setErrors(fieldErrors);
                return false;
            }
        }
        if (section === 'C') {
            // Only validate the number of passengers entered
            const passengersToValidate = formData.passengers.slice(0, Number(formData.numPersons) || 1);
            result = sectionCSchema.safeParse({
                numPersons: formData.numPersons,
                passengers: passengersToValidate,
            });
            if (!result.success) {
                const fieldErrors = {};
                result.error.errors.forEach(err => {
                    if (err.path[0] === 'passengers') {
                        // For array errors, show error for each passenger
                        const idx = err.path[1];
                        const field = err.path[2];
                        fieldErrors[`passenger_${idx}_${field}`] = err.message;
                    } else {
                        fieldErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(fieldErrors);
                return false;
            }
        }
        setErrors({});
        return true;
    };

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
        // For passenger fields
        if (arrayName === 'passengers') {
            setErrors(prev => ({ ...prev, [`passenger_${index}_${field}`]: undefined }));
        }
    };

    const handleNextSection = () => {
        if (!validateSection(currentSection)) return;
        const sections = ['A', 'B', 'C', 'D', 'E'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex < sections.length - 1) {
            setCurrentSection(sections[currentIndex + 1]);
        }
    };

    const handlePrevSection = () => {
        const sections = ['A', 'B', 'C', 'D', 'E'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex > 0) {
            setCurrentSection(sections[currentIndex - 1]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleFinalSubmit = () => {
        // Validate all sections before final submit
        let valid = true;
        ['A', 'B', 'C'].forEach(section => {
            if (!validateSection(section)) valid = false;
        });
        if (!valid) {
            setShowModal(false);
            return;
        }
        if (acceptedTerms) {
            setErrors({});
            setShowModal(false);
            // Submit logic here
        }
    };

    // Section navigation
    const sectionTitles = {
        A: 'Personal Details',
        B: 'Package Details',
        C: 'Passenger Details',
        D: 'Terms and Conditions',
        E: 'Payment Details'
    };

    const handleSectionClick = (section) => {
        const sections = ['A', 'B', 'C', 'D', 'E'];
        const currentIndex = sections.indexOf(currentSection);
        const targetIndex = sections.indexOf(section);

        // Allow direct navigation only if going forward or to the same section
        if (targetIndex <= currentIndex) {
            setCurrentSection(section);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="bg-white rounded-lg shadow-lg p-6">

                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm cursor-pointer"
                >
                    <FaArrowLeft className="mr-2" />
                    Back
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-white p-2 rounded-full flex items-center justify-center border-4 border-blue-200">
                            <span className="text-blue-600 font-bold text-xl">
                                <img src={MainLogo} alt="" />
                            </span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-blue-800">L2G CRUISE & CURE</h1>
                    <h2 className="text-lg text-gray-700 font-medium">TRAVEL MANAGEMENT PRIVATE LIMITED</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        H.NO 6 NETAJI PATH, GOVIND NAGAR, ULIYAN, KADMA, JAMSHEDPUR, JHARKHAND
                    </p>
                    <h3 className="text-2xl font-bold mt-4 border-b-2 border-blue-800 pb-2 inline-block">KYC FORM</h3>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex justify-between relative">
                        {['A', 'B', 'C', 'D', 'E'].map((section) => (
                            <div key={section} className="flex flex-col items-center z-10">
                                <button
                                    type="button"
                                    onClick={() => handleSectionClick(section)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg 
                                    ${currentSection === section ? 'bg-blue-600 scale-110' :
                                    (section < currentSection ? 'bg-green-500' : 'bg-gray-400')}
                                    transition-all duration-300 shadow-md`}
                                >
                                    {section}
                                </button>
                                <span className={`mt-2 text-sm font-medium ${currentSection === section ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {sectionTitles[section]}
                                </span>
                            </div>
                        ))}
                        <div className="absolute h-1 bg-gray-300 top-6 left-12 right-12 -z-1">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${(['A', 'B', 'C', 'D', 'E'].indexOf(currentSection) / 3) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Form Sections */}
                <form onSubmit={handleSubmit}>
                    {/* Section A */}
                    {currentSection === 'A' && (
                        <div className="mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h4 className="text-xl font-bold text-blue-800">Section A: Personal Details</h4>
                                <p className="text-gray-600">Please fill in your personal information</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Info Group */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 border-b pb-2">Basic Information</h5>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Full Name*</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="Enter your full name"
                                                />
                                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-gray-700 mb-1 text-sm font-medium">Date of Birth*</label>
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        value={formData.dob}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-2 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    />
                                                    {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 mb-1 text-sm font-medium">Age*</label>
                                                    <input
                                                        type="number"
                                                        name="age"
                                                        value={formData.age}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-2 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                        placeholder="Your age"
                                                    />
                                                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Gender*</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="M">Male</option>
                                                    <option value="F">Female</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info Group */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 border-b pb-2">Contact Information</h5>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Primary Phone*</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="Primary contact number"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">(for official communication)</p>
                                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Alternative Phone</label>
                                                <input
                                                    type="tel"
                                                    name="altPhone"
                                                    value={formData.altPhone}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.altPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="Emergency contact number"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">(medical/other traveling emergency)</p>
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">WhatsApp Number</label>
                                                <input
                                                    type="tel"
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="WhatsApp number"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="Your email address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ID and Health Group */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 border-b pb-2">Identification</h5>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Aadhar Card Number*</label>
                                                <input
                                                    type="text"
                                                    name="aadhar"
                                                    value={formData.aadhar}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.aadhar ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="12-digit Aadhar number"
                                                />
                                                {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">PAN Card Number</label>
                                                <input
                                                    type="text"
                                                    name="pan"
                                                    value={formData.pan}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors.pan ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="10-digit PAN number"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Health Info Group */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 border-b pb-2">Health Information</h5>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Disability (if any)</label>
                                                <input
                                                    type="text"
                                                    name="disability"
                                                    value={formData.disability}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Specify if any"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Medical condition (if any)</label>
                                                <input
                                                    type="text"
                                                    name="medicalCondition"
                                                    value={formData.medicalCondition}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Specify if any"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 mb-1 text-sm font-medium">Medical insurance available</label>
                                                <select
                                                    name="medicalInsurance"
                                                    value={formData.medicalInsurance}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="no">No</option>
                                                    <option value="yes">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 border-b pb-2">Residential Address</h5>
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm font-medium">Complete Address*</label>
                                            <textarea
                                                name="homeAddress"
                                                value={formData.homeAddress}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${errors.homeAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                rows="3"
                                                placeholder="Your full residential address"
                                            ></textarea>
                                            {errors.homeAddress && <p className="text-red-500 text-xs mt-1">{errors.homeAddress}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Aadhar Front Image*</label>
                                    <input
                                        type="file"
                                        name="aadharFront"
                                        onChange={handleFileChange}
                                        className={`w-full px-4 py-2 border ${errors.aadharFront ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.aadharFront && <p className="text-red-500 text-xs mt-1">{errors.aadharFront}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Aadhar Back Image*</label>
                                    <input
                                        type="file"
                                        name="aadharBack"
                                        onChange={handleFileChange}
                                        className={`w-full px-4 py-2 border ${errors.aadharBack ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.aadharBack && <p className="text-red-500 text-xs mt-1">{errors.aadharBack}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">PAN Card Image*</label>
                                    <input
                                        type="file"
                                        name="panCard"
                                        onChange={handleFileChange}
                                        className={`w-full px-4 py-2 border ${errors.panCard ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.panCard && <p className="text-red-500 text-xs mt-1">{errors.panCard}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    onClick={handleNextSection}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
                                >
                                    Next: Section B
                                    <FaArrowRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section B */}
                    {currentSection === 'B' && (
                        <div className="mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h4 className="text-xl font-bold text-blue-800">Section B: Package Details</h4>
                                <p className="text-gray-600">Provide information about your travel package</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Package selected</label>
                                    <input
                                        type="text"
                                        name="packageSelected"
                                        value={formData.packageSelected}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.packageSelected ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter package name"
                                    />
                                    {errors.packageSelected && <p className="text-red-500 text-xs mt-1">{errors.packageSelected}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Booking through agent?</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="throughAgent"
                                                value="no"
                                                checked={formData.throughAgent === 'no'}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-gray-700">No</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="throughAgent"
                                                value="yes"
                                                checked={formData.throughAgent === 'yes'}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-gray-700">Yes</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.throughAgent === 'yes' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium">Agent name</label>
                                            <input
                                                type="text"
                                                name="agentName"
                                                value={formData.agentName}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${errors.agentName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Agent's name"
                                            />
                                            {errors.agentName && <p className="text-red-500 text-xs mt-1">{errors.agentName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium">Agent ID</label>
                                            <input
                                                type="text"
                                                name="agentId"
                                                value={formData.agentId}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${errors.agentId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Agent's ID"
                                            />
                                            {errors.agentId && <p className="text-red-500 text-xs mt-1">{errors.agentId}</p>}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Selected Trip*</label>
                                    <select
                                        name="selectedTrip"
                                        value={formData.selectedTrip}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.selectedTrip ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    >
                                        <option value="">Select Trip</option>
                                        <option value="A">MIRIK, DARJEELING, GANGTOK & NATHULA PASS (East Sikkim) 08th May-2025</option>
                                        <option value="B">MIRIK, DARJEELING, MAHANANDA WILD LIFE SANCTUARY 08th May-2025</option>
                                        <option value="C">GANGTOK, NATHULA PASS, LACHUNG (North Sikkim) 10th May-2025</option>
                                    </select>
                                    {errors.selectedTrip && <p className="text-red-500 text-xs mt-1">{errors.selectedTrip}</p>}
                                </div>

                                {formData.selectedTrip && (
                                    <div className="bg-blue-100 p-4 rounded-lg">
                                        <h5 className="font-bold text-blue-800 mb-2">Destination Route (From Kolkata to Kolkata)</h5>
                                        <div className="p-3 bg-white rounded">
                                            {formData.selectedTrip === 'A' && (
                                                <p className="text-gray-700">Kolkata → Siliguri → Mirik → Darjeeling → Gangtok → Siliguri → Kolkata</p>
                                            )}
                                            {formData.selectedTrip === 'B' && (
                                                <p className="text-gray-700">Kolkata → Siliguri → Mirik → Darjeeling → Mahananda wild life sanctuary → Siliguri → Kolkata</p>
                                            )}
                                            {formData.selectedTrip === 'C' && (
                                                <p className="text-gray-700">Siliguri → Gangtok → Lachung → Siliguri → Kolkata</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('A')}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    Back: Section A
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('C')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
                                >
                                    Next: Section C
                                    <FaArrowRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section C */}
                    {currentSection === 'C' && (
                        <div className="mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h4 className="text-xl font-bold text-blue-800">Section C: Passenger Details</h4>
                                <p className="text-gray-600">Provide information about all passengers</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">Number of persons for group tours*</label>
                                        <input
                                            type="number"
                                            name="numPersons"
                                            value={formData.numPersons}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border ${errors.numPersons ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                            required
                                            min="1"
                                        />
                                        {errors.numPersons && <p className="text-red-500 text-xs mt-1">{errors.numPersons}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">No. of Children (below 10 years)</label>
                                        <input
                                            type="number"
                                            name="numChildren"
                                            value={formData.numChildren}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border ${errors.numChildren ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-bold text-gray-700 mb-4 border-b pb-2">Details of passengers:</h5>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-200">
                                            <thead>
                                                <tr className="bg-blue-50">
                                                    <th className="border p-3 text-left text-sm font-medium text-gray-700">S/L</th>
                                                    <th className="border p-3 text-left text-sm font-medium text-gray-700">Name of Passenger(s)*</th>
                                                    <th className="border p-3 text-left text-sm font-medium text-gray-700">Age*</th>
                                                    <th className="border p-3 text-left text-sm font-medium text-gray-700">Gender*</th>
                                                    <th className="border p-3 text-left text-sm font-medium text-gray-700">ID Type*</th>
                                                    <th className="border p-3 text-left text-sm font-medium text-gray-700">ID Number*</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.passengers.slice(0, formData.numPersons || 1).map((passenger, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="border p-3 text-gray-700">{index + 1}</td>
                                                        <td className="border p-3">
                                                            <input
                                                                type="text"
                                                                value={passenger.name}
                                                                onChange={(e) => handleArrayChange('passengers', index, 'name', e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="border p-3">
                                                            <input
                                                                type="number"
                                                                value={passenger.age}
                                                                onChange={(e) => handleArrayChange('passengers', index, 'age', e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                required
                                                                min="1"
                                                            />
                                                        </td>
                                                        <td className="border p-3">
                                                            <select
                                                                value={passenger.gender}
                                                                onChange={(e) => handleArrayChange('passengers', index, 'gender', e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="M">Male</option>
                                                                <option value="F">Female</option>
                                                                <option value="Others">Others</option>
                                                            </select>
                                                        </td>
                                                        <td className="border p-3">
                                                            <select
                                                                value={passenger.idType}
                                                                onChange={(e) => handleArrayChange('passengers', index, 'idType', e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="Aadhar">Aadhar Card</option>
                                                                <option value="PAN">PAN Card</option>
                                                            </select>
                                                        </td>
                                                        <td className="border p-3">
                                                            <input
                                                                type="text"
                                                                value={passenger.idNumber}
                                                                onChange={(e) => handleArrayChange('passengers', index, 'idNumber', e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                required
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {formData.numChildren > 0 && (
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-4 border-b pb-2">Details of Child passengers (below 12 years):</h5>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-200">
                                                <thead>
                                                    <tr className="bg-blue-50">
                                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">S/L</th>
                                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">Name of Child*</th>
                                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">Age*</th>
                                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">Gender*</th>
                                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">ID Type*</th>
                                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">ID Number*</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.childPassengers.slice(0, formData.numChildren || 0).map((child, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="border p-3 text-gray-700">{index + 1}</td>
                                                            <td className="border p-3">
                                                                <input
                                                                    type="text"
                                                                    value={child.name}
                                                                    onChange={(e) => handleArrayChange('childPassengers', index, 'name', e.target.value)}
                                                                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    required
                                                                />
                                                            </td>
                                                            <td className="border p-3">
                                                                <input
                                                                    type="number"
                                                                    value={child.age}
                                                                    onChange={(e) => handleArrayChange('childPassengers', index, 'age', e.target.value)}
                                                                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    required
                                                                    max="11"
                                                                    min="0"
                                                                />
                                                            </td>
                                                            <td className="border p-3">
                                                                <select
                                                                    value={child.gender}
                                                                    onChange={(e) => handleArrayChange('childPassengers', index, 'gender', e.target.value)}
                                                                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    required
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="M">Male</option>
                                                                    <option value="F">Female</option>
                                                                    <option value="Others">Others</option>
                                                                </select>
                                                            </td>
                                                            <td className="border p-3">
                                                                <select
                                                                    value={child.idType}
                                                                    onChange={(e) => handleArrayChange('childPassengers', index, 'idType', e.target.value)}
                                                                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    required
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Aadhar">Aadhar Card</option>
                                                                    <option value="PAN">PAN Card</option>
                                                                </select>
                                                            </td>
                                                            <td className="border p-3">
                                                                <input
                                                                    type="text"
                                                                    value={child.idNumber}
                                                                    onChange={(e) => handleArrayChange('childPassengers', index, 'idNumber', e.target.value)}
                                                                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                    required
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <strong>Important Note:</strong> Please attach photocopies of your Aadhar card and Voter ID. For guests below 18 years without a voter ID, please provide a birth certificate. These documents are required for transit permits and bookings in Sikkim. Carry originals and 4 passport-size photos of each guest during travel.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('B')}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110-2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back: Section A
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('D')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
                                >
                                    Next: Section D
                                    <FaArrowRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section D */}
                    {currentSection === 'D' && (
                        <div className="mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h4 className="text-xl font-bold text-blue-800">Section D: Terms and Conditions</h4>
                                <p className="text-gray-600">Here you can view Terms and Conditions link which will also include the payment link.</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                <button
                                    type="button"
                                    onClick={generateTermsAndPaymentLink}
                                    className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition ${buttonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={buttonDisabled}
                                >
                                    {generating ? 'Generating...' : 'View Terms & Conditions Link'}
                                </button>

                                {generating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 1 }}
                                        className="mt-4 flex justify-center items-center"
                                    >
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                ease: 'linear',
                                            }}
                                            className="w-10 h-10 border-4 border-t-transparent border-blue-600 rounded-full"
                                        ></motion.div>
                                    </motion.div>
                                )}

                                {error && (
                                    <div className="text-red-600 mt-4">
                                        {errorData.includes('exceeds maximum amount') ? (
                                            <p>The maximum amount allowed per transaction is ₹5,00,000. Please reduce the number of travelers for this payment, and complete additional payments separately for the remaining individuals.</p>
                                        ) : (
                                            <p>Internal server error. Try again later...</p>
                                        )}
                                    </div>
                                )}

                                {termsLink && (
                                    <div className="mt-4">
                                        <p className="text-gray-700 font-medium">Click to view Terms and conditions:</p>
                                        <a
                                            href={termsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline break-all"
                                        >
                                            {termsLink}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('C')}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110-2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Back: Section C
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('E')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
                                >
                                    Next: Section E
                                   <FaArrowRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section E */}
                    {currentSection === 'E' && (
                        <div className="mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h4 className="text-xl font-bold text-blue-800">Section E: Payment Details</h4>
                                <p className="text-gray-600">Provide payment details for the booking</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Payment Method*</label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        required
                                    >
                                        <option value="">Select Payment Method</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="upi">UPI</option>
                                        <option value="bankTransfer">Bank Transfer</option>
                                    </select>
                                    {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
                                </div>

                                {/* Cheque Details */}
                                {formData.paymentMethod === 'cheque' && (
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-4">Cheque Details</h5>
                                        {formData.chequeDetails.map((cheque, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Cheque Issued To"
                                                    value={cheque.chequeIssuedTo}
                                                    onChange={(e) =>
                                                        handleArrayChange('chequeDetails', index, 'chequeIssuedTo', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Cheque Number"
                                                    value={cheque.chequeNumber}
                                                    onChange={(e) =>
                                                        handleArrayChange('chequeDetails', index, 'chequeNumber', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="date"
                                                    placeholder="Date"
                                                    value={cheque.date}
                                                    onChange={(e) =>
                                                        handleArrayChange('chequeDetails', index, 'date', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* UPI Details */}
                                {formData.paymentMethod === 'upi' && (
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-4">UPI Details</h5>
                                        {formData.upiDetails.map((upi, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Paid To"
                                                    value={upi.paidTo}
                                                    onChange={(e) =>
                                                        handleArrayChange('upiDetails', index, 'paidTo', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Transaction Reference"
                                                    value={upi.transactionRef}
                                                    onChange={(e) =>
                                                        handleArrayChange('upiDetails', index, 'transactionRef', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="UPI ID"
                                                    value={upi.upiId}
                                                    onChange={(e) =>
                                                        handleArrayChange('upiDetails', index, 'upiId', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Bank Transfer Details */}
                                {formData.paymentMethod === 'bankTransfer' && (
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-4">Bank Transfer Details</h5>
                                        {formData.bankDetails.map((bank, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Paid To"
                                                    value={bank.paidTo}
                                                    onChange={(e) =>
                                                        handleArrayChange('bankDetails', index, 'paidTo', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Transaction Reference"
                                                    value={bank.transactionRef}
                                                    onChange={(e) =>
                                                        handleArrayChange('bankDetails', index, 'transactionRef', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Account Number"
                                                    value={bank.accountNumber}
                                                    onChange={(e) =>
                                                        handleArrayChange('bankDetails', index, 'accountNumber', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection('D')}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110-2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Back: Section D
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center"
                                >
                                    Submit Form
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Terms and Conditions</h2>
                        <p className="text-gray-600 mb-4">
                            Please read and accept the terms and conditions before submitting the form.
                        </p>
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="acceptTerms" className="ml-2 text-gray-700">
                                I accept the terms and conditions
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleFinalSubmit}
                                className={`px-6 py-2 rounded-lg text-white ${acceptedTerms ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={!acceptedTerms}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerForm;