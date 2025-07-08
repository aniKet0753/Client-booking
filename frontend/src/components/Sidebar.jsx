// Sidebar.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faThLarge,
  faTasks,
  faChartBar,
  faUsers,
  faPaperPlane,
  faCog,
  faUser,
  faChevronLeft,
  faChevronRight,
  faFileContract
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import MainLogo from '../../public/main-logo.png';
import axios from '../api';

const Sidebar = ({ collapsed, setCollapsed, setView }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  const token = localStorage.getItem('Token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await axios.get('/api/admin/pending-count', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPendingCount(res.data.count);
      } catch (error) {
        console.error('Failed to fetch pending user count:', error);
      }
    };
    fetchPendingUsers();
    const intervalId = setInterval(fetchPendingUsers, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleItemClick = (view) => {
    setActiveView(view);
    setView?.(view);
  };

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const commonMenu = [
    { icon: faThLarge, label: 'Dashboard', view: 'dashboard' },
    { icon: faTasks, label: 'Add Tour', view: 'addTour' },
    { icon: faChartBar, label: 'View Tours', view: 'FetchTours' },
    { icon: faChartBar, label: 'Edit Tours', view: 'EditTours' }
  ];

  const businessMenu = [
    { icon: faPaperPlane, label: 'Requests', view: 'requests', badge: pendingCount },
    { icon: faTasks, label: 'Cancellations', view: 'cancellations' }
  ];

  const superAdminMenu = [
    { icon: faFileContract, label: 'Terms & Conditions', view: 'terms' },
    { icon: faChartBar, label: 'Check Booking', view: 'checkBooking' },
    { icon: faUsers, label: 'Forum Moderation', view: 'forumModeration' },
    { icon: faUsers, label: 'Master Data Dashboard', view: 'masterDataDashboard' },
    { icon: faUsers, label: 'Complaint Management', view: 'complaintManagement' }
  ];

  const accountMenu = [
    { icon: faCog, label: 'Settings' },
    { icon: faUser, label: 'Account', view: 'account' },
    { icon: faSignOutAlt, label: 'Logout', action: handleLogout }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-[270px]'} bg-blue-900 text-white z-10 transition-all duration-300 ease-in-out hidden md:block`}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-indigo-400 border-opacity-30 relative">
        <Link to="/" className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center mr-3">
            <img src={MainLogo} alt="Home" />
          </div>
          {!collapsed && <span className="text-white font-bold text-xl">L2G Cruise</span>}
        </Link>
        <button onClick={toggleSidebar} className="absolute -right-4 h-8 w-8 bg-black rounded-full flex items-center justify-center hover:bg-opacity-50">
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>

      {/* Menu Section */}
      <div className="overflow-y-auto h-[74vh] px-3 pt-4 scrollbar">
        {!collapsed && <p className="text-indigo-200 text-xs font-medium uppercase mb-2">Main Menu</p>}

        {[...commonMenu, ...businessMenu].map(item => (
          <div
            key={item.label}
            onClick={() => handleItemClick(item.view)}
            className={`sidebar-item px-2 py-2 flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 cursor-pointer ${activeView === item.view ? 'active-menu-item' : ''}`}
          >
            <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={item.icon} />
            </div>
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto bg-red-400 text-xs px-2 py-1 rounded-full">{item.badge}</span>
                )}
              </>
            )}
          </div>
        ))}

        {/* Super Admin Section */}
        {role === 'superadmin' && (
          <>
            {!collapsed && <p className="text-indigo-200 text-xs font-medium uppercase mb-2 mt-6">Admin Only</p>}
            {superAdminMenu.map(item => (
              <div
                key={item.label}
                onClick={() => handleItemClick(item.view)}
                className={`sidebar-item px-2 py-2 flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 cursor-pointer ${activeView === item.view ? 'active-menu-item' : ''}`}
              >
                <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                {!collapsed && <span>{item.label}</span>}
              </div>
            ))}
          </>
        )}

        {/* Account Section */}
        {!collapsed && <p className="text-indigo-200 text-xs font-medium uppercase mb-2 mt-6">Account</p>}
        {accountMenu.map(item => (
          <div
            key={item.label}
            onClick={() => item.action ? item.action() : handleItemClick(item.view)}
            className={`sidebar-item px-2 py-2 flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 cursor-pointer ${activeView === item.view ? 'active-menu-item' : ''}`}
          >
            <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={item.icon} />
            </div>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
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

export default Sidebar;
