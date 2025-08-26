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
  faFileContract,
  faEdit, // Added for the new "Change Details" icon
  faCaretDown, // Added for dropdown caret
  faCaretUp // Added for dropdown caret
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import MainLogo from '../../public/main-logo.png';
import { useDashboard } from '../context/DashboardContext';
import { icons } from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed, setView }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [openDropdown, setOpenDropdown] = useState(null); // State to manage open dropdowns
  const { pendingCount, profile } = useDashboard();
  const role = localStorage.getItem('role');

  useEffect(() => {
    // This effect ensures that if the 'view' prop changes externally,
    // the activeView state is updated, which is crucial for highlighting
    // the correct item in the sidebar.
    if (setView && typeof setView === 'function') {
      // If setView is provided, it means the parent component is controlling the view.
      // We might want to initialize activeView based on the current URL or a default.
      // For now, keeping it simple, assume the parent handles setting the initial view.
    }
  }, [setView]);


  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleItemClick = (view) => {
    setActiveView(view);
    setView?.(view);
    setOpenDropdown(null); // always close dropdown after click
  };


  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(prev => (prev === dropdownName ? null : dropdownName));
  };

  const commonMenu = [
    { icon: faThLarge, label: 'Dashboard', view: 'dashboard' },
    { icon: faTasks, label: 'Add Tour', view: 'addTour' },
    { icon: faChartBar, label: 'View Tours', view: 'FetchTours' },
    { icon: faChartBar, label: 'Edit Tours', view: 'EditTours' }
  ];

  const businessMenu = [
    { icon: faPaperPlane, label: 'Requests', view: 'requests', badge: pendingCount },
    { icon: faPaperPlane, label: 'Tree View', view: 'treeView' },
    { icon: faPaperPlane, label: 'View Agreements', view: 'viewAgreements' },
    { icon: faTasks, label: 'Cancellations', view: 'cancellations' }
  ];

  const superAdminMenu = [
    { icon: faChartBar, label: 'Check Booking', view: 'checkBooking' },
    { icon: faUsers, label: 'Forum Moderation', view: 'forumModeration' },
    { icon: faUsers, label: 'Master Data Dashboard', view: 'masterDataDashboard' },
    { icon: faUsers, label: 'Complaint Management', view: 'complaintManagement' },
    { icon: faFileContract, label: 'Edit Terms and Conditions', view: 'EditTermsConditions' },
    // {icons: faUsers, label: 'Edit Special Offer', view: 'AdminSpecialOffers' },

    {
      icon: faEdit,
      label: 'Edit Policies',
      view: 'editPolicies', // A unique view for the dropdown header
      isDropdown: true,
      subItems: [
        { icon: faTasks, label: 'Grievance Policy', view: 'editGrievance' },
        { label: 'Cancellation Policy', view: 'editCancellation' } // Corresponds to AdminAboutEditPage.jsx
      ]
    },

    {
      icon: faEdit,
      label: 'Home',
      view: 'changehome',
      isDropdown: true,
      subItems: [
        { label: 'Edit Special Offer', view: 'adminSpecialOffers' }, // fixed icon
        {label: 'Edit Attraction Section', view: 'adminAttractionSection' } // fixed icon
      ]
    },

    {
      icon: faEdit,
      label: 'Blogs',
      view: 'changeblogs',
      isDropdown: true,
      subItems: [
        { icon: faTasks, label: 'Add Blogs', view: 'addBlogs' },
        { label: 'Edit Blogs', view: 'editBlogs' },// fixed icon
      ]
    },

    // New "Change Details" dropdown item
    {
      icon: faEdit,
      label: 'Change Details',
      view: 'changeDetails', // A unique view for the dropdown header
      isDropdown: true,
      subItems: [
        { label: 'Contact Page', view: 'adminContactEditPage' }, // Corresponds to AdminContactEditPage.jsx
        { label: 'About Page', view: 'adminAboutEditPage' }, // Corresponds to AdminAboutEditPage.jsx
        { label: 'Know Us', view: 'adminKnowUsEditPage' } // Corresponds to AdminKnowUsEditPage.jsx
      ]
    }
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
              item.isDropdown ? (
                // Render dropdown header
                <div key={item.label}>
                  <div
                    onClick={() => toggleDropdown(item.view)}
                    className={`sidebar-item px-2 py-2 flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 cursor-pointer ${openDropdown === item.view ? 'active-menu-item' : ''}`}
                  >
                    <div className="h-8 w-8 rounded-md bg-indigo-500 bg-opacity-30 flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        <FontAwesomeIcon icon={openDropdown === item.view ? faCaretUp : faCaretDown} className="ml-auto" />
                      </>
                    )}
                  </div>
                  {/* Render dropdown sub-items if open and not collapsed */}
                  {openDropdown === item.view && !collapsed && (
                    <div className="ml-8 border-l border-indigo-400 border-opacity-30">
                      {item.subItems.map(subItem => (
                        <div
                          key={subItem.label}
                          onClick={() => handleItemClick(subItem.view)}
                          className={`sidebar-item px-2 py-2 flex items-center hover:bg-[#ffffff29] rounded-xl mb-2 cursor-pointer ${activeView === subItem.view ? 'active-menu-item' : ''}`}
                        >
                          <div className="h-8 w-8 rounded-md bg-transparent flex items-center justify-center mr-3">
                            {/* No icon for sub-items, or a small dot/dash */}
                          </div>
                          <span>{subItem.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Render regular menu item
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
              )
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