import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const allMenuItems = [
  { id: 'overview', icon: 'fa-tachometer-alt', label: 'Dashboard', path: '/dashboard/overview' },
  { id: 'committees', icon: 'fa-layer-group', label: 'Committees', path: '/dashboard/committees' },
  { id: 'events', icon: 'fa-calendar-alt', label: 'Events', path: '/dashboard/events' },
  { id: 'excom', icon: 'fa-users', label: 'ExCom', path: '/dashboard/members' },
  { id: 'partners', icon: 'fa-handshake', label: 'Partners', path: '/dashboard/partners' },
  { id: 'website-team', icon: 'fa-laptop-code', label: 'Website Team', path: '/dashboard/website-team' },
  { id: 'recruitment', icon: 'fa-door-open', label: 'Recruitment', path: '/dashboard/recruitment' },
  { id: 'mailing-list', icon: 'fa-envelope-open-text', label: 'Mailing List', path: '/dashboard/mailing-list' },
  { id: 'gallery', icon: 'fa-images', label: 'Gallery', path: '/dashboard/gallery' },
  { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics', path: '/dashboard/analytics' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings', path: '/dashboard/settings' },
  { id: 'users', icon: 'fa-user-shield', label: 'Users', path: '/dashboard/users', superadminOnly: true },
]

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const menuItems = allMenuItems.filter(item => !item.superadminOnly || currentUser.role === 'superadmin')

  const handleNavigation = (path) => {
    navigate(path)
    if (window.innerWidth <= 768) {
      setIsOpen(false)
    }
  }

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <img src="/images/ieeebluelogo.png" alt="IEEE MUST Logo" className="logo" />
        <h2>IEEE MUST</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li 
            key={item.id} 
            className={isActive(item.path) ? 'active' : ''}
            onClick={() => handleNavigation(item.path)}
          >
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className={`fas ${item.icon}`}></i> 
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
