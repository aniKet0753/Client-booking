import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import MainLogo from '../../public/main-logo.png'; // Ensure this path is correct
import { motion, number } from 'framer-motion';
import axios from '../api'; // Ensure this path is correct for your axios instance
import { z } from 'zod';
import {
    FaArrowLeft,
    FaArrowRight,
    FaExclamationCircle,
    FaInfoCircle,
    FaCheckCircle,
    FaUser,
    FaUserAlt,
    FaBirthdayCake,
    FaPhone,
    FaWhatsapp,
    FaEnvelope,
    FaHome,
    FaIdCard,
    FaPassport,
    FaSuitcase,
    FaUsers,
    FaChild,
    FaFileSignature,
    FaCheck,
    FaExclamationTriangle,
    FaClipboardCheck,
    // New icons for Section D
    FaUserTie,
    FaCalendarAlt,
    FaVenusMars,
    FaPhoneAlt,
    FaCreditCard,
    FaWheelchair,
    FaHeartbeat,
    FaShieldAlt,
    FaMapMarkedAlt,
    FaRoute,
    FaGlobeAsia,
    FaUserFriends,
    FaUserSlash,
    FaBaby,
    FaSpinner,
    FaIdBadge
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInYears, parseISO } from 'date-fns';

// --- Zod Schemas ---
const sectionASchema = z.object({
    name: z.string().min(1, 'Full Name is required'),
    dob: z.string().min(1, 'Date of Birth is required'),
    age: z.string().min(1, 'Age is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().min(1, 'Primary Phone is required'),
    aadhar: z.string().min(1, 'Aadhar Card Number is required'),
    homeAddress: z.object({
        flatNo: z.string().optional(),
        locality: z.string().optional(),
        city: z.string().optional(),
        pincode: z.string().optional(),
        ps: z.string().optional(),
        state: z.string().optional(),

        altPhone: z.string().optional(),
        emergency: z.string().optional(),
        disability: z.string().optional(),
        medicalCondition: z.string().optional(),
        medicalInsurance: z.string().optional(),
    }).optional(),
    // pin: z.string().min(1, 'PIN Number is required'), // <-- Added line
    pan: z.string().min(1, 'PAN Card Number is required'),
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
});

const sectionBSchema = z.object({
    tourType: z.string().min(1, 'Tour Type selected is required'),
    selectedTrip: z.string().min(1, 'Selected Trip is required'),
    throughAgent: z.enum(['yes', 'no']),
    agentID: z.string().optional(),
}).refine(
    (data) => {
        if (data.throughAgent === 'yes') {
            return !!data.agentID && data.agentID.trim() !== '';
        }
        return true;
    },
    {
        message: 'Agent ID is required when booking through agent',
        path: ['agentID'],
    }
);

// Zod schema for a single passenger (no age restriction here)
const passengerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.string()
        .min(1, 'Age is required')
        .regex(/^\d+$/, 'Age must be a number'),
    gender: z.string().min(1, 'Gender is required'),
    idType: z.string().min(1, 'ID Type is required'),
    idNumber: z.string().min(1, 'ID Number is required'),
});

const adultPassengerSchema = passengerSchema.refine(
    p => {
        const age = parseInt(p.age, 10);
        return !isNaN(age) && age >= 18;
    },
    {
        message: 'Age must be at least 18 for adult passengers',
        path: ['age'], // This ensures the error attaches to the age field
    }
);

const childPassengerSchema = passengerSchema.refine(
    p => {
        const age = parseInt(p.age, 10);
        return !isNaN(age) && age < 18;
    },
    {
        message: 'Age must be less than 18 for child passengers',
        path: ['age'], // This ensures the error attaches to the age field
    }
);



