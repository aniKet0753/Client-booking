import React, { useState } from 'react';
import AgentSidebar from '../components/AgentSidebar';
import TopNav from '../components/TopNav';
import FetchTours from '../components/FetchTours';
import Account from '../components/Account';
import AgentDashboardCom from '../components/AgentDashboardCom';
import AgentTreeView from '../components/AgentTreeView';
import CommissionHistory from '../components/CommissionHistory'; 
import BookingHistory from '../components/BookingHistory';
import AgentComplaints from './AgentComplaints';

function AgentDashboard() {
  const [view, setView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <AgentDashboardCom />;
      case 'FetchTours':
        return <FetchTours />;
      case 'account':
        return <Account />;
      case 'TreeView':
        return <AgentTreeView />;
      case 'BookingHistory': 
        return <BookingHistory />;
      case 'CommissionHistory': 
        return <CommissionHistory />;
      case 'Complaints': 
        return <AgentComplaints />;
      default:
        return <AgentDashboardCom />;
    }
  };

  return (
    <>
      <AgentSidebar setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out bg- ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <TopNav />
        {renderView()}
      </div>
    </>
  );
}

export default AgentDashboard;
