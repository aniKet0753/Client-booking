import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import {
  FiArrowLeft, FiPlus, FiX, FiCheck, FiAlertCircle,
  FiUser, FiCalendar, FiPhone, FiMail, FiCreditCard,
  FiHome, FiMapPin, FiBriefcase, FiFileText,
  FiLock, FiChevronRight, FiChevronLeft, FiCheckCircle
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import InnerBanner from '../components/InnerBanner';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import MainLogo from '../../public/main-logo.png';
import { isValidPhoneNumber } from 'react-phone-number-input';

const Input = React.memo(({ label, icon, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
        </div>
      )}
      <input
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center">
        <FiAlertCircle className="mr-1" /> {error}
      </p>
    )}
  </div>
));

const Select = React.memo(({ label, icon, options, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
        </div>
      )}
      <select
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.toLowerCase()}>{opt}</option>
        ))}
      </select>
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center">
        <FiAlertCircle className="mr-1" /> {error}
      </p>
    )}
  </div>
));

const FileInput = React.memo(({ label, icon, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center">
        <FiAlertCircle className="mr-1" /> {error}
      </p>
    )}
  </div>
));

function AgentForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    dob: '',
    phone_calling: '',
    phone_whatsapp: '',
    email: '',
    aadhar_card: '',
    aadhaarPhotoFront: null,
    aadhaarPhotoBack: null,
    pan_card: '',
    panCardPhoto: null,
    profession: '',
    income: '',
    office_address: '',
    permanent_address: {
      house_no: '',
      road_no: '',
      flat_name: '',
      pincode: '',
      village: '',
      district: '',
      state: '',
      police_station: '',
      post_office: '',
    },
    exclusive_zone: [
      { pincode: '', village_preference: [''] },
      { pincode: '', village_preference: [''] },
      { pincode: '', village_preference: [''] }
    ],
    banking_details: {
      bank_name: '',
      acc_holder_name: '',
      acc_number: '',
      ifsc_code: '',
      branch_name: '',
    },
    photo: null,
    parentAgent: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timeout = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const validateField = (name, value) => {
    if (!value && !['parentAgent'].includes(name)) {
      return 'This field is required';
    }

    switch (name) {
      case 'name':
        if (!value?.trim()) return 'Name is required';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')) return 'Invalid email format';
        break;
      case 'aadhar_card':
        if (!/^\d{12}$/.test(value || '')) return 'Aadhar must be 12 digits';
        break;
      case 'pan_card':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value || '')) return 'Invalid PAN format';
        break;
      case 'password':
        if ((value || '').length < 6) return 'Password must be at least 6 characters';
        break;
      case 'phone_calling':
      case 'phone_whatsapp':
        if (!isValidPhoneNumber(value || '')) {
          return 'Enter a valid phone number';
        }
        break;
      default:
        if (name.includes('permanent_address')) {
          const field = name.split('.')[1];
          if (!value?.trim()) return `${field.replace('_', ' ')} is required`;
        }
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.includes("permanent_address")) {
        const field = name.split('.')[1];
        return { ...prev, permanent_address: { ...prev.permanent_address, [field]: value } };
      }
      if (name.includes("banking_details")) {
        const field = name.split('.')[1];
        return { ...prev, banking_details: { ...prev.banking_details, [field]: value } };
      }
      return { ...prev, [name]: value };
    });
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePhoneChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    let error = '';
    if (!value) {
      error = 'Phone number is required';
    } else if (!isValidPhoneNumber(value)) {
      error = 'Enter a valid phone number';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleExclusiveZoneChange = (index, field, value) => {
    const updatedZones = [...formData.exclusive_zone];
    updatedZones[index][field] = value;
    setFormData({ ...formData, exclusive_zone: updatedZones });
  };

  const handleVillageChange = (zoneIndex, villageIndex, value) => {
    const updatedZones = [...formData.exclusive_zone];
    updatedZones[zoneIndex].village_preference[villageIndex] = value;
    setFormData({ ...formData, exclusive_zone: updatedZones });
  };

  const addVillage = (zoneIndex) => {
    const updatedZones = [...formData.exclusive_zone];
    updatedZones[zoneIndex].village_preference.push('');
    setFormData({ ...formData, exclusive_zone: updatedZones });
  };

  const removeVillage = (zoneIndex, villageIndex) => {
    const updatedZones = [...formData.exclusive_zone];
    updatedZones[zoneIndex].village_preference.splice(villageIndex, 1);
    setFormData({ ...formData, exclusive_zone: updatedZones });
  };

  const addExclusiveZone = () => {
    if (formData.exclusive_zone.length < 5) {
      setFormData({ ...formData, exclusive_zone: [...formData.exclusive_zone, { pincode: '', village_preference: [''] }] });
    }
  };

  const removeExclusiveZone = (index) => {
    if (formData.exclusive_zone.length > 3) {
      const updatedZones = [...formData.exclusive_zone];
      updatedZones.splice(index, 1);
      setFormData({ ...formData, exclusive_zone: updatedZones });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    // Clear previous error
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [name]: 'Image size should not exceed 2MB' }));
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [name]: 'Only JPEG, JPG or PNG images are allowed' }));
        return;
      }

      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setErrors(prev => ({ ...prev, [name]: 'This field is required' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      // Validate personal details
      ['name', 'gender', 'dob', 'phone_calling', 'phone_whatsapp', 'email', 'aadhar_card', 'pan_card', 'profession', 'income', 'office_address'].forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
          isValid = false;
        } else if (errors[field]) {
          newErrors[field] = errors[field];
          isValid = false;
        }
      });

      if (!formData.photo) {
        newErrors.photo = 'Personal photo is required';
        isValid = false;
      }
      if (!formData.aadhaarPhotoFront) {
        newErrors.aadhaarPhotoFront = 'Aadhaar front photo is required';
        isValid = false;
      }
      if (!formData.aadhaarPhotoBack) {
        newErrors.aadhaarPhotoBack = 'Aadhaar back photo is required';
        isValid = false;
      }
      if (!formData.panCardPhoto) {
        newErrors.panCardPhoto = 'PAN card photo is required';
        isValid = false;
      }
    } else if (step === 2) {
      // Validate address
      Object.keys(formData.permanent_address).forEach(field => {
        if (!formData.permanent_address[field]) {
          newErrors[`permanent_address_${field}`] = 'This field is required';
          isValid = false;
        }
      });
    } else if (step === 3) {
      // Validate working zones
      formData.exclusive_zone.forEach((zone, i) => {
        if (!zone.pincode) {
          newErrors[`zone_pincode_${i}`] = 'Pincode is required';
          isValid = false;
        }
        zone.village_preference.forEach((village, j) => {
          if (!village) {
            newErrors[`zone_village_${i}_${j}`] = 'Village preference is required';
            isValid = false;
          }
        });
      });
    } else if (step === 4) {
      // Validate banking details
      Object.keys(formData.banking_details).forEach(field => {
        if (!formData.banking_details[field]) {
          newErrors[`banking_details_${field}`] = 'This field is required';
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 600, behavior: 'smooth' });
    } else {
      setMessage("Please correct the errors in the form before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setMessage("You must accept the Terms and Conditions to proceed.");
      return;
    }

    if (!validateStep(5)) {
      setMessage("Please correct the errors in the form.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'photo' || key === 'aadhaarPhotoFront' || key === 'aadhaarPhotoBack' || key === 'panCardPhoto') {
        if (formData[key]) data.append(key, formData[key]);
      } else if (typeof formData[key] === 'object') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post("/api/agents/register", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setMessage(`Registration failed: ${error.response?.data?.error || error.message}`);
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Personal Info', icon: FiUser },
    { id: 2, name: 'Address', icon: FiHome },
    { id: 3, name: 'Working Zones', icon: FiMapPin },
    { id: 4, name: 'Bank Details', icon: FaRupeeSign },
    { id: 5, name: 'Review & Submit', icon: FiCheckCircle }
  ];

  return (
    <>
      <InnerBanner
        title="Register your Agent Account"
        backgroundImage={'https://images.unsplash.com/photo-1517817748493-49ec54a32465?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
      />
      <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg mt-[80px] mb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>

        <div className="text-center mb-8">
          <img src={MainLogo} alt="" className="inline-block bg-white p-2 rounded-full border border-gray-200 shadow-md w-16 h-16" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-3">Agent Registration</h2>
          <p className="text-gray-600 mt-1">Complete the form to become our partner agent</p>
        </div>

        {/* Progress Steps */}
        <nav className="flex items-center justify-center mb-8">
          <ol className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
                {currentStep > step.id ? (
                  <div className="flex items-center">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white">
                      <step.icon className="h-5 w-5" />
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-16 h-0.5 bg-blue-600"></div>
                    )}
                  </div>
                ) : currentStep === step.id ? (
                  <div className="flex items-center">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 border-2 border-blue-600">
                      <step.icon className="h-5 w-5" />
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-16 h-0.5 bg-gray-200"></div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <step.icon className="h-5 w-5" />
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-16 h-0.5 bg-gray-200"></div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} flex items-center`}>
            <FiAlertCircle className="mr-2" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiUser className="mr-2 text-blue-600" /> Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={FiUser}
                  required
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={['Male', 'Female', 'Other']}
                  icon={FiUser}
                  required
                />

                <Input
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  error={errors.dob}
                  icon={FiCalendar}
                  required
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone No (Calling) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={formData.phone_calling}
                      onChange={(value) => handlePhoneChange(value, 'phone_calling')}
                      className={`border ${errors.phone_calling ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 h-[40px]`}
                    />
                  </div>
                  {errors.phone_calling && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {errors.phone_calling}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    WhatsApp No <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={formData.phone_whatsapp}
                      onChange={(value) => handlePhoneChange(value, 'phone_whatsapp')}
                      className={`border ${errors.phone_whatsapp ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 h-[40px]`}
                    />
                  </div>
                  {errors.phone_whatsapp && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {errors.phone_whatsapp}</p>}
                </div>

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={FiMail}
                  required
                />

                <Input
                  label="Aadhar Card No"
                  name="aadhar_card"
                  value={formData.aadhar_card}
                  onChange={handleChange}
                  error={errors.aadhar_card}
                  icon={FiCreditCard}
                  required
                />

                <FileInput
                  label="Aadhaar Photo (Front Side)"
                  name="aadhaarPhotoFront"
                  onChange={handleFileChange}
                  error={errors.aadhaarPhotoFront}
                  icon={FiFileText}
                  required
                />

                <FileInput
                  label="Aadhaar Photo (Back Side)"
                  name="aadhaarPhotoBack"
                  onChange={handleFileChange}
                  error={errors.aadhaarPhotoBack}
                  icon={FiFileText}
                  required
                />

                <Input
                  label="PAN Card No"
                  name="pan_card"
                  value={formData.pan_card}
                  onChange={handleChange}
                  error={errors.pan_card}
                  icon={FiCreditCard}
                  required
                />

                <FileInput
                  label="PAN Card Photo"
                  name="panCardPhoto"
                  onChange={handleFileChange}
                  error={errors.panCardPhoto}
                  icon={FiFileText}
                  required
                />

                <Input
                  label="Create Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={FiLock}
                  required
                />

                <FileInput
                  label="Personal Photo (Passport Size)"
                  name="photo"
                  onChange={handleFileChange}
                  error={errors.photo}
                  icon={FiUser}
                  required
                />

                <Input
                  label="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  error={errors.profession}
                  icon={FiBriefcase}
                  required
                />

                <Input
                  label="Annual Income (INR)"
                  name="income"
                  type="number"
                  value={formData.income}
                  onChange={handleChange}
                  error={errors.income}
                  icon={FaRupeeSign}
                  required
                />

                <div className="md:col-span-2">
                  <Input
                    label="Office Address"
                    name="office_address"
                    value={formData.office_address}
                    onChange={handleChange}
                    error={errors.office_address}
                    icon={FiHome}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Permanent Address */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiHome className="mr-2 text-blue-600" /> Permanent Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['house_no', 'road_no', 'flat_name', 'pincode', 'village', 'district', 'police_station', 'post_office'].map((key) => (
                  <Input
                    key={key}
                    label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    name={`permanent_address.${key}`}
                    value={formData.permanent_address[key]}
                    onChange={handleChange}
                    error={errors[`permanent_address_${key}`]}
                    icon={key === 'pincode' ? FiMapPin : FiHome}
                    required
                  />
                ))}

                {/* State as a select dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="permanent_address.state"
                    value={formData.permanent_address.state}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a state</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    {/* Add more states as needed */}
                  </select>
                  {errors.permanent_address_state && (
                    <p className="text-red-500 text-sm mt-1">{errors.permanent_address_state.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Step 3: Working Zones */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiMapPin className="mr-2 text-blue-600" /> Prefer Working Zones (At least 3)
              </h3>

              {formData.exclusive_zone.map((zone, i) => (
                <div key={i} className="border border-gray-200 p-5 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <FiMapPin className="mr-2 text-blue-500" /> Zone {i + 1}
                    </h4>
                    {formData.exclusive_zone.length > 3 && (
                      <button
                        type="button"
                        onClick={() => removeExclusiveZone(i)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>

                  <Input
                    label="Pincode"
                    value={zone.pincode}
                    onChange={(e) => handleExclusiveZoneChange(i, 'pincode', e.target.value)}
                    error={errors[`zone_pincode_${i}`]}
                    icon={FiMapPin}
                    required
                  />

                  <div className="space-y-3 mt-4">
                    <label className="block text-sm font-medium text-gray-600">Village Preferences</label>
                    {zone.village_preference.map((village, j) => (
                      <div key={j} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <Input
                            value={village}
                            onChange={(e) => handleVillageChange(i, j, e.target.value)}
                            error={errors[`zone_village_${i}_${j}`]}
                            icon={FiHome}
                            required
                          />
                        </div>
                        {zone.village_preference.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVillage(i, j)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addVillage(i)}
                      className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm flex items-center"
                    >
                      <FiPlus className="mr-1" /> Add Village
                    </button>
                  </div>
                </div>
              ))}

              {formData.exclusive_zone.length < 5 && (
                <button
                  type="button"
                  onClick={addExclusiveZone}
                  className="w-full md:w-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                  <FiPlus className="mr-2" /> Add Another Zone
                </button>
              )}
            </div>
          )}

          {/* Step 4: Banking Details */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaRupeeSign className="mr-2 text-blue-600" /> Banking Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['bank_name', 'acc_holder_name', 'acc_number', 'ifsc_code', 'branch_name'].map((field) => (
                  <Input
                    key={field}
                    label={field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    name={`banking_details.${field}`}
                    value={formData.banking_details[field]}
                    onChange={handleChange}
                    error={errors[`banking_details_${field}`]}
                    icon={field.includes('bank') ? FiCreditCard : FiUser}
                    required
                  />
                ))}

                <Input
                  type="text"
                  name="parentAgent"
                  value={formData.parentAgent}
                  onChange={handleChange}
                  label="Referral ID (Optional)"
                  icon={FiUser}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review and Submit */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiCheckCircle className="mr-2 text-blue-600" /> Review Your Information
              </h3>

              <div className="space-y-8">
                {/* Personal Details Review */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-500" /> Personal Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{formData.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formData.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone (Calling)</p>
                      <p className="font-medium">{formData.phone_calling}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-medium">{formData.phone_whatsapp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aadhar No</p>
                      <p className="font-medium">{formData.aadhar_card}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PAN No</p>
                      <p className="font-medium">{formData.pan_card}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profession</p>
                      <p className="font-medium">{formData.profession}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Income</p>
                      <p className="font-medium">₹{formData.income}</p>
                    </div>
                  </div>
                </div>

                {/* Address Review */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                    <FiHome className="mr-2 text-blue-500" /> Address Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.permanent_address).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-500">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Working Zones Review */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                    <FiMapPin className="mr-2 text-blue-500" /> Working Zones
                  </h4>
                  <div className="space-y-4">
                    {formData.exclusive_zone.map((zone, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                        <h5 className="font-medium text-gray-700 mb-2">Zone {i + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Pincode</p>
                            <p className="font-medium">{zone.pincode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Village Preferences</p>
                            <ul className="list-disc list-inside font-medium">
                              {zone.village_preference.map((village, j) => (
                                <li key={j}>{village}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banking Details Review */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                    <FaRupeeSign className="mr-2 text-blue-500" /> Banking Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.banking_details).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-500">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="inline-flex items-start space-x-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        required
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Terms and Conditions
                    </button>
                    {' '}and certify that all information provided is accurate.
                    {errors.termsAccepted && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" /> {errors.termsAccepted}
                      </p>
                    )}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center transition-colors"
              >
                <FiChevronLeft className="mr-2" /> Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                Next <FiChevronRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!termsAccepted || isSubmitting}
                className={`px-6 py-2 text-white rounded-lg flex items-center transition-colors ${!termsAccepted || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" /> Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg relative">
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-4 text-center">Terms and Conditions</h2>

              <div className="prose prose-sm max-w-none">
                <h3 className="font-semibold mt-4">1. Eligibility</h3>
                <p>You must be at least 18 years old to register as an agent. By submitting this form, you confirm that all information provided is accurate and complete.</p>

                <h3 className="font-semibold mt-4">2. Document Requirements</h3>
                <ul className="list-disc pl-5">
                  <li>All documents (Aadhaar, PAN, photo) must be clear and legible</li>
                  <li>Documents must be valid and not expired</li>
                  <li>Uploading fraudulent documents will result in permanent rejection</li>
                </ul>

                <h3 className="font-semibold mt-4">3. Data Privacy</h3>
                <p>We collect your personal information for verification and communication purposes. We do not share your data with third parties without your consent, except as required by law.</p>

                <h3 className="font-semibold mt-4">4. Agent Responsibilities</h3>
                <ul className="list-disc pl-5">
                  <li>Maintain confidentiality of client information</li>
                  <li>Provide accurate information to clients</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>

                <h3 className="font-semibold mt-4">5. Commission and Payments</h3>
                <p>Commission rates and payment terms will be provided separately upon approval of your application. Payments will be made to the bank account provided in this form.</p>

                <h3 className="font-semibold mt-4">6. Termination</h3>
                <p>We reserve the right to terminate your agent status if you violate any terms or engage in fraudulent activities.</p>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3"
                >
                  I Accept
                </button>

                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AgentForm;