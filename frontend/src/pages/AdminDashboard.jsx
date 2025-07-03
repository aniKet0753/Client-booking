import React, { useState } from 'react';
import axios from '../api';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userFound, setUserFound] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]); 
  const [selectedUserId, setSelectedUserId] = useState(null);
  const token = localStorage.getItem('Token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleSearch = async () => {
    try {
      const res = await axios.post('/api/admin/find-user', 
        JSON.stringify({ identifier }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );      
    
      if (res.data.success) {
        setUserFound(true);
        setMessage('User found. You can update the password.');
      } else {
        setMessage('User not found.');
        setUserFound(false);
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const res = await axios.post('/api/admin/update-password', 
        JSON.stringify({ identifier, newPassword }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (res.data.success) {
        setMessage('Password updated successfully!');
        setNewPassword('');
      } else {
        setMessage('Failed to update password.');
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/api/admin/all-agents', 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
    
      if (res.data.agents) {
        setUsers(res.data.agents);
      } else {
        setMessage('No users found.');
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Something went wrong while fetching all users'));
    }
  };
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await axios.post('/api/admin/update-status',
        JSON.stringify({ userId, status: currentStatus === 'active' ? 'inactive' : 'active' }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (res.data.success) {
        setMessage(`Status updated to ${currentStatus === 'active' ? 'inactive' : 'active'}`);
        fetchAllUsers();
      } else {
        setMessage('Failed to update status.');
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to toggle status.'));
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-4">

      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-bold">Admin Dashboard</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email or Phone:</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
        <button onClick={handleSearch} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md">
          Search User
        </button>
      </div>

      {userFound && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mt-4">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handlePasswordUpdate}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Update Password
          </button>
        </div>
      )}

      {message && (
        <div className="text-sm text-blue-700 font-medium mt-4">{message}</div>
      )}

      <h1 className="mt-6 text-lg font-semibold">All Users</h1>
      <div className="space-y-2 mt-4">
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          users.map((user) => (
            <div key={user._id} className="p-4 border rounded-md">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone_calling}</p>
              <p><strong>Status:</strong> 
                <span className={user.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                  {user.status}
                </span>
              </p>

              <button
                onClick={() => handleToggleStatus(user._id, user.status)}
                className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded-md"
              >
                Mark as {user.status === 'active' ? 'Inactive' : 'Active'}
              </button>

              <button
                onClick={() => setSelectedUserId(selectedUserId === user._id ? null : user._id)}
                className="mt-2 ml-2 bg-blue-600 text-white px-4 py-1 rounded-md"
              >
                {selectedUserId === user._id ? 'Hide Details' : 'View More Details'}
              </button>

              {selectedUserId === user._id && ( 
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <p><strong>Gender:</strong> {user.gender}</p>
                  <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
                  <p><strong>Age:</strong> {user.age}</p>
                  <p><strong>Profession:</strong> {user.profession}</p>
                  <p><strong>Income:</strong> ₹{user.income}</p>
                  <p><strong>Office Address:</strong> {user.office_address}</p>
                  <p><strong>Bank:</strong> {user.banking_details?.bank_name}</p>
                  <p><strong>Account Number:</strong> {user.banking_details?.acc_number}</p>
                  <p><strong>IFSC Code:</strong> {user.banking_details?.ifsc_code}</p>
                  <p><strong>Permanent Address:</strong> {user.permanent_address?.village}, {user.permanent_address?.district}</p>

                  {user.photo && (
                    <div className="mt-2">
                      <strong>Photo:</strong>
                      <img src={user.photo} alt="Agent" className="mt-1 w-32 h-32 rounded object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    
    </div>
  );
}

export default AdminDashboard;
