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
import ForumModeration from '../pages/ForumModeration';
import MasterDataDashboard from '../pages/MasterDataDashboard';
import ComplaintManagement from '../pages/ComplaintManagement';
import AdminContactEditPage from './AdminContactEditPage';
import AdminAboutEditPage from './AdminAboutEditPage';
import AddBlog from '../pages/AddBlog';
import AdminBlogList from './AdminBlogList';
import AgentTreeViewer from '../components/AgentTreeViewer';
import EditGrievance from './EditGrievance';
import EditCancellationPolicy from './EditCancellationPolicy';
import AdminSpecialOffers from './AdminSpecialOffers';
import AttractionsEditPage from './AttractionsEditPage';

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
      case 'forumModeration':
        return <ForumModeration />;
      case 'masterDataDashboard':
        return <MasterDataDashboard />;
      case 'complaintManagement':
        return <ComplaintManagement />;
      case 'addBlog':
        return <AddBlog />;
      case 'adminContactEditPage':
        return <AdminContactEditPage/>;
      case 'adminAboutEditPage':
        return <AdminAboutEditPage/>;
      case 'addBlogs':
        return <AddBlog/>;
      case 'editBlogs':
        return <AdminBlogList/>;
      case 'treeView':
        return <AgentTreeViewer/>;
      case 'editGrievance':
        return <EditGrievance/>;
      case 'editCancellation':
        return <EditCancellationPolicy/>;
      case 'adminSpecialOffers':
        return <AdminSpecialOffers />;
      case 'adminAttractionSection':
        return <AttractionsEditPage />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="flex">
      <Sidebar setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out bg- ${collapsed ? 'md:ml-20' : 'md:ml-[273px]'
        }`}>
        <TopNav />
        {renderView()}
      </div>
    </div>
  );
}

export default Dashboard;