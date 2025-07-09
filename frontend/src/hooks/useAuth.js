import { useState, useEffect } from 'react';
import axios from '../api';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("username");
    return username ? { name: username } : null;
  });
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (token, role) => {
    if (!token || token === 'null') return;
    
    try {
      const route = role === 'superadmin' ? 'api/admin/profile' :
        role === 'customer' ? 'api/customer/profile' : 'api/agents/profile';
      
      const res = await axios.get(route, {
        headers: { Authorization: `Bearer ${token}`, role }
      });
      
      setProfile(res.data);
      if (res.data.name) {
        setUser({ name: res.data.name });
        localStorage.setItem("username", res.data.name);
      }
    } catch (err) {
      localStorage.clear();
      setUser(null);
      setProfile(null);
      toast.error("Session expired. Please log in again.");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setProfile(null);
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    const token = localStorage.getItem("Token");
    const role = localStorage.getItem("role");
    if (token && !profile) fetchProfile(token, role);
  }, []);

  return { user, profile, logout };
};