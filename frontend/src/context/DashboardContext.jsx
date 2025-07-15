import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from '../api';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPendingCount, setIsLoadingPendingCount] = useState(true);

  // Use state to manage token and role, so useEffect can react to their changes
  const [token, setToken] = useState(localStorage.getItem('Token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  // ✅ Move fetchProfile outside of useEffect
  const fetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('Token');
    const currentRole = localStorage.getItem('role');

    if (!currentToken || !currentRole) {
      setProfile(null);
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    try {
      const route = currentRole === 'superadmin' || currentRole === 'admin'
        ? '/api/admin/profile'
        : '/api/agents/profile';
      const res = await axios.get(route, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
          role: currentRole,
        },
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Optional: Clear token/role if auth fails
      // localStorage.removeItem('Token');
      // localStorage.removeItem('role');
      // setToken(null);
      // setRole(null);
      setProfile(null); // Clear profile on error
    } finally {
      setIsLoadingProfile(false);
    }
  }, []); // No dependencies for useCallback, as it internally reads localStorage

  // ✅ Same for fetchPendingCount
  const fetchPendingCount = useCallback(async () => {
    const currentToken = localStorage.getItem('Token');
    const currentRole = localStorage.getItem('role');

    if (!currentToken || (currentRole !== 'superadmin' && currentRole !== 'admin')) {
      setPendingCount(0);
      setIsLoadingPendingCount(false);
      return;
    }

    setIsLoadingPendingCount(true);
    try {
      const res = await axios.get('/api/admin/pending-count', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      setPendingCount(res.data.count);
    } catch (error) {
      console.error('Failed to fetch pending user count:', error);
      setPendingCount(0); // Set to 0 on error
    } finally {
      setIsLoadingPendingCount(false);
    }
  }, []); // No dependencies for useCallback

  // Effect to fetch profile and pending count on initial mount and when token/role *state* changes
  useEffect(() => {
    fetchProfile();
    if (role === 'superadmin' || role === 'admin') {
      fetchPendingCount();
    }
  }, [fetchProfile, fetchPendingCount, token, role]); // Depend on the state variables

  // Function to call after successful login to update context state
  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('Token'));
    setRole(localStorage.getItem('role'));
    // No need to call fetchProfile/fetchPendingCount directly here,
    // the useEffect above will react to token/role state changes.
  };

  // Function to call after logout
  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setProfile(null);
    setPendingCount(0);
  };


  const contextValue = {
    pendingCount,
    profile,
    isLoadingProfile,
    isLoadingPendingCount,
    fetchProfile,
    fetchPendingCount,
    handleLoginSuccess, // Expose this function
    handleLogout, // Expose logout function for convenience
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  return useContext(DashboardContext);
};