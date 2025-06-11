import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AgentForm from './pages/AgentForm';
import AgentLogin from './pages/AgentLogin';
import AgentDashboard from './pages/AgentDashboard';
import Dashboard from './pages/Dashboard';
import ThankYou from './pages/ThankYou';
import PaymentCancelled from './pages/PaymentCancelled';
import AgentRequests from './components/AgentRequest';
import SuperadminProtectedRoute from './components/SuperadminProtectedRoute';
import AgentProtectedRoute from './components/AgentProtectedRoute';
import KycForm from './components/KycForm';
import TermsAndConditions from './components/TermsAndConditions';
import Home from './pages/Home';
import Mainlayout from './layouts/Mainlayout';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import Register from './pages/Register';
import TourPrograms from './pages/TourPrograms';
import TourItinerary from './pages/TourItinerary';
import CustomerDashboard from './pages/CustomerDashboard';
import TravelExperience from './pages/TravelExperience';
import EditTour from './components/EditTour';
import CustomerForum from './pages/CustomerForum';
import TermsAndConditionsNew from './pages/EditTermsAndConditions';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("Token"));

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem("Token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* Main Layout wrapper for all other routes */}
        <Route path="/" element={<Mainlayout />} errorElement={<ErrorPage />}>
          <Route index element={<Home />} />

          <Route path="/agent-register" element={<AgentForm />} />
          <Route path='/register' element={<Register />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/tour-programs/:tourType" element={<TourPrograms />} />
          <Route path="tour-itinerary/:tourID" element={<TourItinerary />} />
          <Route path='/travel-experience/:tourCategory' element = { <TravelExperience/> }/>
          <Route path='/travel-experience/:tourCategory/:tourType' element = { <TourPrograms/> }/>

          {/* 404 fallback */}
          <Route path="*" element={<ErrorPage />} />

        </Route>

        <Route path="thank-you" element={<ThankYou />} />
        <Route path="cancel" element={<PaymentCancelled />} />
        <Route path="kyc" element={<KycForm />} />
        <Route path="terms/:id" element={<TermsAndConditions />} />

        {/* Protected Routes */}
        <Route
          path="agent/dashboard"
          element={
            <AgentProtectedRoute>
              <AgentDashboard />
            </AgentProtectedRoute>
          }
        />
        <Route
          path="superadmin/dashboard"
          element={
            <SuperadminProtectedRoute>
              <Dashboard />
            </SuperadminProtectedRoute>
          }
        />
        <Route
          path="agent-requests"
          element={
            <SuperadminProtectedRoute>
              <AgentRequests />
            </SuperadminProtectedRoute>
          }
        />

        <Route
          path="edit-tour/:tourID"
          element={
            <SuperadminProtectedRoute>
              <EditTour />
            </SuperadminProtectedRoute>
          }
        />

        <Route path="/customer-dashboard" element={<CustomerDashboard />} />

        <Route path="/travel-experience" element={<TravelExperience />} />

        <Route path="/customer-forum" element={<CustomerForum />} />

        <Route path="/terms-and-conditions-new" element={<TermsAndConditionsNew />} />

      </Routes>
    </BrowserRouter>
  );
}

function LoginPage({ setIsAuthenticated }) {
  return (
    <div className="login-container">
      <AgentLogin setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
}

export default App;
