import React, { useState, useEffect } from 'react';
import ReactSwitch from 'react-switch';
import axios from '../api';
import { MessageSquare, Printer } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import for loading spinner
import { ClipLoader } from 'react-spinners';

// --- Loading Spinner Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <ClipLoader
      color="#4F46E5" // Indigo-600 color
      loading={true}
      size={50}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  </div>
);

// --- Main AgentRequests Component ---
const AgentRequests = () => {
  // --- State Variables ---
  const [currentRemarks, setCurrentRemarks] = useState('');
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarksAgentId, setRemarksAgentId] = useState(null);

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [parentAgentprofile, setParentAgentProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const token = localStorage.getItem('Token');

  // --- Effect Hook for Fetching All Agents ---
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/all-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.agents || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        toast.error('Failed to fetch agents list.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [token]);

  // --- Function to Show Individual User Data in Modal ---
  const showUserData = async (id) => {
    setModalLoading(true);
    setIsModalOpen(true);
    try {
      const response = await axios.get(`/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);

      // Fetch parent agent only if exists
      if (response.data.parentAgent) {
        const parentRes = await axios.get(`/api/admin/${response.data.parentAgent}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParentAgentProfile(parentRes.data);
      } else {
        setParentAgentProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user or parent data:', error);
      toast.error('Failed to load agent details.');
      setIsModalOpen(false);
      setProfile(null);
      setParentAgentProfile(null);
    } finally {
      setModalLoading(false);
    }
  };

  // --- Function to Toggle Agent Status (Active/Inactive) ---
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.info(`Updating status to ${newStatus}...`);
    try {
      await axios.post(
        '/api/admin/update-status',
        JSON.stringify({ userId: id, status: newStatus }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, status: newStatus } : user
        )
      );
      toast.success(`Status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status!');
    }
  };

  // --- Functions for Remarks Modal ---
  const openRemarksModal = (agentId, existingRemarks = '') => {
    setRemarksAgentId(agentId);
    setCurrentRemarks(existingRemarks);
    setRemarksModalOpen(true);
  };

  const saveRemarks = async () => {
    try {
      await axios.post(
        `/api/admin/agent/${remarksAgentId}/remarks`,
        JSON.stringify({ remarks: currentRemarks }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === remarksAgentId ? { ...user, remarks: currentRemarks } : user
        )
      );

      toast.success('Remarks saved successfully!');
      setRemarksModalOpen(false);
      setRemarksAgentId(null);
      setCurrentRemarks('');
    } catch (error) {
      console.error('Failed to save remarks:', error);
      toast.error('Failed to save remarks!');
    }
  };

  // --- Helper Function for Readable Date Format ---
  function getReadableDate(dateString) {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const seconds = date.getSeconds().toString().padStart(2, '0');

      const customFormat = `${day}-${month}-${year}, ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

      return {
        defaultLocale: date.toLocaleString(),
        longDate: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        utcString: date.toUTCString(),
        customFormat: customFormat,
      };
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  // --- Print to CSV Function ---
  const handlePrintToCSV = () => {
    console.log(profile);
    if (!profile) {
      toast.error('No agent data to print.');
      return;
    }

    const headers = ['Field', 'Value'];
    let csvRows = [headers.join(',')];

    const addRow = (field, value) => {
      const stringValue = String(value).replace(/"/g, '""');
      csvRows.push(`"${field}","${stringValue}"`);
    };

    // Core Agent Details
    addRow('Database ID (_id)', profile._id || ''); // Added _id
    addRow('Agent ID', profile.agentID || '');
    addRow('Name', profile.name || '');
    addRow('Gender', profile.gender || '');
    addRow('Date of Birth', profile.dob ? new Date(profile.dob).toLocaleDateString() : '');
    console.log( profile.age || '');
    addRow('Age', profile.age || '');
    addRow('Phone (Calling)', profile.phone_calling || '');
    addRow('Phone (WhatsApp)', profile.phone_whatsapp || '');
    addRow('Email', profile.email || '');
    addRow('Profession', profile.profession || '');
    addRow('Income', profile.income || '');
    addRow('Wallet ID', profile.walletID || '');
    addRow('Wallet Balance', profile.walletBalance || 0);
    addRow('Status', profile.status || '');
    addRow('Remarks', profile.remarks || '');
    addRow('Office Address', profile.office_address || ''); // Added Office Address
    addRow('Created At', getReadableDate(profile.createdAt)?.customFormat || '');
    addRow('Last Updated At', getReadableDate(profile.updatedAt)?.customFormat || ''); // Added Updated At

    // Parent Agent Details
    if (parentAgentprofile) {
      addRow('--- Parent Agent Details ---', '');
      addRow('Parent Agent ID', parentAgentprofile.agentID || '');
      addRow('Parent Name', parentAgentprofile.name || '');
      addRow('Parent Phone', parentAgentprofile.phone_calling || '');
      addRow('Parent Email', parentAgentprofile.email || '');
    }

    // Permanent Address
    addRow('--- Permanent Address ---', '');
    addRow('House No', profile.permanent_address?.house_no || '');
    addRow('Road No', profile.permanent_address?.road_no || '');
    addRow('Flat Name', profile.permanent_address?.flat_name || '');
    addRow('Pincode (Permanent)', profile.permanent_address?.pincode || '');
    addRow('Village (Permanent)', profile.permanent_address?.village || '');
    addRow('District (Permanent)', profile.permanent_address?.district || '');
    addRow('State (Permanent)', profile.permanent_address?.state || '');
    addRow('Thana (Permanent)', profile.permanent_address?.thana || '');
    addRow('Post Office (Permanent)', profile.permanent_address?.post_office || '');

    // Exclusive Zones
    if (profile.exclusive_zone && profile.exclusive_zone.length > 0) {
      addRow('--- Exclusive Zones ---', '');
      profile.exclusive_zone.forEach((zone, index) => {
        addRow(`Zone ${index + 1} Pincode`, zone.pincode || '');
        addRow(`Zone ${index + 1} Village Preference`, zone.village_preference?.join('; ') || '');
      });
    }

    // Banking Details
    addRow('--- Banking Details ---', '');
    addRow('Bank Name', profile.banking_details?.bank_name || '');
    addRow('Account Holder Name', profile.banking_details?.acc_holder_name || '');
    addRow('Account Number', profile.banking_details?.acc_number || '');
    addRow('IFSC Code', profile.banking_details?.ifsc_code || '');
    addRow('Branch Name', profile.banking_details?.branch_name || '');

    // Documents (IDs & URLs)
    addRow('--- Document Details ---', '');
    addRow('Aadhaar Card Number', profile.aadhar_card || ''); // Added Aadhaar Card Number
    addRow('PAN Card Number', profile.pan_card || '');       // Added PAN Card Number

    // Note: The following photo URLs seem to be missing from your profile object based on your console.log.
    // Ensure your API returns these fields if you want them exported.
    addRow('Aadhaar Front Photo URL', profile.aadhaarPhotoFront || '');
    addRow('Aadhaar Back Photo URL', profile.aadhaarPhotoBack || '');
    addRow('PAN Card Photo URL', profile.panCardPhoto || '');
    addRow('Agent Photo URL', profile.photo || '');


    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${profile.name}_Agent_Details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
    toast.success('Agent data exported to CSV!');
  };

  return (
    <main className="p-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agent Requests</h2>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-[rgb(30,58,138)] p-4 text-white font-semibold text-lg flex items-center">
          <i className="fas fa-list mr-2"></i> Request List
        </div>
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder={
              filterBy === 'location'
                ? `Search by ${filterBy}: village, district, state`
                : `Search by ${filterBy}`
            }
            className="border rounded-md p-2 w-full md:w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border rounded-md p-2 w-full md:w-1/4"
          >
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No agents found.</p>
            ) : (
              users
                .filter((user) => {
                  if (!searchTerm) return true;
                  const searchValue = searchTerm.toLowerCase();

                  if (filterBy === 'name') {
                    return user.name?.toLowerCase().includes(searchValue);
                  } else if (filterBy === 'location') {
                    return (
                      user.permanent_address?.village?.toLowerCase().includes(searchValue) ||
                      user.permanent_address?.district?.toLowerCase().includes(searchValue) ||
                      user.permanent_address?.state?.toLowerCase().includes(searchValue)
                    );
                  } else if (filterBy === 'phone') {
                    return (
                      user.phone_calling?.includes(searchValue) ||
                      user.phone_whatsapp?.includes(searchValue)
                    );
                  }
                  return true;
                })
                .map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <i className="fas fa-user text-indigo-700 text-xl"></i>
                      <div>
                        <p className="text-gray-800 font-semibold">{user.name}</p>
                        <p className="text-gray-500 text-sm">
                          Requested: {getReadableDate(user.createdAt)?.customFormat || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <ReactSwitch
                        checked={user.status === 'active'}
                        onChange={() => toggleStatus(user._id, user.status)}
                        offColor="#888"
                        onColor="#4CAF50"
                        offHandleColor="#fff"
                        onHandleColor="#fff"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={50}
                      />
                      <span className="ml-2 text-sm text-gray-600 capitalize">
                        {user.status}
                      </span>
                      <button
                        onClick={() => showUserData(user._id)}
                        type="button"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105 duration-300 cursor-pointer"
                      >
                        View
                      </button>
                      <MessageSquare
                        className="text-gray-500 hover:text-indigo-600 cursor-pointer"
                        onClick={() => openRemarksModal(user._id, user.remarks || '')}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative m-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setProfile(null);
                setParentAgentProfile(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold mb-4 text-indigo-700 text-center">
              Agent Full Details
            </h3>

            {modalLoading ? (
              <LoadingSpinner />
            ) : profile ? (
              <>
                {/* Print Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handlePrintToCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center gap-2"
                  >
                    <Printer size={18} /> Print to CSV
                  </button>
                </div>

                {/* Profile Section */}
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={profile.photo || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mb-4 object-cover"
                  />
                  <div className="text-center">
                    <p>
                      <strong>Agent ID:</strong> {profile.agentID || 'N/A'}
                    </p>
                    <p>
                      <strong>Name:</strong> {profile.name || 'N/A'}
                    </p>
                    <p>
                      <strong>Gender:</strong> {profile.gender || 'N/A'}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong>{' '}
                      {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                    </p>
                    <p>
                      <strong>Age:</strong> {profile.age || 'N/A'}
                    </p>
                    <p>
                      <strong>Phone (Calling):</strong> {profile.phone_calling || 'N/A'}
                    </p>
                    <p>
                      <strong>Phone (WhatsApp):</strong> {profile.phone_whatsapp || 'N/A'}
                    </p>
                    <p>
                      <strong>Email:</strong> {profile.email || 'N/A'}
                    </p>
                    <p>
                      <strong>Profession:</strong> {profile.profession || 'N/A'}
                    </p>
                    <p>
                      <strong>Income:</strong> {profile.income || 'N/A'}
                    </p>
                    <p>
                      <strong>Wallet ID:</strong> {profile.walletID || 'N/A'}
                    </p>
                    <p>
                      <strong>Wallet Balance:</strong> {profile.walletBalance || 'N/A'}
                    </p>
                    <p>
                      <strong>Status:</strong> {profile.status || 'N/A'}
                    </p>
                    <p>
                      <strong>Remarks:</strong> {profile.remarks || 'N/A'}
                    </p>
                    <p>
                      <strong>Created At:</strong>{' '}
                      {getReadableDate(profile.createdAt)?.customFormat || 'N/A'}
                    </p>
                    <p>
                      <strong>Referral (Parent Agent ID):</strong>{' '}
                      {parentAgentprofile?.agentID || 'N/A'}
                    </p>
                    {parentAgentprofile && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-100 p-3 rounded-md">
                        <p>
                          <strong>Parent Name:</strong> {parentAgentprofile?.name || 'N/A'}
                        </p>
                        <p>
                          <strong>Parent Phone:</strong> {parentAgentprofile?.phone_calling || 'N/A'}
                        </p>
                        <p>
                          <strong>Parent Email:</strong> {parentAgentprofile?.email || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="my-4" />

                {/* Address Section */}
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Permanent Address
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <p>
                    <strong>House No:</strong> {profile.permanent_address?.house_no || 'N/A'}
                  </p>
                  <p>
                    <strong>Road No:</strong> {profile.permanent_address?.road_no || 'N/A'}
                  </p>
                  <p>
                    <strong>Flat Name:</strong> {profile.permanent_address?.flat_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {profile.permanent_address?.pincode || 'N/A'}
                  </p>
                  <p>
                    <strong>Village:</strong> {profile.permanent_address?.village || 'N/A'}
                  </p>
                  <p>
                    <strong>District:</strong> {profile.permanent_address?.district || 'N/A'}
                  </p>
                  <p>
                    <strong>State:</strong> {profile.permanent_address?.state || 'N/A'}
                  </p>
                  <p>
                    <strong>Thana:</strong> {profile.permanent_address?.thana || 'N/A'}
                  </p>
                  <p>
                    <strong>Post Office:</strong> {profile.permanent_address?.post_office || 'N/A'}
                  </p>
                </div>

                <hr className="my-4" />

                {/* Exclusive Zones */}
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Exclusive Zones
                </h4>
                <div className="space-y-3 mb-4">
                  {profile.exclusive_zone && profile.exclusive_zone.length > 0 ? (
                    profile.exclusive_zone.map((zone, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded">
                        <p>
                          <strong>Pincode:</strong> {zone.pincode || 'N/A'}
                        </p>
                        <p>
                          <strong>Village Preference:</strong>{' '}
                          {zone.village_preference?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No exclusive zones defined.</p>
                  )}
                </div>

                <hr className="my-4" />

                {/* Banking Details */}
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Banking Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <p>
                    <strong>Bank Name:</strong> {profile.banking_details?.bank_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Account Holder:</strong>{' '}
                    {profile.banking_details?.acc_holder_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{' '}
                    {profile.banking_details?.acc_number || 'N/A'}
                  </p>
                  <p>
                    <strong>IFSC Code:</strong> {profile.banking_details?.ifsc_code || 'N/A'}
                  </p>
                  <p>
                    <strong>Branch Name:</strong> {profile.banking_details?.branch_name || 'N/A'}
                  </p>
                </div>

                <hr className="my-4" />

                {/* Documents */}
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Documents</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold">Aadhaar Front</p>
                    <img
                      src={profile.aadhaarPhotoFront || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'}
                      alt="Aadhaar Front"
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Aadhaar Back</p>
                    <img
                      src={profile.aadhaarPhotoBack || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'}
                      alt="Aadhaar Back"
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">PAN Card</p>
                    <img
                      src={profile.panCardPhoto || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'}
                      alt="PAN Card"
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">No agent details available.</p>
            )}
          </div>
        </div>
      )}

      {remarksModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setRemarksModalOpen(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700">Agent Remarks</h3>
            <textarea
              value={currentRemarks}
              onChange={(e) => setCurrentRemarks(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md p-2 resize-none"
              placeholder="Write your remarks here..."
            />
            <div className="flex justify-end mt-4 space-x-8">
              <button
                onClick={() => {
                  setRemarksModalOpen(false);
                  setRemarksAgentId(null);
                  setCurrentRemarks('');
                }}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={saveRemarks}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AgentRequests;