import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'

const notifications = [
  { id: 1, text: 'New member joined: John Doe', time: '5m ago', icon: 'fa-user-plus', color: 'blue' },
  { id: 2, text: 'Upcoming Event: IEEE Day', time: '2h ago', icon: 'fa-calendar-check', color: 'green' },
  { id: 3, text: 'Technical Workshop starts in 1h', time: '1h ago', icon: 'fa-clock', color: 'orange' }
]

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg"

const readUser = () => JSON.parse(localStorage.getItem('user') || '{}')

function Navbar({ toggleTheme, theme, setIsSidebarOpen }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [user, setUser] = useState(readUser)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const navigate = useNavigate()

  const profileImage = user.avatar || DEFAULT_AVATAR

  useEffect(() => {
    const handleStorage = () => setUser(readUser())
    // Fires on cross-tab changes AND same-tab dispatches
    window.addEventListener('storage', handleStorage)

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/admin/auth/logout')
    } finally {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      // Clean up any legacy standalone pfp cache from old builds
      localStorage.removeItem('profileImage')
      navigate('/login')
    }
  }

  return (
    <nav className="top-navbar">
      <div className="toggle-menu" onClick={() => setIsSidebarOpen(prev => !prev)}>
        <i className="fas fa-bars"></i>
      </div>
      <div className="search-bar">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="Search..." />
      </div>
      <div className="navbar-right">
        <div className="theme-toggle">
          <input 
            type="checkbox" 
            id="theme-switch" 
            className="theme-switch"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <label htmlFor="theme-switch" className="switch-label">
            <i className="fas fa-sun"></i>
            <i className="fas fa-moon"></i>
            <span className="switch-ball"></span>
          </label>
        </div>
        <div className="notification" ref={notificationRef}>
          <div className="notification-icon-btn" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
            <i className="fas fa-bell"></i>
            <span className="notification-count">{notifications.length}</span>
          </div>
          
          <div className={`notification-dropdown ${isNotificationOpen ? 'show' : ''}`}>
            <div className="notification-header">
              <h3>Notifications</h3>
              <span className="mark-read">Mark all as read</span>
            </div>
            <div className="notification-list">
              {notifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className={`notif-icon ${notif.color}`}>
                    <i className={`fas ${notif.icon}`}></i>
                  </div>
                  <div className="notif-content">
                    <p>{notif.text}</p>
                    <span className="notif-time">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="notification-footer">
              <a href="#">View all notifications</a>
            </div>
          </div>
        </div>
        <div className="user-profile" ref={dropdownRef}>
          <img src={profileImage} alt="User Profile" />
          <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="user-name">{user.name || 'Admin'}</span>
            <i className="fas fa-chevron-down"></i>
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/settings'); setIsDropdownOpen(false); }}>
                <i className="fas fa-user"></i> Profile
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
