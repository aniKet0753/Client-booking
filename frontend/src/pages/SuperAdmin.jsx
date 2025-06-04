import React, { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

function SuperAdmin() {
  const navigate = useNavigate();
  const [securityKey, setSecurityKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userFound, setUserFound] = useState(false);
  const [users, setUsers] = useState([]); 
  const [selectedUserId, setSelectedUserId] = useState(null);
  const token = localStorage.getItem('Token');
  const role = localStorage.getItem('role');
// 
  const [tourType, setTourType] = useState('');
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await axios.get('/api/admin/security-key', {
          headers: { Authorization: `Bearer ${token}`, role },
        });
        setSecurityKey(res.data.securityKey);
      } catch (err) {
        setMessage({ text: 'Failed to fetch security key.', type: 'error' });
      }
    };

    fetchKey();
    fetchAllUsers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        '/api/admin/security-key',
        { newKey },
        {
          headers: { Authorization: `Bearer ${token}`, role },
        }
      );
      setSecurityKey(newKey);
      setNewKey('');
      setMessage({ text: 'Security key updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to update security key.', type: 'error' });
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.post(
        '/api/admin/find-user',
        JSON.stringify({ identifier }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            role
          }
        }
      );      

      if (res.data.success) {
        setUserFound(true);
        setMessage({ text: 'User found. You can update the password.', type: 'success' });
      } else {
        setUserFound(false);
        setMessage({ text: 'User not found.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || 'Something went wrong'), type: 'error' });
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const res = await axios.post(
        '/api/admin/update-password',
        JSON.stringify({ identifier, newPassword }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            role
          }
        }
      );

      if (res.data.success) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setNewPassword('');
      } else {
        setMessage({ text: 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || 'Something went wrong'), type: 'error' });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/api/admin/all-users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role
        }
      });
  
      if (res.data.agents) {
        setUsers(res.data.agents);
      } else {
        setMessage({ text: 'No users found.', type: 'info' });
      }
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || 'Something went wrong while fetching users'), type: 'error' });
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await axios.post(
        '/api/admin/update-status',
        JSON.stringify({ userId, status: currentStatus === 'active' ? 'inactive' : 'active' }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            role
          }
        }
      );

      if (res.data.success) {
        setMessage({ text: `Status updated to ${currentStatus === 'active' ? 'inactive' : 'active'}`, type: 'success' });
        fetchAllUsers();
      } else {
        setMessage({ text: 'Failed to update status.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || 'Failed to toggle status.'), type: 'error' });
    }
  };

  const fetchTours = async () => {
    try {
      const res = await axios.get('/api/admin/tours', {
        headers: { Authorization: `Bearer ${token}`, role },
      });
      setTours(res.data.tours || []);
    } catch (err) {
      console.error('Error fetching tours', err);
    }
  };
  
  useEffect(() => {
    fetchTours();
  }, []); 
  
  const handleAddTour = async () => {
    if (!tourType || !packageName || !description || !location || !price) {
      return setMessage({ text: 'Please fill in all fields.', type: 'error' });
    }
  
    try {
      const res = await axios.post('/api/admin/tours', {
        tourType,
        package: { packageName, description, location, price }
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role
        }
      });
  
      setMessage({ text: 'Tour package added successfully!', type: 'success' });
      setTourType('');
      setPackageName('');
      setDescription('');
      setLocation('');
      setPrice('');
      fetchTours();
    } catch (err) {
      setMessage({ text: 'Error adding tour package.', type: 'error' });
    }
  };
  
  return (
    
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      
      <div className="flex justify-end mb-4">
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
      >
        Logout
      </button>
    </div>


      <h2 className="text-2xl font-bold mb-4 text-center">SuperAdmin - Security Key</h2>

      {message.text && (
        <div className={`text-sm p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Security Key</label>
        <input
          type="text"
          value={securityKey}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
        />
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Security Key</label>
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition duration-300">
          Update Security Key
        </button>
      </form>

      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-4">
        <h2 className="text-xl font-bold">SuperAdmin Dashboard</h2>

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
      <h2 className="text-xl font-bold mb-4">Create Tour Packages</h2>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <select
      value={tourType}
      onChange={(e) => setTourType(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">Select Tour Type</option>
      <option value="Leisure">Leisure</option>
      <option value="Religious">Religious</option>
      <option value="Rural">Rural Tourism</option>
    </select>

    <input
      type="text"
      placeholder="Package Name (e.g., Goa)"
      value={packageName}
      onChange={(e) => setPackageName(e.target.value)}
      className="border p-2 rounded"
    />
    <input
      type="text"
      placeholder="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="border p-2 rounded"
    />
    <input
      type="text"
      placeholder="Location (e.g., India)"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      className="border p-2 rounded"
    />
    <input
      type="number"
      placeholder="Price"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      className="border p-2 rounded"
    />
  </div>

  <button
    onClick={handleAddTour}
    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
  >
    Add Tour Package
  </button>

  <div className="mt-10">
    <h3 className="text-lg font-semibold mb-4">All Tour Packages</h3>
    {tours.length === 0 ? (
      <p>No tours added yet.</p>
    ) : (
      tours.map((tour, index) => (
        <div key={index} className="mb-4 p-4 border rounded-md shadow-sm">
          <p><strong>Type:</strong> {tour.tourType}</p>
          <p><strong>Package:</strong> {tour.package?.packageName}</p>
          <p><strong>Description:</strong> {tour.package?.description}</p>
          <p><strong>Location:</strong> {tour.package?.location}</p>
          <p><strong>Price:</strong> ₹{tour.package?.price}</p>
        </div>
      ))
    )}
  </div>
</div>
    </div>
  );
}

export default SuperAdmin;
