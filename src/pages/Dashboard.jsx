import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { ToastContainer } from '../components/layout/Toast'
import DashboardOverview from '../components/dashboard/DashboardOverview'
import CommitteesSection from '../components/dashboard/CommitteesSection'
import EventsSection from '../components/dashboard/EventsSection'
import MembersSection from '../components/dashboard/MembersSection'
import PartnersSection from '../components/dashboard/PartnersSection'
import RecruitmentSection from '../components/dashboard/RecruitmentSection'
import AnalyticsSection from '../components/dashboard/AnalyticsSection'
import SettingsSection from '../components/dashboard/SettingsSection'
import WebsiteTeamSection from '../components/dashboard/WebsiteTeamSection'
import MailingListSection from '../components/dashboard/MailingListSection'
import GallerySection from '../components/dashboard/GallerySection'
import UsersSection from '../components/dashboard/UsersSection'

function Dashboard({ toggleTheme, theme }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar 
          toggleTheme={toggleTheme} 
          theme={theme} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        <ToastContainer />
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="committees" element={<CommitteesSection />} />
            <Route path="events" element={<EventsSection />} />
            <Route path="members" element={<MembersSection />} />
            <Route path="partners" element={<PartnersSection />} />
            <Route path="recruitment" element={<RecruitmentSection />} />
            <Route path="analytics" element={<AnalyticsSection />} />
            <Route path="settings" element={<SettingsSection />} />
            <Route path="website-team" element={<WebsiteTeamSection />} />
            <Route path="mailing-list" element={<MailingListSection />} />
            <Route path="gallery" element={<GallerySection />} />
            <Route path="users" element={<UsersSection />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
