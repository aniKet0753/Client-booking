import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoon as faMoonRegular,
  faQuestionCircle as faQuestionCircleRegular,
  faBell as faBellRegular,
} from '@fortawesome/free-solid-svg-icons';
import { useDashboard } from '../context/DashboardContext'; // Import the hook
import WalletModal from './WalletModal'; // Import the new WalletModal component

function TopNav({ collapsed }) {
  const { profile, pendingCount, isLoadingProfile } = useDashboard(); // Get data from context
  const [showWalletModal, setShowWalletModal] = useState(false); // State to control wallet modal visibility

  const role = localStorage.getItem('role');

  const copyToClipboard = () => {
    if (profile?._id) {
      // Using document.execCommand('copy') for better iframe compatibility
      const el = document.createElement('textarea');
      el.value = profile._id;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      // Instead of alert, you might want a custom message box or toast notification
      // For now, a console log for demonstration
      console.log("Referral code copied to clipboard!");
      // You could also set a local state to show a temporary message on the UI
    }
  };

  // Add a loading state for the profile if it's not yet fetched
  if (isLoadingProfile) {
    return (
      <nav className="bg-white p-4 flex justify-between items-center shadow-md pl-10">
        <div className="text-xl font-bold text-gray-800">Loading profile...</div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white p-4 flex justify-between items-center shadow-md pl-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hi {profile?.name || 'User'}</h1>
          {profile?._id && role !== 'superadmin' && (
            <div className="text-sm text-gray-600 mt-1">
              Your Referral Code:
              <span
                className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                onClick={copyToClipboard}
                title="Click to copy"
              >
                {profile._id}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {profile?._id && role !== 'superadmin' && (
            <button
              onClick={() => setShowWalletModal(true)}
              className="text-lg font-bold text-gray-800 bg-gray-100 rounded p-2 hover:bg-gray-200 transition-colors duration-200 flex items-center cursor-pointer"
            >
              <span className='mb-1 me-2'>💳</span> Commission
            </button>
          )}

          <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
            <FontAwesomeIcon icon={faMoonRegular} />
          </button>
          <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
            <FontAwesomeIcon icon={faQuestionCircleRegular} />
          </button>
          <button className="bg-gray-100 p-2 rounded-full relative hover:bg-gray-200 transition-colors duration-200">
            <FontAwesomeIcon icon={faBellRegular} />
            {(role === 'superadmin' || role === 'admin') && pendingCount > 0 && ( // Conditionally show for admin/superadmin
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <img
            src={profile?.photo || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </nav>

      {/* Render the WalletModal component */}
      <WalletModal
        profile={profile}
        role={role}
        showWalletModal={showWalletModal}
        setShowWalletModal={setShowWalletModal}
      />
    </>
  );
}

export default TopNav;