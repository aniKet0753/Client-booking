import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MainContent from '../components/MainContent';
import AddTour from '../components/AddTour';
import FetchTours from '../components/FetchTours';
import EditAnyTour from '../components/EditAnyTour';
import AgentRequests from '../components/AgentRequest';
import Account from '../components/Account';
import CancellationRequests from '../components/CancellationRequests';
import TermsAndConditionsNew from '../pages/EditTermsAndConditions';
import CheckBooking from '../components/CheckBooking';

function Dashboard() {
  const [view, setView] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <MainContent />;
      case 'addTour':
        return <AddTour />;
      case 'FetchTours':
        return <FetchTours />;
      case 'EditTours':
        return <EditAnyTour/>;
      case 'requests':
        return <AgentRequests />;
      case 'account':
        return <Account/>
      case 'cancellations':
        return <CancellationRequests />;
      case 'terms':
        return <TermsAndConditionsNew />;
      case 'checkBooking':
        return <CheckBooking />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="flex">
      <Sidebar setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out bg- ${collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
        <TopNav />
        {renderView()}
      </div>
    </div>
  );
}

export default Dashboard;
