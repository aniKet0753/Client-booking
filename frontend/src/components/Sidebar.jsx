import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import MainLogo from '../../public/main-logo.png';
import axios from '../api';

import {
  faThLarge,
  faTasks,
  faChartBar,
  faUsers,
  faBullhorn,
  faUserTie,
  faPaperPlane,
  faCog,
  faUser,
  faChevronLeft,
  faChevronRight,
  faFileContract, // Add this icon for Terms & Conditions
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AgentRequests from './AgentRequest';

const Sidebar = ({ collapsed, setCollapsed, setView }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [inactiveCount, setInactiveCount] = useState(0);
  const token = localStorage.getItem('Token');
  const role = localStorage.getItem('role'); // Get user role

  useEffect(() => {
    const fetchInactiveUsers = async () => {
      try {
        const res = await axios.get('/api/admin/inactive-count', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInactiveCount(res.data.count);
      } catch (error) {
        console.error('Failed to fetch inactive user count:', error);
      }
    };
    fetchInactiveUsers();
    const intervalId = setInterval(fetchInactiveUsers, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const handleItemClick = (view) => {
    if (view) {
      setActiveView(view);
      setView?.(view);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-64'
        } bg-blue-900 text-white z-10 transition-all duration-300 ease-in-out hidden md:block`}
    >
      {/* Top Section */}
      <div className="p-5 flex items-center justify-between border-b border-indigo-400 border-opacity-30 relative">
        <div className="flex items-center">
          <Link to="/" className='flex items-center'>
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center mr-3">
              {!collapsed ? (
                <span className="text-indigo-600 font-bold text-xl p-1">
                  <img src={MainLogo} alt="Home" />
                </span>
              ) : (
                <span className="text-indigo-600 font-bold text-xl">
                  <img src={MainLogo} alt="Home" />
                </span>
              )}
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

          {[
            { icon: faThLarge, label: 'Dashboard', view: 'dashboard' },
            { icon: faTasks, label: 'Add Tour', view: 'addTour' },
            { icon: faChartBar, label: 'View Tours', view: 'FetchTours' },
            { icon: faChartBar, label: 'Edit Tours', view: 'EditTours' },
            // { icon: faChartBar, label: 'Analytics', view: 'analytics' },
            // { icon: faUsers, label: 'Teams' },
          ].map(item => (
            <Link
              to={item.path} // Use Link for navigation
              key={item.label}
              onClick={() => {
                if (item.view) {
                  setActiveView(item.view); // Set active view
                  setView?.(item.view); // Call parent setView if provided
                }
              }}
              className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 w-full relative ${activeView === item.view ? 'active-menu-item' : ''
                }`}
            >
              <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {!collapsed && (
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider px-3 mb-2 mt-6">
              Business
            </p>
          )}

          <div className="space-y-2">
            {[
              // { icon: faBullhorn, label: 'Campaigns', view: 'campaigns', path: '/campaigns' },
              // { icon: faUserTie, label: 'Clients', view: 'clients', path: '/clients' },
              { icon: faPaperPlane, label: 'Requests', view: 'requests' },
              { icon: faTasks, label: 'Cancellations', view: 'cancellations' },
            ].map(item => (
              <Link
                to={item.path}
                key={item.label}
                onClick={() => {
                  if (item.view) {
                    setActiveView(item.view);
                    setView?.(item.view);
                  }
                }}
                className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] hover:bg-opacity-10 rounded-xl cursor-pointer relative ${activeView === item.view ? 'active-menu-item' : ''
                  }`}
              >
                <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {/* {item.label === 'Campaigns' && (
                      <span className="ml-auto bg-indigo-500 text-xs px-2 py-1 rounded-full">3</span>
                    )} */}
                    {item.label === 'Requests' && (
                      <span className="ml-auto bg-red-400 text-xs px-2 py-1 rounded-full">{inactiveCount}</span>
                    )}
                  </>
                )}
              </Link>
            ))}
            {/* Terms & Conditions tab for superadmin only */}
            {role === 'superadmin' && (
              <div
                onClick={() => {
                  setActiveView('terms');
                  setView?.('terms');
                }}
                className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 w-full relative cursor-pointer ${activeView === 'terms' ? 'active-menu-item' : ''}`}
              >
                <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faFileContract} />
                </div>
                {!collapsed && <span>Terms & Conditions</span>}
              </div>
            )}
            {/* Check Booking tab for superadmin only */}
            {role === 'superadmin' && (
              <div
                onClick={() => {
                  setActiveView('checkBooking');
                  setView?.('checkBooking');
                }}
                className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 w-full relative cursor-pointer ${activeView === 'checkBooking' ? 'active-menu-item' : ''}`}
              >
                <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faChartBar} />
                </div>
                {!collapsed && <span>Check Booking</span>}
              </div>
            )}
          </div>

          {!collapsed && (
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider px-3 mb-2 mt-6">
              Account
            </p>
          )}

          {[
            { icon: faCog, label: 'Settings' }, // You can add view later if needed
            { icon: faUser, label: 'Account', view: 'account' },
            { icon: faSignOutAlt, label: 'Logout', action: handleLogout }
          ].map(item => (
            <div
              key={item.label}
              onClick={() => {
                if (item.view) {
                  setActiveView(item.view);
                  setView?.(item.view);
                } else if (item.action) {
                  item.action();
                }
              }}
              className={`sidebar-item px-2 py-2 text-white flex items-center hover:bg-[#ffffff29] hover:bg-opacity-10 rounded-xl cursor-pointer ${activeView === item.view ? 'active-menu-item' : ''
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

export default Sidebar;
