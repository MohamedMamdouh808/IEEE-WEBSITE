import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { uploadToCloudinary } from '../../utils/cloudinary'

const settingsTabs = [
  { id: 'profile-settings', label: 'Profile Settings' },
  { id: 'security-settings', label: 'Security' }
]

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg"

function SettingsSection() {
  const [activeTab, setActiveTab] = useState('profile-settings')
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false })

  // Password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    api.get('/admin/auth/me')
      .then(({ data }) => {
        setProfileForm({ name: data.user.name, email: data.user.email })
        setProfileImage(data.user.avatar || DEFAULT_AVATAR)
        // Sync localStorage user so navbar reflects backend truth
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...stored, ...data.user }))
        window.dispatchEvent(new Event('storage'))
      })
      .catch(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        setProfileForm({ name: stored.name || '', email: stored.email || '' })
        setProfileImage(stored.avatar || DEFAULT_AVATAR)
      })
      .finally(() => setProfileLoading(false))
  }, [])

  const handleImageUpload = () => fileInputRef.current.click()

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarSaving(true)
    setProfileMsg({ text: '', isError: false })
    try {
      const url = await uploadToCloudinary(file)
      setProfileImage(url)
      const { data } = await api.patch('/admin/auth/me', { avatar: url })
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...data.user }))
      window.dispatchEvent(new Event('storage'))
      setProfileMsg({ text: 'Photo updated successfully.', isError: false })
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      setProfileImage(stored.avatar || DEFAULT_AVATAR)
      setProfileMsg({ text: 'Failed to upload photo. Try again.', isError: true })
    } finally {
      setAvatarSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg({ text: '', isError: false })
    try {
      const { data } = await api.patch('/admin/auth/me', {
        name: profileForm.name,
        email: profileForm.email,
      })
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...data.user }))
      window.dispatchEvent(new Event('storage'))
      setProfileMsg({ text: 'Profile updated successfully.', isError: false })
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Failed to save changes.', isError: true })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMsg({ text: '', isError: false })
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', isError: true })
      return
    }
    setPasswordSaving(true)
    try {
      await api.patch('/admin/auth/me', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordMsg({ text: 'Password changed successfully.', isError: false })
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to change password.', isError: true })
    } finally {
      setPasswordSaving(false)
    }
  }

  const toggleShow = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))

  const msgStyle = (isError) => ({
    padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem',
    background: isError ? 'var(--danger-color)' : 'var(--success-color)', color: '#fff',
  })

  return (
    <section className="content-section active">
      <h1>Settings</h1>
      <div className="settings-container">
        <aside className="settings-sidebar">
          <ul className="settings-menu">
            {settingsTabs.map(tab => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </aside>
        <div className="settings-content">

          {/* ── Profile Settings ── */}
          <div id="profile-settings" className={`settings-panel ${activeTab === 'profile-settings' ? 'active' : ''}`}>
            <h2>Profile Settings</h2>
            {profileLoading ? (
              <p style={{ color: 'var(--text-light)' }}>Loading...</p>
            ) : (
              <form className="settings-form" onSubmit={handleProfileSubmit}>
                <div className="profile-upload">
                  <img src={profileImage} alt="Profile" />
                  <button type="button" className="upload-btn" onClick={handleImageUpload} disabled={avatarSaving}>
                    {avatarSaving ? 'Uploading...' : 'Upload New Photo'}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                </div>
                {profileMsg.text && <div style={msgStyle(profileMsg.isError)}>{profileMsg.text}</div>}
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Security / Change Password ── */}
          <div id="security-settings" className={`settings-panel ${activeTab === 'security-settings' ? 'active' : ''}`}>
            <h2>Change Password</h2>
            <form className="settings-form" onSubmit={handlePasswordSubmit}>
              {passwordMsg.text && <div style={msgStyle(passwordMsg.isError)}>{passwordMsg.text}</div>}
              {[
                { id: 'current', name: 'currentPassword', label: 'Current Password' },
                { id: 'new',     name: 'newPassword',     label: 'New Password' },
                { id: 'confirm', name: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ id, name, label }) => (
                <div className="form-group" key={id} style={{ position: 'relative' }}>
                  <label>{label}</label>
                  <input
                    type={showPasswords[id] ? 'text' : 'password'}
                    name={name}
                    value={passwordForm[name]}
                    onChange={handlePasswordChange}
                    required
                    style={{ paddingRight: '42px' }}
                  />
                  <span
                    onClick={() => toggleShow(id)}
                    style={{ position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', color: 'var(--text-light)' }}
                  >
                    <i className={`fas ${showPasswords[id] ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </span>
                </div>
              ))}
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={passwordSaving}>
                  {passwordSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}

export default SettingsSection
