import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import MainLogo from '../../public/main-logo.png'; // Ensure this path is correct
import { motion } from 'framer-motion';
import axios from '../api'; // Ensure this path is correct for your axios instance
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
    // aadharFront: z.any().refine((file) => !!file, { message: 'Aadhar Front Image is required' }),
    // aadharBack: z.any().refine((file) => !!file, { message: 'Aadhar Back Image is required' }),
    // panCard: z.any().refine((file) => !!file, { message: 'PAN Card Image is required' }),
});

const sectionBSchema = z.object({
    tourType: z.string().min(1, 'Tour Type selected is required'),
    selectedTrip: z.string().min(1, 'Selected Trip is required'),
    // country: z.string().min(1, 'Destination is required'), // Assuming country is also required if it's part of the pre-filled package
});

// Zod schema for a single passenger
const passengerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.string().min(1, 'Age is required').regex(/^\d+$/, 'Age must be a number'), // Ensure age is numeric
    gender: z.string().min(1, 'Gender is required'),
    idType: z.string().min(1, 'ID Type is required'),
    idNumber: z.string().min(1, 'ID Number is required'),
});

const sectionCSchema = z.object({
    numPersons: z.string()
        .min(1, 'Number of adults is required')
        .regex(/^\d+$/, 'Number of adults must be a number')
        .transform(Number)
        .refine(num => num >= 1, 'At least one adult is required'),
    
    numChildren: z.string()
        .regex(/^\d*$/, 'Number of children must be a number')
        .transform(Number)
        .refine(num => num >= 0, 'Number of children cannot be negative')
        .optional(),

    passengers: z.array(passengerSchema)
        .min(1, 'At least one adult passenger is required')
        .refine(
            passengers => passengers.every(p => {
                const age = parseInt(p.age, 10);
                return !isNaN(age) && age >= 18;
            }),
            {
                message: 'All adult passengers must be at least 18 years old',
            }
        ),

    childPassengers: z.array(passengerSchema)
});

const CustomerForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bookingID, setBookingID] = useState(null);
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
        // aadharFront: null,
        // aadharBack: null,
        // panCard: null,

        // Section B
        tourType: '',
        throughAgent: 'no',
        agentName: '',
        agentId: '',
        selectedTrip: '',
        country: '',

        // Section C
        numPersons: '1', // Adults
        numChildren: '0', // Children
        passengers: [], // Dynamic array for adults
        childPassengers: [], // Dynamic array for children
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
    const [bookingData, setBookingData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role');
    const tourID = searchParams.get('t');

    // Initialize passengers and childPassengers arrays based on numPersons/numChildren
    useEffect(() => {
        const numAdults = Number(formData.numPersons);
        const numKids = Number(formData.numChildren);

        // Resize adults array
        setFormData(prev => {
            const newPassengers = Array.from({ length: numAdults }, (_, i) =>
                prev.passengers[i] || { name: '', age: '', gender: '', idType: '', idNumber: '' }
            );
            return { ...prev, passengers: newPassengers };
        });

        // Resize children array
        setFormData(prev => {
            const newChildPassengers = Array.from({ length: numKids }, (_, i) =>
                prev.childPassengers[i] || { name: '', age: '', gender: '', idType: '', idNumber: '' }
            );
            return { ...prev, childPassengers: newChildPassengers };
        });
    }, [formData.numPersons, formData.numChildren]);


    const getTourDetails = async () => {
        console.log("getTourDetails function is running");
        const FetchToursRoute = role === 'superadmin' ? 'api/admin/tours' : role === 'customer' ? 'api/customer/tours' : 'api/agents/tours';
        try {console.log(FetchToursRoute);
            const res = await axios.get(`${FetchToursRoute}/${tourID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Role: role,
                },
            });
            console.log(res.data.tour);
            setTour(res.data.tour);
            // Pre-fill package and trip if a tour is selected
            if (res.data.tour) {
                setFormData(prev => ({
                    ...prev,
                    tourType: res.data.tour.tourType || '',
                    selectedTrip: res.data.tour.name || '',
                    country: res.data.tour.country || '',
                }));
            }
        } catch (err) {
            console.error("Failed to fetch tour details:", err);
            // Handle error, maybe navigate away or show a message
            setError(true);
            setErrorData(err.response?.data?.error || 'Failed to load tour details.');
        }
    }

    useEffect(() => {
        if (tourID && token && role) {
            getTourDetails();
        }
    }, [tourID, token, role]);

    const getBooking = async() =>{
        try{
            console.log(tourID);
            const response = await axios.get(`/api/bookings/my-bookings/${tourID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data);
            setBookingData(response.data);
        } catch(err){
            console.error("Failed to fetch tour details:", err);
        }
    }

//     useEffect(() => {
//     if (bookingData && bookingData.length > 0) {
//         const data = bookingData[0]; // Use the first booking if multiple

//         setFormData(prev => ({
//             ...prev,
//             // Section A
//             name: data.customer?.name || '',
//             email: data.customer?.email || '',
//             phone: data.customer?.phone || '',
//             homeAddress: data.customer?.address || '',

//             // Section B
//             selectedTrip: data.tour?.name || '',
//             tourType: tour?.tourType || '', // Already fetched from getTourDetails
//             country: tour?.country || '',
//             throughAgent: data.agent?.agentId ? 'yes' : 'no',
//             agentId: data.agent?.agentId || '',
//             agentName: data.agent?.name || '',

//             // Section C
//             numPersons: `${data.travelers?.filter(t => t.age >= 12).length || 0}`, // assume >=12 is adult
//             numChildren: `${data.travelers?.filter(t => t.age < 12).length || 0}`,
//             passengers: data.travelers?.filter(t => t.age >= 12).map(p => ({
//                 name: p.name || '',
//                 age: `${p.age || ''}`,
//                 gender: p.gender || '',
//                 idType: p.idType || '',
//                 idNumber: p.idNumber || '',
//             })) || [],
//             childPassengers: data.travelers?.filter(t => t.age < 12).map(p => ({
//                 name: p.name || '',
//                 age: `${p.age || ''}`,
//                 gender: p.gender || '',
//                 idType: p.idType || '',
//                 idNumber: p.idNumber || '',
//             })) || [],
//         }));
//     }
// }, [bookingData, tour]);

useEffect(() => {
    if (bookingData && bookingData.length > 0) {
        const data = bookingData[0]; // Use the first booking if multiple

        const adults = data.travelers?.filter(t => t.age >= 18) || [];
        const children = data.travelers?.filter(t => t.age < 18) || [];

        setBookingID(data.bookingID);
        console.log(data.bookingID);
        setFormData(prev => ({
            ...prev,
            // Section A
            bookingID: data.bookingID,
            name: data.customer?.name || '',
            dob: data.customer?.dob || '',
            gender: data.customer?.gender || '',
            age: data.customer?.age || '',
            phone: data.customer?.phone || '',
            altPhone: data.customer?.altPhone || '',
            whatsapp: data.customer?.whatsapp || '',
            email: data.customer?.email || '',
            aadhar: data.customer?.aadhar || '',
            pan: data.customer?.pan || '',
            disability: data.customer?.disability || '',
            medicalCondition: data.customer?.medicalCondition || '',
            medicalInsurance: data.customer?.medicalInsurance || 'no',
            homeAddress: data.customer?.address || '',

            // Section B
            selectedTrip: data.tour?.name || '',
            tourType: tour?.tourType || '',
            country: tour?.country || '',
            throughAgent: data.agent?.agentId ? 'yes' : 'no',
            agentId: data.agent?.agentId || '',
            agentName: data.agent?.name || '',

            // Section C
            numPersons: `${adults.length || 1}`, // Ensure at least 1 adult
            numChildren: `${children.length || 0}`,
            passengers: adults.map(p => ({
                name: p.name || '',
                age: `${p.age || ''}`,
                gender: p.gender || '',
                idType: p.idType || '',
                idNumber: p.idNumber || '',
            })),
            childPassengers: children.map(p => ({
                name: p.name || '',
                age: `${p.age || ''}`,
                gender: p.gender || '',
                idType: p.idType || '',
                idNumber: p.idNumber || '',
            })),
        }));
    }
}, [bookingData, tour]);

    useEffect(() => {
        if (tourID && token && role) {
            getBooking();
        }
    }, [tourID, token, role]);
    
    const saveBooking = async () => {
        setIsSubmitting(true);
        try {
            // Combine adults and children for the travelers array
            const allTravelers = [
                ...formData.passengers.slice(0, Number(formData.numPersons) || 0),
                ...formData.childPassengers.slice(0, Number(formData.numChildren) || 0)
            ].map(passenger => ({
                name: passenger.name,
                age: Number(passenger.age),
                gender: passenger.gender,
                idType: passenger.idType,
                idNumber: passenger.idNumber
            }));

            const bookingData = {
                
                bookingID: (bookingID) ? bookingID : `BKG${Math.floor(10000 + Math.random() * 90000)}`,
                // bookingID: ,
                status: 'pending',
                bookingDate: new Date().toISOString(),
                tour,
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.homeAddress,
                    dob: formData.dob,
                    age: formData.age,
                    gender: formData.gender,
                    aadhar: formData.aadhar,
                    pan: formData.pan,
                    altPhone: formData.phone,
                    whatsapp: formData.whatsapp,
                    disability: formData.disability,
                    medicalCondition: formData.medicalCondition,
                    medicalInsurance: formData.medicalInsurance
                },
                travelers: allTravelers, // Send all travelers
                agent: formData.throughAgent === 'yes' ? {
                    agentId: formData.agentId,
                    name: formData.agentName,
                } : null,
            };

            const response = await axios.post('/api/bookings', bookingData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error saving booking:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateTermsAndPaymentLink = async () => {
        if (!tour) {
            setError(true);
            setErrorData("Tour details not loaded. Cannot generate payment link.");
            return;
        }

        try {
            await saveBooking();

            const givenOccupancy = searchParams.get('p');
            const agentID = searchParams.get('a') || '';
            const tourName = tour.name;
            const tourPricePerHead = tour.pricePerHead;
            const tourActualOccupancy = tour.occupancy;
            const tourGivenOccupancy = givenOccupancy;
            const tourStartDate = tour.startDate;

            setGenerating(true);
            setButtonDisabled(true);
            setError(false);

            const response = await axios.post(
                '/api/generate-payment-link',
                {   bookingID,
                    agentID,
                    tourID,
                    tourName,
                    tourPricePerHead,
                    tourActualOccupancy,
                    tourGivenOccupancy,
                    tourStartDate,
                    GST: tour.GST,
                    // customer: customerData,
                    // travelers: allTravelersForPayment, // Send all travelers
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
            const termsUrl = `${window.location.origin}/terms/${uniqueId}?redirect=${encodeURIComponent(paymentUrl)}`;
            setTermsLink(termsUrl);

            window.location.href = termsUrl;
        } catch (error) {
            console.error('Error in generateTermsAndPaymentLink:', error);
            setError(true);
            setErrorData(error.response?.data?.error || 'An error occurred during link generation or booking save.');
        } finally {
            setGenerating(false);
            setButtonDisabled(false);
        }
    };

    // --- Validation with Zod ---
    const validateSection = (section) => {
        let isValid = true;
        let newErrors = {};

        if (section === 'A') {
            const result = sectionASchema.safeParse(formData);
            if (!result.success) {
                result.error.errors.forEach(err => {
                    newErrors[err.path[0]] = err.message;
                });
                isValid = false;
            }
        }
        if (section === 'B') {
            const result = sectionBSchema.safeParse(formData);
            if (!result.success) {
                result.error.errors.forEach(err => {
                    newErrors[err.path[0]] = err.message;
                });
                isValid = false;
            }
        }
        if (section === 'C') {
            const numAdults = Number(formData.numPersons);
            const numKids = Number(formData.numChildren);

            const passengersToValidate = formData.passengers.slice(0, numAdults);
            const childPassengersToValidate = formData.childPassengers.slice(0, numKids);

            const result = sectionCSchema.safeParse({
                numPersons: formData.numPersons, // Pass as string for schema validation
                numChildren: formData.numChildren, // Pass as string for schema validation
                passengers: passengersToValidate,
                childPassengers: childPassengersToValidate,
            });

            if (!result.success) {
                result.error.errors.forEach(err => {
                    if (err.path[0] === 'passengers') {
                        const idx = err.path[1];
                        const field = err.path[2];
                        newErrors[`passenger_${idx}_${field}`] = err.message;
                    } else if (err.path[0] === 'childPassengers') {
                        const idx = err.path[1];
                        const field = err.path[2];
                        newErrors[`childPassenger_${idx}_${field}`] = err.message;
                    } else {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                isValid = false;
            }
        }
        if (section === 'D') {
            if (!acceptedTerms) {
                newErrors.acceptedTerms = 'You must accept the terms and conditions.';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
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
        // Clear specific error for passenger/childPassenger field
        if (arrayName === 'passengers') {
            setErrors(prev => ({ ...prev, [`passenger_${index}_${field}`]: undefined }));
        } else if (arrayName === 'childPassengers') {
            setErrors(prev => ({ ...prev, [`childPassenger_${index}_${field}`]: undefined }));
        }
    };

    const handleNumPersonsChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, numPersons: value }));
        setErrors(prev => ({ ...prev, numPersons: undefined }));
    };

    const handleNumChildrenChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, numChildren: value }));
        setErrors(prev => ({ ...prev, numChildren: undefined }));
    };


    const handleNextSection = () => {
        if (!validateSection(currentSection)) return;
        const sections = ['A', 'B', 'C', 'D'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex < sections.length - 1) {
            setCurrentSection(sections[currentIndex + 1]);
        }
    };

    const handlePrevSection = () => {
        const sections = ['A', 'B', 'C', 'D'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex > 0) {
            setCurrentSection(sections[currentIndex - 1]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentSection === 'D') {
            if (validateSection('D')) {
                setShowModal(true);
            }
        }
    };

    const handleFinalSubmit = async () => {
        const sectionsOrder = ['A', 'B', 'C'];
        let allValid = true;
        for (let i = 0; i < sectionsOrder.length; i++) {
            if (!validateSection(sectionsOrder[i])) {
                setCurrentSection(sectionsOrder[i]);
                allValid = false;
                break;
            }
        }

        if (!acceptedTerms) {
            setErrors(prev => ({ ...prev, acceptedTerms: 'You must accept the terms and conditions to proceed.' }));
            setCurrentSection('D');
            allValid = false;
        }

        setShowModal(false);

        if (allValid) {
            await generateTermsAndPaymentLink();
        }
    };

    // Section navigation
    const sectionTitles = {
        A: 'Personal Details',
        B: 'Package Details',
        C: 'Passenger Details',
        D: 'Confirmation'
    };

    const sections = Object.keys(sectionTitles); // Get section keys dynamically

    const handleSectionClick = (sectionKey) => {
        const currentIdx = sections.indexOf(currentSection);
        const targetIdx = sections.indexOf(sectionKey);

        if (targetIdx <= currentIdx) {
            setCurrentSection(sectionKey);
        } else {
            let canAdvance = true;
            for (let i = 0; i < targetIdx; i++) {
                if (!validateSection(sections[i])) {
                    setCurrentSection(sections[i]);
                    canAdvance = false;
                    break;
                }
            }
            if (canAdvance) {
                setCurrentSection(sectionKey);
            }
        }
    };

    const Info = ({ label, value }) => (
    <div>
        <p className="text-gray-600">{label}:</p>
        <p className="font-medium">{value || 'Not provided'}</p>
    </div>
    );
    
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
                                <img src={MainLogo} alt="L2G Cruise & Cure Logo" />
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
                        {sections.map((sectionKey) => (
                            <div key={sectionKey} className="flex flex-col items-center z-10">
                                <button
                                    type="button"
                                    onClick={() => handleSectionClick(sectionKey)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                                        ${currentSection === sectionKey ? 'bg-blue-600 scale-110' :
                                            (sections.indexOf(sectionKey) < sections.indexOf(currentSection) ? 'bg-green-500' : 'bg-gray-400')}
                                        transition-all duration-300 shadow-md`}
                                >
                                    {sectionKey}
                                </button>
                                <span className={`mt-2 text-sm font-medium ${currentSection === sectionKey ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {sectionTitles[sectionKey]}
                                </span>
                            </div>
                        ))}
                        <div className="absolute h-1 bg-gray-300 top-6 left-12 right-12 -z-1">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${(sections.indexOf(currentSection) / (sections.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Form Sections */}
                <form onSubmit={handleSubmit}>
                    {/* Section A: Personal Details */}
                    {currentSection === 'A' && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-semibold mb-2 text-gray-700">Section A: Personal Details</h2>
                            <p className="text-gray-500 mb-6">Please fill in your personal information</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Basic Information</h3>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name<span className="text-red-500">*</span></label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth<span className="text-red-500">*</span></label>
                                            <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} placeholder="dd/mm/yyyy" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age<span className="text-red-500">*</span></label>
                                            <input type="text" id="age" name="age" value={formData.age} onChange={handleChange} placeholder="Your age" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender<span className="text-red-500">*</span></label>
                                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Identification</h3>
                                    <div>
                                        <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card Number<span className="text-red-500">*</span></label>
                                        <input type="text" id="aadhar" name="aadhar" value={formData.aadhar} onChange={handleChange} placeholder="12-digit Aadhar number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
                                        <input type="text" id="pan" name="pan" value={formData.pan} onChange={handleChange} placeholder="10-digit PAN number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Health Information</h3>
                                        <div>
                                            <label htmlFor="disability" className="block text-sm font-medium text-gray-700 mb-1">Disability (if any)</label>
                                            <input type="text" id="disability" name="disability" value={formData.disability} onChange={handleChange} placeholder="Specify if any" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="medicalCondition" className="block text-sm font-medium text-gray-700 mb-1">Medical condition (if any)</label>
                                            <input type="text" id="medicalCondition" name="medicalCondition" value={formData.medicalCondition} onChange={handleChange} placeholder="Specify if any" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="medicalInsurance" className="block text-sm font-medium text-gray-700 mb-1">Medical insurance available</label>
                                            <select id="medicalInsurance" name="medicalInsurance" value={formData.medicalInsurance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                                <option value="no">No</option>
                                                <option value="yes">Yes</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Contact Information</h3>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Primary Phone<span className="text-red-500">*</span></label>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Primary contact number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        <p className="text-xs text-gray-500 mt-1">(for official communication)</p>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="altPhone" className="block text-sm font-medium text-gray-700 mb-1">Alternative Phone</label>
                                        <input type="tel" id="altPhone" name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Emergency contact number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        <p className="text-xs text-gray-500 mt-1">(medical/other traveling emergency)</p>
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                        <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WhatsApp number" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your email address" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Residential Address</h3>
                                    <div>
                                        <label htmlFor="homeAddress" className="block text-sm font-medium text-gray-700 mb-1">Complete Address<span className="text-red-500">*</span></label>
                                        <textarea id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleChange} rows="4" placeholder="Your full residential address" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                                        {errors.homeAddress && <p className="text-red-500 text-xs mt-1">{errors.homeAddress}</p>}
                                    </div>

                                    {/* <div className="mt-6">
                                        <label htmlFor="aadharFront" className="block text-sm font-medium text-gray-700 mb-1">Aadhar Front Image<span className="text-red-500">*</span></label>
                                        <input type="file" id="aadharFront" name="aadharFront" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        {errors.aadharFront && <p className="text-red-500 text-xs mt-1">{errors.aadharFront}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="aadharBack" className="block text-sm font-medium text-gray-700 mb-1">Aadhar Back Image<span className="text-red-500">*</span></label>
                                        <input type="file" id="aadharBack" name="aadharBack" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        {errors.aadharBack && <p className="text-red-500 text-xs mt-1">{errors.aadharBack}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="panCard" className="block text-sm font-medium text-gray-700 mb-1">PAN Card Image<span className="text-red-500">*</span></label>
                                        <input type="file" id="panCard" name="panCard" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        {errors.panCard && <p className="text-red-500 text-xs mt-1">{errors.panCard}</p>}
                                    </div> */}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Section B: Package Details */}
                    {currentSection === 'B' && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Section B: Package Details</h2>
                            <p className="text-gray-500 mb-6">Information about your selected package and trip. These fields are pre-filled.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="tourType" className="block text-sm font-medium text-gray-700 mb-1">Tour Type<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="tourType"
                                        name="tourType"
                                        value={formData.tourType}
                                        readOnly // Make non-editable
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                    />
                                    {errors.tourType && <p className="text-red-500 text-xs mt-1">{errors.tourType}</p>}
                                </div>
                                <div>
                                    <label htmlFor="selectedTrip" className="block text-sm font-medium text-gray-700 mb-1">Selected Trip<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="selectedTrip"
                                        name="selectedTrip"
                                        value={formData.selectedTrip}
                                        readOnly // Make non-editable
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                    />
                                    {errors.selectedTrip && <p className="text-red-500 text-xs mt-1">{errors.selectedTrip}</p>}
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        readOnly // Make non-editable
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                    />
                                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Through Agent?</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input type="radio" name="throughAgent" value="yes" checked={formData.throughAgent === 'yes'} onChange={handleChange} className="form-radio text-blue-600" />
                                            <span className="ml-2 text-gray-700">Yes</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input type="radio" name="throughAgent" value="no" checked={formData.throughAgent === 'no'} onChange={handleChange} className="form-radio text-blue-600" />
                                            <span className="ml-2 text-gray-700">No</span>
                                        </label>
                                    </div>
                                </div>
                                {formData.throughAgent === 'yes' && (
                                    <>
                                        <div>
                                            <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                                            <input type="text" id="agentName" name="agentName" value={formData.agentName} onChange={handleChange} placeholder="Enter agent's full name" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
                                            <input type="text" id="agentId" name="agentId" value={formData.agentId} onChange={handleChange} placeholder="Enter agent's ID" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Section C: Passenger Details */}
                    {currentSection === 'C' && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-semibold mb-2 text-gray-700">Section C: Passenger Details</h2>
                            <p className="text-gray-500 mb-6">Provide information about all passengers (adults and children)</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label htmlFor="numPersons" className="block text-sm font-medium text-gray-700 mb-1">Number of Adults<span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        id="numPersons"
                                        name="numPersons"
                                        value={formData.numPersons}
                                        onChange={handleNumPersonsChange}
                                        min="1" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.numPersons && <p className="text-red-500 text-xs mt-1">{errors.numPersons}</p>}
                                    
                                </div>
                                <div>
                                    <label htmlFor="numChildren" className="block text-sm font-medium text-gray-700 mb-1">Number of Children (below 10 years)</label>
                                    <input
                                        type="number"
                                        id="numChildren"
                                        name="numChildren"
                                        value={formData.numChildren}
                                        onChange={handleNumChildrenChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.numChildren && <p className="text-red-500 text-xs mt-1">{errors.numChildren}</p>}
                                </div>
                            </div>

                            {Number(formData.numPersons) > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Details of Adult Passengers:</h3>
                                    <div className="overflow-x-auto mb-6">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-md">
                                            <thead>
                                                <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <th className="py-3 px-4 border-b">S/L</th>
                                                    <th className="py-3 px-4 border-b">Name of Passenger(s)<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">Age<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">Gender<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">ID Type<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">ID Number<span className="text-red-500">*</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from({ length: Number(formData.numPersons) }).map((_, index) => (
                                                    <tr key={`adult-${index}`} className="border-b border-gray-200 last:border-b-0">
                                                        <td className="py-3 px-4 text-sm text-gray-800">{index + 1}</td>
                                                        <td className="py-3 px-4">
                                                            <input type="text" value={formData.passengers[index]?.name || ''} onChange={(e) => handleArrayChange('passengers', index, 'name', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                                            {errors[`passenger_${index}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger_${index}_name`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <input type="number" value={formData.passengers[index]?.age || ''} onChange={(e) => handleArrayChange('passengers', index, 'age', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                                            {errors[`passenger_${index}_age`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger_${index}_age`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <select value={formData.passengers[index]?.gender || ''} onChange={(e) => handleArrayChange('passengers', index, 'gender', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                                                <option value="">Select</option>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                            {errors[`passenger_${index}_gender`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger_${index}_gender`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <select value={formData.passengers[index]?.idType || ''} onChange={(e) => handleArrayChange('passengers', index, 'idType', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                                                <option value="">Select</option>
                                                                <option value="aadhar">Aadhar Card</option>
                                                                <option value="passport">Passport</option>
                                                                <option value="drivingLicense">Driving License</option>
                                                                <option value="voterId">Voter ID</option>
                                                            </select>
                                                            {errors[`passenger_${index}_idType`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger_${index}_idType`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <input type="text" value={formData.passengers[index]?.idNumber || ''} onChange={(e) => handleArrayChange('passengers', index, 'idNumber', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                                            {errors[`passenger_${index}_idNumber`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger_${index}_idNumber`]}</p>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                                {errors.passengers && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.passengers.message}
                                    </p>
                                )}

                            {Number(formData.numChildren) > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Details of Child Passengers:</h3>
                                    <div className="overflow-x-auto mb-6">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-md">
                                            <thead>
                                                <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <th className="py-3 px-4 border-b">S/L</th>
                                                    <th className="py-3 px-4 border-b">Name of Child Passenger(s)<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">Age<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">Gender<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">ID Type<span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4 border-b">ID Number<span className="text-red-500">*</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from({ length: Number(formData.numChildren) }).map((_, index) => (
                                                    <tr key={`child-${index}`} className="border-b border-gray-200 last:border-b-0">
                                                        <td className="py-3 px-4 text-sm text-gray-800">{index + 1}</td>
                                                        <td className="py-3 px-4">
                                                            <input type="text" value={formData.childPassengers[index]?.name || ''} onChange={(e) => handleArrayChange('childPassengers', index, 'name', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                                            {errors[`childPassenger_${index}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`childPassenger_${index}_name`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <input type="number" value={formData.childPassengers[index]?.age || ''} onChange={(e) => handleArrayChange('childPassengers', index, 'age', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                                            {errors[`childPassenger_${index}_age`] && <p className="text-red-500 text-xs mt-1">{errors[`childPassenger_${index}_age`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <select value={formData.childPassengers[index]?.gender || ''} onChange={(e) => handleArrayChange('childPassengers', index, 'gender', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                                                <option value="">Select</option>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                            {errors[`childPassenger_${index}_gender`] && <p className="text-red-500 text-xs mt-1">{errors[`childPassenger_${index}_gender`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <select value={formData.childPassengers[index]?.idType || ''} onChange={(e) => handleArrayChange('childPassengers', index, 'idType', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                                                <option value="">Select</option>
                                                                <option value="birthCertificate">Birth Certificate</option>
                                                                <option value="aadhar">Aadhar Card</option>
                                                                <option value="passport">Passport</option>
                                                            </select>
                                                            {errors[`childPassenger_${index}_idType`] && <p className="text-red-500 text-xs mt-1">{errors[`childPassenger_${index}_idType`]}</p>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <input type="text" value={formData.childPassengers[index]?.idNumber || ''} onChange={(e) => handleArrayChange('childPassengers', index, 'idNumber', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                                            {errors[`childPassenger_${index}_idNumber`] && <p className="text-red-500 text-xs mt-1">{errors[`childPassenger_${index}_idNumber`]}</p>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Important Note */}
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                                <p className="font-bold">Important Note:</p>
                                <p className="text-sm">Please attach photocopies of your Aadhar card and Voter ID. For guests below 18 years without a voter ID, please provide a birth certificate. These documents are required for transit permits and bookings in Sikkim. Carry originals and 4 passport-size photos of each guest during travel.</p>
                            </div>

                        </motion.div>
                    )}

                    {/* Section D - Confirmation */}
                    {currentSection === 'D' && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Section D: Confirmation</h2>
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <h4 className="text-xl font-bold text-blue-800">Review and Confirm</h4>
                            <p className="text-gray-600">Please review your information before submission</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h5 className="font-bold text-lg border-b pb-2">Personal Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Info label="Full Name" value={formData.name} />
                                    <Info label="Date of Birth" value={formData.dob} />
                                    <Info label="Gender" value={formData.gender} />
                                    <Info label="Age" value={formData.age} />
                                    <Info label="Phone" value={formData.phone} />
                                    <Info label="Alternate Phone" value={formData.altPhone} />
                                    <Info label="WhatsApp" value={formData.whatsapp} />
                                    <Info label="Email" value={formData.email || 'Not provided'} />
                                    <Info label="Aadhar Number" value={formData.aadhar} />
                                    <Info label="PAN Number" value={formData.pan} />
                                    <Info label="Disability" value={formData.disability || 'None'} />
                                    <Info label="Medical Condition" value={formData.medicalCondition || 'None'} />
                                    <Info label="Medical Insurance" value={formData.medicalInsurance === 'yes' ? 'Yes' : 'No'} />
                                    <Info label="Home Address" value={formData.homeAddress} />
                                    </div>
                                </div>

                                {/* Package Information */}
                                <div className="space-y-4">
                                    <h5 className="font-bold text-lg border-b pb-2">Package Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Info label="Tour Type" value={formData.tourType} />
                                    <Info label="Selected Trip" value={formData.selectedTrip} />
                                    <Info label="Country" value={formData.country} />
                                    <Info label="Through Agent" value={formData.throughAgent === 'yes' ? 'Yes' : 'No'} />
                                    {formData.throughAgent === 'yes' && (
                                        <>
                                        <Info label="Agent Name" value={formData.agentName} />
                                        <Info label="Agent ID" value={formData.agentId} />
                                        </>
                                    )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="font-bold text-lg border-b pb-2">Adult Passenger Information ({formData.numPersons} Adults)</h5>
                                    {Number(formData.numPersons) > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-200">
                                                <thead>
                                                    <tr className="bg-blue-50">
                                                        <th className="border p-2 text-left">Name</th>
                                                        <th className="border p-2 text-left">Age</th>
                                                        <th className="border p-2 text-left">Gender</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.passengers.slice(0, Number(formData.numPersons)).map((passenger, index) => (
                                                        <tr key={`confirm-adult-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="border p-2">{passenger.name}</td>
                                                            <td className="border p-2">{passenger.age}</td>
                                                            <td className="border p-2">{passenger.gender}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No adult passengers entered.</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h5 className="font-bold text-lg border-b pb-2">Child Passenger Information ({formData.numChildren} Children)</h5>
                                    {Number(formData.numChildren) > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-200">
                                                <thead>
                                                    <tr className="bg-blue-50">
                                                        <th className="border p-2 text-left">Name</th>
                                                        <th className="border p-2 text-left">Age</th>
                                                        <th className="border p-2 text-left">Gender</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.childPassengers.slice(0, Number(formData.numChildren)).map((child, index) => (
                                                        <tr key={`confirm-child-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="border p-2">{child.name}</td>
                                                            <td className="border p-2">{child.age}</td>
                                                            <td className="border p-2">{child.gender}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No child passengers entered.</p>
                                    )}
                                </div>


                                {/* Terms and Conditions checkbox */}
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        checked={acceptedTerms}
                                        onChange={(e) => {
                                            setAcceptedTerms(e.target.checked);
                                            setErrors(prev => ({ ...prev, acceptedTerms: undefined })); // Clear error on change
                                        }}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                    />
                                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                                        I have read and agree to the <span className="font-semibold text-blue-600 cursor-pointer" onClick={() => setShowModal(true)}>Terms and Conditions</span>.
                                    </label>
                                </div>
                                {errors.acceptedTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms}</p>}

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <strong>Important:</strong> By submitting this form, you agree to our terms and conditions. You will be redirected to the payment page after submission.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => handlePrevSection()}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    Back: Section C
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center"
                                    disabled={isSubmitting || !acceptedTerms}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                                    <FaArrowRight className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>


                {/* Navigation Buttons for Sections A, B, C */}
                {currentSection !== 'D' && (
                    <div className="flex justify-between mt-8">
                        {currentSection !== 'A' && (
                            <button
                                type="button"
                                onClick={handlePrevSection}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                            >
                                <FaArrowLeft className="mr-2" />
                                {`Back: Section ${sections[sections.indexOf(currentSection) - 1]}`}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleNextSection}
                            className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center ${currentSection === 'A' ? 'ml-auto' : ''}`}
                        >
                            Next: Section {sections[sections.indexOf(currentSection) + 1]} <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Submission</h2>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to submit this form? You will be redirected to the payment page after submission.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                className={`px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error/Loading display for generateTermsAndPaymentLink (outside form, within main container) */}
            {generating && (
                <div className="flex items-center justify-center text-blue-600 font-medium mt-4">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Payment Link...
                </div>
            )}
            {termsLink && !generating && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> Payment Link Generated: </span>
                    <a href={termsLink} target="_blank" rel="noopener noreferrer" className="text-green-800 underline hover:text-green-900 break-all">
                        {termsLink}
                    </a>
                    <p className="mt-2 text-sm">You are being redirected...</p>
                </div>
            )}
            {error && errorData && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {errorData}</span>
                </div>
            )}
        </div>
    );
};

export default CustomerForm;