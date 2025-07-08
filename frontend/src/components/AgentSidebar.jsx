import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThLarge,
  faChartBar,
  faCog,
  faUser,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faHistory, // Import the history icon
} from '@fortawesome/free-solid-svg-icons';
import MainLogo from '../../public/main-logo.png';
import { Link } from 'react-router-dom';

const AgentSidebar = ({ collapsed, setCollapsed, setView }) => {
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const handleItemClick = (view) => {
    if (view) {
      setActiveView(view);
      setView?.(view); // Trigger the parent setView function if needed
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const mainItems = [
    { icon: faThLarge, label: 'Dashboard', view: 'dashboard' },
    { icon: faChartBar, label: 'View Tours', view: 'FetchTours' },
    { icon: faUser, label: 'Tree View', view: 'TreeView' },
    { icon: faHistory, label: 'Booking History', view: 'BookingHistory' },
    { icon: faHistory, label: 'Commission History', view: 'CommissionHistory' },
    { icon: faHistory, label: 'Complaints', view: 'Complaints' },
  ];

  const accountItems = [
    { icon: faCog, label: 'Settings' },
    { icon: faUser, label: 'Account', view: 'account' }, // Add the view here
    { icon: faSignOutAlt, label: 'Logout', action: handleLogout },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 ${
        collapsed ? 'w-20' : 'w-64'
      } bg-blue-900 text-white z-10 transition-all duration-300 ease-in-out hidden md:block`}
    >
      {/* Top Section */}
      <div className="p-5 flex items-center justify-between border-b border-indigo-400 border-opacity-30 relative">
        <div className="flex items-center">
          <Link to="/" className='flex items-center'>
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center mr-3">
              <img src={MainLogo} alt="Logo" className="p-1" />
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-xl sidebar-text">L2G Cruise</span>
            )}
          </Link>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none h-8 w-8 flex items-center justify-center rounded-full bg-black hover:bg-opacity-50 transition-all absolute -right-4"
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} className="text-sm" />
        </button>
      </div>

      {/* Menu */}
      <div className="overflow-y-auto h-[74vh] scrollbar">
        <nav className="mt-4 px-3">
          {!collapsed && (
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
          )}
          {mainItems.map(item => (
            <div
              key={item.label}
              onClick={() => handleItemClick(item.view)}
              className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 w-full relative cursor-pointer ${
                activeView === item.view ? 'active-menu-item' : ''
              }`}
            >
              <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </div>
          ))}

          {!collapsed && (
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider px-3 mb-2 mt-6">
              Account
            </p>
          )}

          {accountItems.map(item => (
            <div
              key={item.label}
              onClick={() => {
                if (item.view) {
                  handleItemClick(item.view); // Set active view for Account
                  setView?.(item.view); // Update parent view state
                } else if (item.action) {
                  item.action(); // Trigger logout if action is defined
                }
              }}
              className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] hover:bg-opacity-10 rounded-xl cursor-pointer ${
                activeView === item.view ? 'active-menu-item' : ''
              }`}
            >
              <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-[#ffffff29] bg-opacity-10 rounded-xl p-3">
          {!collapsed && (
            <>
              <h4 className="text-white font-medium mb-1">Company Name</h4>
              <p className="text-indigo-200 text-sm">@2024</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;