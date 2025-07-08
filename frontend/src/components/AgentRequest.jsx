import React, { useState, useEffect } from 'react';
import ReactSwitch from 'react-switch'; // This might be removed or adapted
import axios from '../api';
import { MessageSquare, Printer, Search, Filter, User, Info, Home, Banknote, FileText, X, Save, Eye, CheckCircle, XCircle } from "lucide-react"; // Added CheckCircle, XCircle
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import for loading spinner
import { ClipLoader } from 'react-spinners';

// --- Loading Spinner Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <ClipLoader
      color="#4F46E5"
      loading={true}
      size={50}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
    <span className="ml-3 text-indigo-600">Loading...</span>
  </div>
);

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

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
  const [activeTab, setActiveTab] = useState('profile');

  const token = localStorage.getItem('Token');

  // --- Effect Hook for Fetching Only Pending Agents ---
  useEffect(() => {
    const fetchPendingAgents = async () => {
      setLoading(true);
      try {
        // Assuming your backend supports filtering by status,
        // or we filter after fetching all if not.
        // For this example, we'll fetch all and filter client-side.
        // Ideally, you'd have an endpoint like '/api/admin/agents?status=pending'
        const res = await axios.get('/api/admin/all-agents', { // Consider changing this endpoint if your API supports status filtering
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter agents to only show those with 'pending' status
        setUsers(res.data.agents.filter(agent => agent.status === 'pending') || []);
      } catch (error) {
        console.error('Failed to fetch pending agents:', error);
        toast.error('Failed to fetch pending agents list.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAgents();
  }, [token]);

  // --- Function to Show Individual User Data in Modal ---
  const showUserData = async (id) => {
    setModalLoading(true);
    setIsModalOpen(true);
    setActiveTab('profile');
    try {
      const response = await axios.get(`/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);

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

  // --- Function to Update Agent Status (Approve/Reject) ---
  const updateAgentStatus = async (id, newStatus) => {
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

      // Remove the agent from the list if their status is no longer 'pending'
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));

      // If the modal is open for this agent, close it as they're no longer 'pending'
      if (profile && profile._id === id) {
        setIsModalOpen(false);
        setProfile(null);
        setParentAgentProfile(null);
      }

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

      // Update remarks for the user still in the pending list (if any)
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === remarksAgentId ? { ...user, remarks: currentRemarks } : user
        )
      );

      // Update profile in modal if open
      if (profile && profile._id === remarksAgentId) {
        setProfile((prevProfile) => ({ ...prevProfile, remarks: currentRemarks }));
      }

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
    addRow('Referral ID', profile._id || '');
    addRow('Agent ID', profile.agentID || '');
    addRow('Name', profile.name || '');
    addRow('Gender', profile.gender || '');
    addRow('Date of Birth', profile.dob ? new Date(profile.dob).toLocaleDateString() : '');
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
    addRow('Office Address', profile.office_address || '');
    // addRow('Created At', getReadableDate(profile.createdAt)?.customFormat || '');
    // addRow('Last Updated At', getReadableDate(profile.updatedAt)?.customFormat || '');

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

    // Documents
    addRow('--- Document Details ---', '');
    addRow('Aadhaar Card Number', profile.aadhar_card || '');
    addRow('PAN Card Number', profile.pan_card || '');
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
    URL.revokeObjectURL(url);
    toast.success('Agent data exported to CSV!');
  };

  // --- Tab Content Components ---
  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.photo || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-indigo-100"
        />
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">{profile.name || 'N/A'}</h3>
          <p className="text-indigo-600 font-medium">{profile.agentID || 'N/A'}</p>
          <div className="mt-2">
            <StatusBadge status={profile.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <User className="mr-2" size={18} /> Personal Information
          </h4>
          <div className="space-y-2">
            <p><span className="font-medium">Gender:</span> {profile.gender || 'N/A'}</p>
            <p><span className="font-medium">Date of Birth:</span> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</p>
            <p><span className="font-medium">Age:</span> {profile.age || 'N/A'}</p>
            <p><span className="font-medium">Phone (Calling):</span> {profile.phone_calling || 'N/A'}</p>
            <p><span className="font-medium">Phone (WhatsApp):</span> {profile.phone_whatsapp || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {profile.email || 'N/A'}</p>
            <p><span className="font-medium">Profession:</span> {profile.profession || 'N/A'}</p>
            <p><span className="font-medium">Income:</span> {profile.income || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Info className="mr-2" size={18} /> Account Details
          </h4>
          <div className="space-y-2">
            {/* <p><span className="font-medium">Wallet ID:</span> {profile.walletID || 'N/A'}</p> */}
            <p><span className="font-medium">Wallet Balance:</span> {profile.walletBalance || 'N/A'}</p>
            <p><span className="font-medium">Created At:</span> {getReadableDate(profile.createdAt)?.customFormat || 'N/A'}</p>
            <p><span className="font-medium">Remarks:</span> {profile.remarks || 'N/A'}</p>
            <p><span className="font-medium">Parent Agent ID:</span> {parentAgentprofile?.agentID || 'N/A'}</p>
            {parentAgentprofile && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-md">
                <h5 className="font-medium text-indigo-700">Parent Agent Details</h5>
                <p><span className="font-medium">Name:</span> {parentAgentprofile?.name || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {parentAgentprofile?.phone_calling || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {parentAgentprofile?.email || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const AddressTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <Home className="mr-2" size={18} /> Permanent Address
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><span className="font-medium">House No:</span> {profile.permanent_address?.house_no || 'N/A'}</p>
          <p><span className="font-medium">Road No:</span> {profile.permanent_address?.road_no || 'N/A'}</p>
          <p><span className="font-medium">Flat Name:</span> {profile.permanent_address?.flat_name || 'N/A'}</p>
          <p><span className="font-medium">Pincode:</span> {profile.permanent_address?.pincode || 'N/A'}</p>
          <p><span className="font-medium">Village:</span> {profile.permanent_address?.village || 'N/A'}</p>
          <p><span className="font-medium">District:</span> {profile.permanent_address?.district || 'N/A'}</p>
          <p><span className="font-medium">State:</span> {profile.permanent_address?.state || 'N/A'}</p>
          <p><span className="font-medium">Thana:</span> {profile.permanent_address?.thana || 'N/A'}</p>
          <p><span className="font-medium">Post Office:</span> {profile.permanent_address?.post_office || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <Home className="mr-2" size={18} /> Office Address
        </h4>
        <p>{profile.office_address || 'N/A'}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <Home className="mr-2" size={18} /> Exclusive Zones
        </h4>
        {profile.exclusive_zone && profile.exclusive_zone.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.exclusive_zone.map((zone, index) => (
              <div key={index} className="p-3 bg-white rounded shadow-sm">
                <p className="font-medium">Zone {index + 1}</p>
                <p><span className="font-medium">Pincode:</span> {zone.pincode || 'N/A'}</p>
                <p><span className="font-medium">Village Preference:</span> {zone.village_preference?.join(', ') || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No exclusive zones defined.</p>
        )}
      </div>
    </div>
  );

  const BankingTab = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
        <Banknote className="mr-2" size={18} /> Banking Details
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p><span className="font-medium">Bank Name:</span> {profile.banking_details?.bank_name || 'N/A'}</p>
        <p><span className="font-medium">Account Holder:</span> {profile.banking_details?.acc_holder_name || 'N/A'}</p>
        <p><span className="font-medium">Account Number:</span> {profile.banking_details?.acc_number || 'N/A'}</p>
        <p><span className="font-medium">IFSC Code:</span> {profile.banking_details?.ifsc_code || 'N/A'}</p>
        <p><span className="font-medium">Branch Name:</span> {profile.banking_details?.branch_name || 'N/A'}</p>
      </div>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FileText className="mr-2" size={18} /> Document Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <p><span className="font-medium">Aadhaar Card Number:</span> {profile.aadhar_card || 'N/A'}</p>
          <p><span className="font-medium">PAN Card Number:</span> {profile.pan_card || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FileText className="mr-2" size={18} /> Document Images
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Profile Photo</p>
            <img
              src={profile.photo || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image'}
              alt="Profile"
              className="w-full h-40 object-contain rounded border border-gray-200"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Aadhaar Front</p>
            <img
              src={profile.aadhaarPhotoFront || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image'}
              alt="Aadhaar Front"
              className="w-full h-40 object-contain rounded border border-gray-200"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Aadhaar Back</p>
            <img
              src={profile.aadhaarPhotoBack || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image'}
              alt="Aadhaar Back"
              className="w-full h-40 object-contain rounded border border-gray-200"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-2">PAN Card</p>
            <img
              src={profile.panCardPhoto || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image'}
              alt="PAN Card"
              className="w-full h-40 object-contain rounded border border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="p-4 md:p-6 flex-1">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Pending Agent Requests</h2>
        <div className="flex items-center text-sm text-gray-600">
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full mr-2">
            {users.length} pending requests {/* Updated text */}
          </span>
          {/* Removed approved and rejected counts from here as only pending are displayed */}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-indigo-800 p-4 text-white font-semibold text-lg flex items-center">
          <User className="mr-2" size={20} /> Agents Awaiting Review
        </div>

        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder={
                filterBy === 'location'
                  ? `Search by ${filterBy}: village, district, state`
                  : `Search by ${filterBy}`
              }
              className="border rounded-md pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="text-gray-400" size={18} />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="border rounded-md pl-10 pr-8 py-2 w-full appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="name">Name</option>
              <option value="location">Location</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <User size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500">No pending agent requests found.</p>
                <p className="text-sm text-gray-400">All agents have been reviewed or there are no new requests.</p>
              </div>
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
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => showUserData(user._id)}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="relative">
                        <img
                          src={user.photo || 'https://via.placeholder.com/40'}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          {/* Only show badge if status is pending, though all should be pending here */}
                          <StatusBadge status={user.status} />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold">{user.name}</p>
                        <p className="text-gray-500 text-sm">
                          {user.phone_calling} • {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-normal">
                      <div className="text-right sm:text-left">
                        <p className="text-sm text-gray-600">
                          {user.permanent_address?.district || 'Location not set'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined: {getReadableDate(user.createdAt)?.customFormat || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            showUserData(user._id);
                          }}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <MessageSquare
                          className="text-gray-500 hover:text-indigo-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRemarksModal(user._id, user.remarks || '');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Agent Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-xl">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setProfile(null);
                setParentAgentProfile(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>

            {modalLoading ? (
              <LoadingSpinner />
            ) : profile ? (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-2xl font-bold text-indigo-700">
                      Agent Details: {profile.name}
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium capitalize">
                        Status: <StatusBadge status={profile.status} />
                      </span>
                      {/* Action buttons for status change */}
                      {/* These buttons only appear if the current agent is 'pending' */}
                      {profile.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAgentStatus(profile._id, 'approved')}
                            className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => updateAgentStatus(profile._id, 'rejected')}
                            className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handlePrintToCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center gap-2"
                  >
                    <Printer size={18} /> Export to CSV
                  </button>
                </div>
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <User className="inline mr-2" size={16} />
                      Profile
                    </button>
                    <button
                      onClick={() => setActiveTab('address')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'address' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <Home className="inline mr-2" size={16} />
                      Address
                    </button>
                    <button
                      onClick={() => setActiveTab('banking')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'banking' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <Banknote className="inline mr-2" size={16} />
                      Banking
                    </button>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <FileText className="inline mr-2" size={16} />
                      Documents
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'profile' && <ProfileTab />}
                  {activeTab === 'address' && <AddressTab />}
                  {activeTab === 'banking' && <BankingTab />}
                  {activeTab === 'documents' && <DocumentsTab />}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <User size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500">No agent details available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remarks Modal */}
      {remarksModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              onClick={() => setRemarksModalOpen(false)}
            >
              <X size={24} />
            </button>

            <div className="flex items-center mb-4">
              <MessageSquare className="text-indigo-600 mr-2" size={20} />
              <h3 className="text-xl font-bold text-gray-800">Agent Remarks</h3>
            </div>

            <textarea
              value={currentRemarks}
              onChange={(e) => setCurrentRemarks(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write your remarks here..."
            />

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setRemarksModalOpen(false);
                  setRemarksAgentId(null);
                  setCurrentRemarks('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveRemarks}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition"
              >
                <Save className="mr-2" size={16} />
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AgentRequests;