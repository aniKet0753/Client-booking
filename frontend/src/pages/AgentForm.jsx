import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FiArrowLeft, FiPlus, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import MainLogo from '../../public/main-logo.png';

const Input = React.memo(({ label, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {error}</p>}
  </div>
));

const Select = React.memo(({ label, options, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...props}
      className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.toLowerCase()}>{opt}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {error}</p>}
  </div>
));

const FileInput = React.memo(({ label, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="file"
      accept='image/*'
      {...props}
      className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {error}</p>}
  </div>
));

function AgentForm() {
  const navigate = useNavigate();
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
      thana: '',
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

  useEffect(() => {
    if (message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timeout = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'aadhar_card':
        if (!/^\d{12}$/.test(value)) error = 'Aadhar must be 12 digits';
        break;
      case 'pan_card':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) error = 'Invalid PAN format';
        break;
      case 'password':
        if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'phone_calling':
      case 'phone_whatsapp':
        if (!value) {
          error = 'Phone number is required';
          console.log(value);
        }else{
          console.log(value);
        }
        break;
      default:
        if (name.includes('permanent_address') && !value.trim()) {
          const field = name.split('.')[1];
          error = `${field.replace('_', ' ')} is required`;
        }
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prev => ({ ...prev, [name]: error }));
    
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
  };

  const handlePhoneChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      setErrors(prev => ({ ...prev, [name]: '' }));
      setFormData(prev => ({ ...prev, [name]: file }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string' && !formData[key].trim() && key !== 'parentAgent') {
        newErrors[key] = 'This field is required';
        isValid = false;
      } else if (key === 'exclusive_zone') {
        formData[key].forEach((zone, i) => {
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
      } else if (typeof formData[key] === 'object' && !(formData[key] instanceof File) && key !== 'photo') {
        Object.keys(formData[key]).forEach(subKey => {
          if (!formData[key][subKey] && key !== 'banking_details') {
            newErrors[`${key}_${subKey}`] = 'This field is required';
            isValid = false;
          }
        });
      }
    });

    // Validate files
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setMessage("You must accept the Terms and Conditions to proceed.");
      return;
    }

    if (!validateForm()) {
      setMessage("Please correct the errors in the form.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-xl space-y-8 mt-[80px] mb-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 text-blue-700 rounded hover:bg-blue-200 font-medium flex items-center"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>
      
      <span className='main_logo block text-center -mt-[70px]'>
        <img src={MainLogo} alt="" className='inline-block bg-white p-4 rounded-full border border-gray-200 shadow-md w-24 h-24' />
      </span>
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Agent Registration Form</h2>
      
      {message && (
        <div className={`p-4 rounded-md ${message.includes("failed") || message.includes("exceed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              error={errors.name}
              required 
            />
            
            <Select 
              label="Gender" 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              options={['Male', 'Female', 'Other']} 
              required 
            />
            
            <Input 
              label="Date of Birth" 
              name="dob" 
              type="date" 
              value={formData.dob} 
              onChange={handleChange} 
              error={errors.dob}
              required 
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone No (Calling) <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="IN"
                value={formData.phone_calling}
                onChange={(value) => handlePhoneChange(value, 'phone_calling')}
                className={`border ${errors.phone_calling ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.phone_calling && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {errors.phone_calling}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp No <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="IN"
                value={formData.phone_whatsapp}
                onChange={(value) => handlePhoneChange(value, 'phone_whatsapp')}
                className={`border ${errors.phone_whatsapp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.phone_whatsapp && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1" /> {errors.phone_whatsapp}</p>}
            </div>
            
            <Input 
              label="Email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              error={errors.email}
              required 
            />
            
            <Input 
              label="Aadhar Card No" 
              name="aadhar_card" 
              value={formData.aadhar_card} 
              onChange={handleChange} 
              error={errors.aadhar_card}
              required 
            />
            
            <FileInput 
              label="Aadhaar Photo (Front Side)" 
              name="aadhaarPhotoFront" 
              onChange={handleFileChange} 
              error={errors.aadhaarPhotoFront}
              required 
            />
            
            <FileInput 
              label="Aadhaar Photo (Back Side)" 
              name="aadhaarPhotoBack" 
              onChange={handleFileChange} 
              error={errors.aadhaarPhotoBack}
              required 
            />
            
            <Input 
              label="PAN Card No" 
              name="pan_card" 
              value={formData.pan_card} 
              onChange={handleChange} 
              error={errors.pan_card}
              required 
            />
            
            <FileInput 
              label="PAN Card Photo" 
              name="panCardPhoto" 
              onChange={handleFileChange} 
              error={errors.panCardPhoto}
              required 
            />
            
            <Input 
              label="Create Password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              error={errors.password}
              required 
            />
            
            <FileInput 
              label="Personal Photo (Passport Size)" 
              name="photo" 
              onChange={handleFileChange} 
              error={errors.photo}
              required 
            />
            
            <Input 
              label="Profession" 
              name="profession" 
              value={formData.profession} 
              onChange={handleChange} 
              error={errors.profession}
              required 
            />
            
            <Input 
              label="Annual Income (INR)" 
              name="income" 
              type="number" 
              value={formData.income} 
              onChange={handleChange} 
              error={errors.income}
              required 
            />
            
            <div className="md:col-span-2">
              <Input 
                label="Office Address" 
                name="office_address" 
                value={formData.office_address} 
                onChange={handleChange} 
                error={errors.office_address}
                required 
              />
            </div>
          </div>
        </section>

        {/* Permanent Address */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Permanent Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['house_no', 'road_no', 'flat_name', 'pincode', 'village', 'district', 'state', 'thana', 'post_office'].map((key) => (
              <Input
                key={key}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                name={`permanent_address.${key}`}
                value={formData.permanent_address[key]}
                onChange={handleChange}
                error={errors[`permanent_address_${key}`]}
                required />
            ))}
          </div>
        </section>

        {/* Prefer Working Zones */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Prefer Working Zones (At least 3)</h3>
          {formData.exclusive_zone.map((zone, i) => (
            <div key={i} className="border border-gray-200 p-4 rounded-lg mb-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Zone {i + 1}</h4>
                {formData.exclusive_zone.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeExclusiveZone(i)}
                    className="text-red-500 hover:text-red-700"
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
                required 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {zone.village_preference.map((village, j) => (
                  <div key={j} className="relative">
                    <Input
                      label={`Village Preference ${j + 1}`}
                      value={village}
                      onChange={(e) => handleVillageChange(i, j, e.target.value)}
                      error={errors[`zone_village_${i}_${j}`]}
                      required
                    />
                    {zone.village_preference.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVillage(i, j)}
                        className="absolute top-8 right-2 text-red-500 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => addVillage(i)}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
              >
                <FiPlus className="mr-1" /> Add Village
              </button>
            </div>
          ))}
          
          {formData.exclusive_zone.length < 5 && (
            <button
              type="button"
              onClick={addExclusiveZone}
              className="mt-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm flex items-center justify-center w-full md:w-auto"
            >
              <FiPlus className="mr-1" /> Add Another Zone
            </button>
          )}
        </section>

        {/* Banking Details */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Banking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['bank_name', 'acc_holder_name', 'acc_number', 'ifsc_code', 'branch_name'].map((field) => (
              <Input
                key={field}
                label={field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                name={`banking_details.${field}`}
                value={formData.banking_details[field]}
                onChange={handleChange}
                error={errors[`banking_details_${field}`]}
                required />
            ))}
            
            <Input
              type="text"
              name="parentAgent"
              value={formData.parentAgent}
              onChange={handleChange}
              label="Referral ID "
              required
            />
          </div>
        </section>

        {/* Terms and Conditions */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
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

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-6 w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-300 flex items-center justify-center"
        >
          <FiCheck className="mr-2" /> Register Now
        </button>
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
  );
}

export default AgentForm;