// Section C schema with custom refinements for age
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

    passengers: z.array(adultPassengerSchema)
        .min(1, 'At least one adult passenger is required'),

    childPassengers: z.array(childPassengerSchema)
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
        homeAddress: {
            flatNo: '',
            locality: '',
            city: '',
            pincode: '',
            ps: '',
            state: '',
            altPhone: '',
            emergencyContact: '',
            disability: 'None',
            medicalCondition: 'None',
            medicalInsurance: 'no'
        },
        pin: '', // <-- Added line
        // aadharFront: null,
        // aadharBack: null,
        // panCard: null,

        // Section B
        tourType: '',
        throughAgent: 'no',
        // agentName: '',
        agentID: '',
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
    const agentIDFromURL = searchParams.get('a') || '';
    const [isUppercase, setIsUppercase] = useState(false);
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
        // console.log("getTourDetails function is running");
        const FetchToursRoute = role === 'superadmin' ? 'api/admin/tours' : role === 'customer' ? 'api/customer/tours' : 'api/agents/tours';
        try {
            // console.log(FetchToursRoute);
            const res = await axios.get(`${FetchToursRoute}/${tourID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Role: role,
                },
            });
            // console.log(res.data.tour);
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

    useEffect(() => {
        // Set agentID from URL when the component mounts or when the URL changes
        setFormData(prev => {
            const newFormData = { ...prev };
            if (agentIDFromURL) {
                newFormData.agentID = agentIDFromURL;
                newFormData.throughAgent = 'yes'; // Crucial: Explicitly set throughAgent to 'yes'
            }
            return newFormData;
        });
    }, [agentIDFromURL]);

    const getBooking = async () => {
        try {
            console.log(tourID);
            const response = await axios.get(`/api/bookings/my-bookings/${tourID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data);
            setBookingData(response.data);
        } catch (err) {
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
    //             throughAgent: data.agent?.agentID ? 'yes' : 'no',
    //             agentID: data.agent?.agentID || '',
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
                throughAgent: agentIDFromURL ? 'yes' : 'no',
                agentID: agentIDFromURL || '',
                // agentName: data.agent?.name || '',

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
console.log(tour);
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

            const totalAmountWithoutGST = Number(tour.packageRates.adultRate) * Number(formData.numPersons) +
                        (Number(formData.numChildren) > 0 ? Number(tour.packageRates.childRate) * Number(formData.numChildren) : 0);

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
                    agentID: formData.agentID,
                    // name: formData.agentName,
                } : null,
                packageRates: {
                    adultRate: tour.packageRates.adultRate,
                    childRate: tour.packageRates.childRate
                },
                payment: {
                    totalAmount: (totalAmountWithoutGST) * (100 + tour.GST)/100,
                    paidAmount: 0,
                    paymentStatus: 'Pending',
                }
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
            const saveBookingResponse = await saveBooking();
            console.log(saveBookingResponse.bookingID);
            const bookingID = saveBookingResponse.bookingID;
            const givenOccupancy = searchParams.get('p');
            // const agentID = searchParams.get('a') || '';
            // const agentID = formData.throughAgent === 'yes' ? formData.agentID : '';
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
                {
                    bookingID,
                    agentID: formData.throughAgent === 'yes' ? formData.agentID : '',
                    tourID,
                    tourName,
                    tourPricePerHead,
                    tourActualOccupancy,
                    tourGivenOccupancy,
                    tourStartDate,
                    GST: tour.GST,
                    numAdults: formData.numPersons,
                    numChildren :formData.numChildren,
                    packageRates: {
                        adultRate: tour.packageRates.adultRate,
                        childRate: tour.packageRates.childRate,
                    },
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
            const termsUrl = `${window.location.origin}/terms/tour/${tourID}/${uniqueId}?redirect=${encodeURIComponent(paymentUrl)}`;
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

        if (name.startsWith('homeAddress.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                homeAddress: {
                    ...prev.homeAddress,
                    [field]: value
                }
            }));
            setErrors(prev => ({ ...prev, [name]: undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
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

    // Redirect to login if not authenticatedAdd commentMore actions
    useEffect(() => {
        const token = localStorage.getItem('Token');
        if (!token) {
            navigate('/login', { state: { from: location.pathname + location.search } });
        }
    }, [navigate, location]);

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
                            className="relative"
                        >
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <FaUser className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">Section A: Personal Details</h2>
                                    <p className="text-gray-500">Please fill in your personal information</p>
                                </div>
                            </div>

                            {/* Form Progress Indicator */}
                            <div className="mb-8 bg-gray-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                                {/* Left Column */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <FaUserAlt className="text-blue-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                Full Name <span className="text-red-500 ml-1">*</span>
                                                {errors.name && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    className={`w-full px-4 py-2 pl-10 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                <FaUser className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    Date of Birth <span className="text-red-500 ml-1">*</span>
                                                    {errors.dob && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <div className="relative">
                                                    <DatePicker
                                                        selected={formData.dob ? new Date(formData.dob) : null}
                                                        onChange={(date) => {
                                                            // Format date as yyyy-mm-dd for storage
                                                            const formatted = date ? date.toISOString().split('T')[0] : '';
                                                            // Calculate age
                                                            let age = '';
                                                            if (date) {
                                                                const today = new Date();
                                                                age = today.getFullYear() - date.getFullYear();
                                                                const m = today.getMonth() - date.getMonth();
                                                                if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                                                                    age--;
                                                                }
                                                                age = String(age);
                                                            }
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                dob: formatted,
                                                                age: age
                                                            }));
                                                            setErrors(prev => ({ ...prev, dob: undefined, age: undefined }));
                                                        }}
                                                        dateFormat="yyyy-MM-dd"
                                                        placeholderText="Enter date of birth"
                                                        className={`w-full px-4 py-2 pl-[35px] border ${errors.dob ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                        showYearDropdown
                                                        yearDropdownItemNumber={100}
                                                        scrollableYearDropdown
                                                        maxDate={new Date()}
                                                    />
                                                    <FaBirthdayCake className="absolute left-3 top-3 text-gray-400" />
                                                </div>
                                                {errors.dob && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.dob}</p>}
                                            </div>

                                            <div className="relative">
                                                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    Age <span className="text-red-500 ml-1">*</span>
                                                    {errors.age && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="age"
                                                    name="age"
                                                    value={formData.age}
                                                    readOnly
                                                    placeholder="Your age"
                                                    className={`w-full px-4 py-2 border ${errors.age ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100`}
                                                />
                                                {errors.age && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.age}</p>}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                Gender <span className="text-red-500 ml-1">*</span>
                                                {errors.gender && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                            </label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${errors.gender ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                            {errors.gender && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.gender}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <FaIdCard className="text-blue-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-700">Identification</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                Aadhar Card Number <span className="text-red-500 ml-1">*</span>
                                                {errors.aadhar && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="aadhar"
                                                    name="aadhar"
                                                    value={formData.aadhar}
                                                    onChange={handleChange}
                                                    placeholder="12-digit Aadhar number"
                                                    className={`w-full px-4 py-2 pl-10 border ${errors.aadhar ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                <FaIdCard className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            {errors.aadhar && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.aadhar}</p>}
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="pan" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                PAN Card Number <span className="text-red-500 ml-1">*</span>
                                                {errors.pan && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="pan"
                                                    name="pan"
                                                    value={formData.pan}
                                                    onChange={handleChange}
                                                    placeholder="10-digit PAN number"
                                                    className={`w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${formData.pan ? 'uppercase' : ''}`}
                                                />
                                                <FaPassport className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            {errors.pan && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.pan}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center mb-4">
                                            <FaSuitcase className="text-blue-500 mr-2" />
                                            <h3 className="text-lg font-semibold text-gray-700">Health Information</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="disability" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Disability (if any)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="disability"
                                                    name="disability"
                                                    value={formData.disability}
                                                    onChange={handleChange}
                                                    placeholder="Specify if any"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="medicalCondition" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Medical condition (if any)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="medicalCondition"
                                                    name="medicalCondition"
                                                    value={formData.medicalCondition}
                                                    onChange={handleChange}
                                                    placeholder="Specify if any"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="medicalInsurance" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Medical insurance available
                                                </label>
                                                <select
                                                    id="medicalInsurance"
                                                    name="medicalInsurance"
                                                    value={formData.medicalInsurance}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="no">No</option>
                                                    <option value="yes">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact and Address Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Contact Information */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <FaPhone className="text-blue-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-700">Contact Information</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                Primary Phone <span className="text-red-500 ml-1">*</span>
                                                {errors.phone && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Primary contact number"
                                                    className={`w-full px-4 py-2 pl-10 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center"><FaInfoCircle className="mr-1" /> For official communication</p>
                                            {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.phone}</p>}
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="altPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Alternative Phone
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    id="altPhone"
                                                    name="altPhone"
                                                    value={formData.altPhone}
                                                    onChange={handleChange}
                                                    placeholder="Emergency contact number"
                                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center"><FaInfoCircle className="mr-1" /> Medical/other traveling emergency</p>
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                                WhatsApp Number
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    id="whatsapp"
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={handleChange}
                                                    placeholder="WhatsApp number"
                                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <FaWhatsapp className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                Email Address <span className="text-red-500 ml-1">*</span>
                                                {errors.email && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Your email address"
                                                    className={`w-full px-4 py-2 pl-10 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Residential Address */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <FaHome className="text-blue-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-700">Residential Address</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Flat/House No */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.flatNo" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    Flat/House No <span className="text-red-500 ml-1">*</span>
                                                    {errors['homeAddress.flatNo'] && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.flatNo"
                                                    name="homeAddress.flatNo"
                                                    value={formData.homeAddress.flatNo}
                                                    onChange={handleChange}
                                                    placeholder="e.g., A-202"
                                                    className={`w-full px-4 py-2 border ${errors['homeAddress.flatNo'] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                {errors['homeAddress.flatNo'] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors['homeAddress.flatNo']}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Locality/Area */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.locality" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    Locality/Area <span className="text-red-500 ml-1">*</span>
                                                    {errors['homeAddress.locality'] && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.locality"
                                                    name="homeAddress.locality"
                                                    value={formData.homeAddress.locality}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Koramangala"
                                                    className={`w-full px-4 py-2 border ${errors['homeAddress.locality'] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                {errors['homeAddress.locality'] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors['homeAddress.locality']}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* City */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.city" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    City <span className="text-red-500 ml-1">*</span>
                                                    {errors['homeAddress.city'] && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.city"
                                                    name="homeAddress.city"
                                                    value={formData.homeAddress.city}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Bangalore"
                                                    className={`w-full px-4 py-2 border ${errors['homeAddress.city'] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                {errors['homeAddress.city'] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors['homeAddress.city']}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Pincode */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.pincode" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    Pincode <span className="text-red-500 ml-1">*</span>
                                                    {errors['homeAddress.pincode'] && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.pincode"
                                                    name="homeAddress.pincode"
                                                    value={formData.homeAddress.pincode}
                                                    onChange={handleChange}
                                                    placeholder="6-digit pincode"
                                                    className={`w-full px-4 py-2 border ${errors['homeAddress.pincode'] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                {errors['homeAddress.pincode'] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors['homeAddress.pincode']}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Police Station */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.ps" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    Police Station <span className="text-red-500 ml-1">*</span>
                                                    {errors['homeAddress.ps'] && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.ps"
                                                    name="homeAddress.ps"
                                                    value={formData.homeAddress.ps}
                                                    onChange={handleChange}
                                                    placeholder="Nearest police station"
                                                    className={`w-full px-4 py-2 border ${errors['homeAddress.ps'] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                {errors['homeAddress.ps'] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors['homeAddress.ps']}
                                                    </p>
                                                )}
                                            </div>

                                            {/* State */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.state" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                    State <span className="text-red-500 ml-1">*</span>
                                                    {errors['homeAddress.state'] && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                                </label>
                                                <select
                                                    id="homeAddress.state"
                                                    name="homeAddress.state"
                                                    value={formData.homeAddress.state}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${errors['homeAddress.state'] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                                >
                                                    <option value="">Select State</option>
                                                    <option value="West Bengal">West Bengal</option>
                                                    <option value="Maharashtra">Maharashtra</option>
                                                    <option value="Karnataka">Karnataka</option>
                                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                </select>
                                                {errors['homeAddress.state'] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                                        <FaInfoCircle className="mr-1" /> {errors['homeAddress.state']}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Non-mandatory fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Alternate Phone */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.altPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Alternate Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="homeAddress.altPhone"
                                                    name="homeAddress.altPhone"
                                                    value={formData.homeAddress.altPhone}
                                                    onChange={handleChange}
                                                    placeholder="Alternative contact number"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            {/* Emergency Contact */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Emergency Contact
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.emergencyContact"
                                                    name="homeAddress.emergencyContact"
                                                    value={formData.homeAddress.emergencyContact}
                                                    onChange={handleChange}
                                                    placeholder="Emergency contact person"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Disability */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.disability" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Disability
                                                </label>
                                                <select
                                                    id="homeAddress.disability"
                                                    name="homeAddress.disability"
                                                    value={formData.homeAddress.disability}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="None">None</option>
                                                    <option value="Physical">Physical</option>
                                                    <option value="Visual">Visual</option>
                                                    <option value="Hearing">Hearing</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            {/* Medical Condition */}
                                            <div className="relative">
                                                <label htmlFor="homeAddress.medicalCondition" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Medical Condition
                                                </label>
                                                <input
                                                    type="text"
                                                    id="homeAddress.medicalCondition"
                                                    name="homeAddress.medicalCondition"
                                                    value={formData.homeAddress.medicalCondition}
                                                    onChange={handleChange}
                                                    placeholder="Any medical conditions"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Medical Insurance */}
                                        <div className="relative">
                                            <label htmlFor="homeAddress.medicalInsurance" className="block text-sm font-medium text-gray-700 mb-1">
                                                Medical Insurance
                                            </label>
                                            <select
                                                id="homeAddress.medicalInsurance"
                                                name="homeAddress.medicalInsurance"
                                                value={formData.homeAddress.medicalInsurance}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="no">No</option>
                                                <option value="yes">Yes</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Form Completion Indicator */}
                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
                                <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800">Section A Progress</h4>
                                    <p className="text-xs text-blue-600 mt-1">You've completed about 25% of the entire form. Keep going!</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Section B: Package Details */}
                    {/* {currentSection === 'B' && (
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
                                            <label htmlFor="agentID" className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
                                            <input type="text" id="agentID" name="agentID" value={formData.agentID} onChange={handleChange} placeholder="Enter agent's ID" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )} */}

                    {/* Section B: Package Details */}
                    {currentSection === 'B' && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            {/* Error message for Section B */}
                            {(errors.tourType || errors.selectedTrip || errors.agentID) && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                    Please fill all required Package Details before proceeding.
                                </div>
                            )}

                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <FaSuitcase className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">Section B: Package Details</h2>
                                    <p className="text-gray-500">Information about your selected package and trip</p>
                                </div>
                            </div>

                            {/* Form Progress Indicator */}
                            <div className="mb-8 bg-gray-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tour Type */}
                                    <div className="relative">
                                        <label htmlFor="tourType" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            Tour Type <span className="text-red-500 ml-1">*</span>
                                            {errors.tourType && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="tourType"
                                                name="tourType"
                                                value={formData.tourType}
                                                readOnly
                                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                            />
                                            <FaFileSignature className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                        {errors.tourType && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.tourType}</p>}
                                    </div>

                                    {/* Selected Trip */}
                                    <div className="relative">
                                        <label htmlFor="selectedTrip" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            Selected Trip <span className="text-red-500 ml-1">*</span>
                                            {errors.selectedTrip && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="selectedTrip"
                                                name="selectedTrip"
                                                value={formData.selectedTrip}
                                                readOnly
                                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                            />
                                            <FaPassport className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                        {errors.selectedTrip && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.selectedTrip}</p>}
                                    </div>

                                    {/* Destination */}
                                    <div className="relative">
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                            Destination
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                readOnly
                                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                            />
                                            <FaUsers className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Through Agent */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            Through Agent?
                                            {errors.throughAgent && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="throughAgent"
                                                    value="yes"
                                                    checked={formData.throughAgent === 'yes' || !!agentIDFromURL}
                                                    onChange={handleChange}
                                                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                                    disabled={!!agentIDFromURL}
                                                />
                                                <span className="ml-2 text-gray-700">Yes</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="throughAgent"
                                                    value="no"
                                                    checked={formData.throughAgent === 'no' && !agentIDFromURL}
                                                    onChange={handleChange}
                                                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                                    disabled={!!agentIDFromURL}
                                                />
                                                <span className="ml-2 text-gray-700">No</span>
                                            </label>
                                        </div>
                                        {errors.throughAgent && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.throughAgent}</p>}
                                    </div>
                                </div>

                                {/* Agent ID Field - Conditionally Rendered */}
                                {(formData.throughAgent === 'yes' || !!agentIDFromURL) && (
                                    <div className="mt-6 relative">
                                        <label htmlFor="agentID" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            Agent ID <span className="text-red-500 ml-1">*</span>
                                            {errors.agentID && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="agentID"
                                                name="agentID"
                                                value={formData.agentID}
                                                readOnly={!!agentIDFromURL}
                                                onChange={!agentIDFromURL ? handleChange : undefined}
                                                placeholder="Enter agent's ID"
                                                className={`w-full px-4 py-2 pl-10 border ${errors.agentID ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm ${!!agentIDFromURL ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                                            />
                                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                        {errors.agentID && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <FaInfoCircle className="mr-1" /> {errors.agentID}
                                            </p>
                                        )}
                                        {agentIDFromURL && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                <FaInfoCircle className="mr-1" /> Agent ID is pre-filled from your referral link
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Form Completion Indicator */}
                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
                                <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800">Section B Progress</h4>
                                    <p className="text-xs text-blue-600 mt-1">You've completed about 50% of the entire form. Keep going!</p>
                                </div>
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
                            className="relative"
                        >
                            {/* Error message for Section C */}
                            {(errors.numPersons || errors.passengers) && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                    Please fill all required Passenger Details before proceeding.
                                </div>
                            )}

                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <FaUsers className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">Section C: Passenger Details</h2>
                                    <p className="text-gray-500">Provide information about all passengers (adults and children)</p>
                                </div>
                            </div>

                            {/* Form Progress Indicator */}
                            <div className="mb-8 bg-gray-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="relative">
                                        <label htmlFor="numPersons" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            Number of Adults <span className="text-red-500 ml-1">*</span>
                                            {errors.numPersons && <FaExclamationCircle className="ml-2 text-red-500 text-xs" />}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="numPersons"
                                                name="numPersons"
                                                value={formData.numPersons}
                                                onChange={handleNumPersonsChange}
                                                min="1"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-[35px]"
                                            />
                                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                        {errors.numPersons && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.numPersons}</p>}
                                    </div>

                                    <div className="relative">
                                        <label htmlFor="numChildren" className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Children (below 10 years)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="numChildren"
                                                name="numChildren"
                                                value={formData.numChildren}
                                                onChange={handleNumChildrenChange}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-[35px]"
                                            />
                                            <FaChild className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                        {errors.numChildren && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.numChildren}</p>}
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
                                        {/* Show error if any adult age is less than 18 */}
                                        {errors.passengers && (
                                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                                {errors.passengers}
                                            </div>
                                        )}
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
                                        {/* Show error if any child age is 18 or more */}
                                        {errors.childPassengers && (
                                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                                {errors.childPassengers}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Form Completion Indicator */}
                                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
                                    <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800">Section C Progress</h4>
                                        <p className="text-xs text-blue-600 mt-1">You've completed about 75% of the entire form. Almost there!</p>
                                    </div>
                                </div>
                            </div>

                            {/* Important Note - moved inside the white card */}
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-6 rounded-md" role="alert">
                                <p className="font-bold flex items-center"><FaExclamationTriangle className="mr-2" /> Important Note:</p>
                                <p className="text-sm mt-1">Please attach photocopies of your Aadhar card and Voter ID. For guests below 18 years without a voter ID, please provide a birth certificate. These documents are required for transit permits and bookings in Sikkim. Carry originals and 4 passport-size photos of each guest during travel.</p>
                            </div>
                        </motion.div>
                    )}

                    {currentSection === 'D' && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            {/* Error message for Section D */}
                            {errors.acceptedTerms && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                    Please accept the Terms and Conditions before submitting.
                                </div>
                            )}

                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <FaCheckCircle className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">Section D: Confirmation</h2>
                                    <p className="text-gray-500">Review your information before final submission</p>
                                </div>
                            </div>

                            {/* Form Progress Indicator */}
                            <div className="mb-8 bg-gray-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                                {/* Review Header */}
                                <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                                    <FaClipboardCheck className="text-blue-600 text-xl mr-3 mt-1" />
                                    <div>
                                        <h4 className="text-xl font-bold text-blue-800">Review and Confirm</h4>
                                        <p className="text-gray-600">Please carefully review all your information before submission</p>
                                    </div>
                                </div>

                                {/* Personal Information Section */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h5 className="font-bold text-lg border-b pb-2 flex items-center">
                                            <FaUser className="mr-2 text-blue-500" />
                                            Personal Information
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Info label="Full Name" value={formData.name} icon={<FaUserTie className="text-gray-400" />} />
                                            <Info label="Date of Birth" value={formData.dob} icon={<FaCalendarAlt className="text-gray-400" />} />
                                            <Info label="Gender" value={formData.gender} icon={<FaVenusMars className="text-gray-400" />} />
                                            <Info label="Age" value={formData.age} icon={<FaBirthdayCake className="text-gray-400" />} />
                                            <Info label="Phone" value={formData.phone} icon={<FaPhone className="text-gray-400" />} />
                                            <Info label="Alternate Phone" value={formData.altPhone} icon={<FaPhoneAlt className="text-gray-400" />} />
                                            <Info label="WhatsApp" value={formData.whatsapp} icon={<FaWhatsapp className="text-gray-400" />} />
                                            <Info label="Email" value={formData.email || 'Not provided'} icon={<FaEnvelope className="text-gray-400" />} />
                                            <Info label="Aadhar Number" value={formData.aadhar} icon={<FaIdCard className="text-gray-400" />} />
                                            <Info label="PAN Number" value={formData.pan} icon={<FaCreditCard className="text-gray-400" />} />
                                            <Info label="Disability" value={formData.disability || 'None'} icon={<FaWheelchair className="text-gray-400" />} />
                                            <Info label="Medical Condition" value={formData.medicalCondition || 'None'} icon={<FaHeartbeat className="text-gray-400" />} />
                                            <Info label="Medical Insurance" value={formData.medicalInsurance === 'yes' ? 'Yes' : 'No'} icon={<FaShieldAlt className="text-gray-400" />} />
                                            <Info
                                                label="Home Address"
                                                value={
                                                    formData.homeAddress
                                                        ? [
                                                            formData.homeAddress.flatNo,
                                                            formData.homeAddress.locality,
                                                            formData.homeAddress.city,
                                                            formData.homeAddress.pincode,
                                                            formData.homeAddress.ps,
                                                            formData.homeAddress.state
                                                        ]
                                                            .filter(Boolean)
                                                            .join(', ')
                                                        : 'Not provided'
                                                }
                                                icon={<FaHome className="text-gray-400" />}
                                            />
                                        </div>
                                    </div>

                                    {/* Package Information Section */}
                                    <div className="space-y-4">
                                        <h5 className="font-bold text-lg border-b pb-2 flex items-center">
                                            <FaSuitcase className="mr-2 text-blue-500" />
                                            Package Information
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Info label="Tour Type" value={formData.tourType} icon={<FaMapMarkedAlt className="text-gray-400" />} />
                                            <Info label="Selected Trip" value={formData.selectedTrip} icon={<FaRoute className="text-gray-400" />} />
                                            <Info label="Country" value={formData.country} icon={<FaGlobeAsia className="text-gray-400" />} />
                                            <Info label="Through Agent" value={formData.throughAgent === 'yes' ? 'Yes' : 'No'} icon={<FaUserTie className="text-gray-400" />} />
                                            {formData.throughAgent === 'yes' && (
                                                <Info label="Agent ID" value={formData.agentID} icon={<FaIdBadge className="text-gray-400" />} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Adult Passengers Section */}
                                    <div className="space-y-4">
                                        <h5 className="font-bold text-lg border-b pb-2 flex items-center">
                                            <FaUserFriends className="mr-2 text-blue-500" />
                                            Adult Passengers ({formData.numPersons} Adults)
                                        </h5>
                                        {Number(formData.numPersons) > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                                    <thead>
                                                        <tr className="bg-blue-50">
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaUser className="inline mr-2" /> Name</th>
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaBirthdayCake className="inline mr-2" /> Age</th>
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaVenusMars className="inline mr-2" /> Gender</th>
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaIdCard className="inline mr-2" /> ID Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.passengers.slice(0, Number(formData.numPersons)).map((passenger, index) => (
                                                            <tr key={`confirm-adult-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="border p-3">{passenger.name}</td>
                                                                <td className="border p-3">{passenger.age}</td>
                                                                <td className="border p-3 capitalize">{passenger.gender}</td>
                                                                <td className="border p-3">{passenger.idType}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                                <FaUserSlash className="inline-block text-2xl mb-2" />
                                                <p>No adult passengers entered.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Child Passengers Section */}
                                    <div className="space-y-4">
                                        <h5 className="font-bold text-lg border-b pb-2 flex items-center">
                                            <FaChild className="mr-2 text-blue-500" />
                                            Child Passengers ({formData.numChildren} Children)
                                        </h5>
                                        {Number(formData.numChildren) > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                                    <thead>
                                                        <tr className="bg-blue-50">
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaUser className="inline mr-2" /> Name</th>
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaBirthdayCake className="inline mr-2" /> Age</th>
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaVenusMars className="inline mr-2" /> Gender</th>
                                                            <th className="border p-3 text-left font-medium text-gray-700"><FaIdCard className="inline mr-2" /> ID Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.childPassengers.slice(0, Number(formData.numChildren)).map((child, index) => (
                                                            <tr key={`confirm-child-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="border p-3">{child.name}</td>
                                                                <td className="border p-3">{child.age}</td>
                                                                <td className="border p-3 capitalize">{child.gender}</td>
                                                                <td className="border p-3">{child.idType}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                                <FaBaby className="inline-block text-2xl mb-2" />
                                                <p>No child passengers entered.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-start mb-4">
                                            <input
                                                type="checkbox"
                                                id="acceptTerms"
                                                checked={acceptedTerms}
                                                onChange={(e) => {
                                                    setAcceptedTerms(e.target.checked);
                                                    setErrors(prev => ({ ...prev, acceptedTerms: undefined }));
                                                }}
                                                className="form-checkbox h-5 w-5 text-blue-600 rounded mt-1"
                                            />
                                            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700">
                                                By checking this box, I confirm that I have read, understood, and agree to the instructions provided below.
                                                {errors.acceptedTerms && <p className="text-red-500 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.acceptedTerms}</p>}
                                            </label>
                                        </div>

                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex items-start">
                                            <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-yellow-700">
                                                    I understand that after saving this form, I will be redirected to the terms & conditions page. <br />
                                                    <strong>Important:</strong>  If you are an agent so after saving the form, please go back, copy the URL, and send the KYC link to the customer to verify.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Completion Indicator */}
                                    <div className="mt-6 bg-green-50 border border-green-100 rounded-md p-4 flex items-start">
                                        <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-green-800">Form Completion</h4>
                                            <p className="text-xs text-green-600 mt-1">You've completed 100% of the form. Ready to submit!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => handlePrevSection()}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    Back: Section C
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-3 rounded-lg transition-colors duration-300 flex items-center ${isSubmitting || !acceptedTerms ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    disabled={isSubmitting || !acceptedTerms}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Details
                                            <FaArrowRight className="ml-2" />
                                        </>
                                    )}
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
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm save</h2>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to save this form? You will be redirected to the terms & conditions page after confirmation.
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