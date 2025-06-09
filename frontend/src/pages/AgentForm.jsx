import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
// const [loading, setLoading] = useState(false);
import MainLogo from '../../public/main-logo.png';

const Input = React.memo(({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}:</label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
));

const Select = React.memo(({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}:</label>
    <select
      {...props}
      className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.toLowerCase()}>{opt}</option>
      ))}
    </select>
  </div>
));

const FileInput = React.memo(({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}:</label>
    <input
      type="file"
      accept='image/*'
      {...props}
      className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
));

function AgentForm() {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
    parentAgent: '' // for referral ID
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const timeout = setTimeout(() => {
        setMessage('');
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [message]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
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

  const addExclusiveZone = () => {
    setFormData({ ...formData, exclusive_zone: [...formData.exclusive_zone, { pincode: '', village_preference: [''] }] });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setMessage("Image size should not exceed 2MB.");
        return;
      }
      setFormData(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);

    if (!termsAccepted) {
      setMessage("You must accept the Terms and Conditions to proceed.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'photo' || key === 'aadhaarPhotoFront' || key === 'aadhaarPhotoBack' || key === 'panCardPhoto') {
        data.append(key, formData[key]);
      } else if (typeof formData[key] === 'object') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post("/api/agents/register",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      // alert(response.data.message);
      setMessage(response.data.message);

      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      setMessage(`Registration failed: ${error.response?.data?.error || error.message}`);
      console.error('Error:', error);
      // alert('Registration failed');
    }
  };
  return (
    <>
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8 mt-[100px] mb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-1 text-blue-700 rounded hover:bg-blue-200 font-medium"
        >
          &larr; Back
        </button>
        <span className='main_logo block text-center -mt-[90px]'><img src={MainLogo} alt="" className='inline-block bg-white p-4 rounded-full border border-gray-200 shadow-md' /></span>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Registration Form</h2>
        {message && (
          <p
            className={`text-center ${message.includes("failed") || message.includes("exceed") ? "text-red-500" : "text-green-500"}`}
          >
            {message}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
        >

          {/* Personal Details */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
              <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female']} required />
              <Input label="DOB" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
              <Input label="Phone No (Calling)" name="phone_calling" value={formData.phone_calling} onChange={handleChange} required />
              <Input label="WhatsApp No" name="phone_whatsapp" value={formData.phone_whatsapp} onChange={handleChange} required />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
              <div>
                <Input label="Aadhar Card No. " name="aadhar_card" value={formData.aadhar_card} onChange={handleChange} required />
                <FileInput label="Adhaar Photo(Front Side)" name="aadhaarPhotoFront" onChange={handleFileChange} required />
                <FileInput label="Adhaar Photo(Back Side)" name="aadhaarPhotoBack" onChange={handleFileChange} required />
              </div>
              <div>
                <Input label="Pan Card No. " name="pan_card" value={formData.pan_card} onChange={handleChange} required />
                <FileInput label="Pan Card Photo" name="panCardPhoto" onChange={handleFileChange} required />
              </div>
              <Input label="Create a Password" name="password" value={formData.password} onChange={handleChange} type="password" required />
              <FileInput label="Photo" name="photo" onChange={handleFileChange} required />
              <Input label="Profession" name="profession" value={formData.profession} onChange={handleChange} required />
              <Input label="Income" name="income" value={formData.income} onChange={handleChange} type="number" required />
              <Input label="Office Address" name="office_address" value={formData.office_address} onChange={handleChange} required />
            </div>
          </section>

          {/* Permanent Address */}
          <section className='mt-6'>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Permanent Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['house_no', 'road_no', 'flat_name', 'pincode', 'village', 'district', 'thana', 'post_office'].map((key) => (
                <Input
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  name={`permanent_address.${key}`}
                  value={formData.permanent_address[key]}
                  onChange={handleChange}
                  required />
              ))}
            </div>
          </section>

          {/* Exclusive Zones */}
          <section className='mt-6'>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Exclusive Agency Zones (At least 3)</h3>
            {formData.exclusive_zone.map((zone, i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-lg mb-4">
                <Input label="Pincode" value={zone.pincode} onChange={(e) => handleExclusiveZoneChange(i, 'pincode', e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {zone.village_preference.map((village, j) => (
                    <Input
                      key={j}
                      label={`Village Preference ${j + 1}`}
                      value={village}
                      onChange={(e) => handleVillageChange(i, j, e.target.value)}
                      required />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addVillage(i)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  + Add Village
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExclusiveZone}
              className="mt-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
            >
              + Add Another Exclusive Zone
            </button>
          </section>

          {/* Banking Details */}
          <section className='mt-6'>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['bank_name', 'acc_holder_name', 'acc_number', 'ifsc_code', 'branch_name'].map((field) => (
                <Input
                  key={field}
                  label={field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  name={`banking_details.${field}`}
                  value={formData.banking_details[field]}
                  onChange={handleChange}
                  required />
              ))}
              <Input
                type="text"
                name="parentAgent"
                value={formData.parentAgent}
                onChange={handleChange}
                label="Enter Referral ID"
                className="input"
                required
              />

            </div>
          </section>

          <div className="mt-6">
            <label className="inline-flex items-start space-x-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
                required
              />
              <span className="text-sm text-gray-700">
                I agree to the
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 underline ml-1"
                >
                  Terms and Conditions
                </button>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-300"
          >
            Register
          </button>
        </form>

        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-11/12 max-w-lg shadow-lg relative">
              <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
              <div className="text-sm text-gray-700 max-h-64 overflow-y-auto space-y-2">
                <p>1. You must provide accurate and complete information.</p>
                <p>2. Your data may be used for verification and communication purposes.</p>
                <p>3. Uploading fraudulent documents will result in permanent rejection.</p>
                <p>4. We respect your privacy and do not share your data without your consent.</p>
                <p>5. By submitting this form, you agree to comply with our Terms and Conditions.</p>
                {/* Add more if needed */}
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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