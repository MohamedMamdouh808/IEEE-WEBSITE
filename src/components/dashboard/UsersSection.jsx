import { useState, useEffect } from 'react'
import api from '../../api/index'

const emptyForm = { name: '', email: '', password: '', role: 'admin' }

function UsersSection() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/admin/auth/users')
      setUsers(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openModal = () => { setForm(emptyForm); setIsModalOpen(true) }
  const closeModal = () => { setIsModalOpen(false); setForm(emptyForm); setShowPassword(false) }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await api.post('/admin/auth/register', form)
      setUsers(prev => [data.user, ...prev])
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete account for "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/auth/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.')
    }
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <section className="content-section active">
      <h1>Admin Users</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '0.9rem' }}>
        Manage who has access to this dashboard. Only superadmins can see this page.
      </p>

      {error && <p style={{ color: 'var(--danger-color)', marginBottom: '12px' }}>{error}</p>}

      <div className="section-header">
        <h2>Accounts ({users.length})</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={openModal}>
            <i className="fas fa-plus"></i> Add User
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'var(--primary-color)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>
                        {user.name}
                        {user._id === currentUser._id && (
                          <span style={{ marginLeft: '6px', fontSize: '0.7rem', background: 'var(--primary-color)', color: '#fff', borderRadius: '4px', padding: '1px 6px' }}>You</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '4px',
                      background: user.role === 'superadmin' ? 'rgba(0,150,237,0.12)' : 'var(--bg-secondary)',
                      color: user.role === 'superadmin' ? 'var(--primary-color)' : 'var(--text-light)',
                    }}>
                      {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{formatDate(user.createdAt)}</td>
                  <td>
                    {user._id !== currentUser._id ? (
                      <button type="button" className="action-btn mini danger" onClick={() => handleDelete(user._id, user.name)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="auth-header">
              <h2>Create Admin Account</h2>
            </div>
            {error && <p style={{ color: 'var(--danger-color)', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="e.g. Ahmed Mostafa" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="name@example.com" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Temporary Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password} onChange={handleInputChange}
                    placeholder="Set a temporary password" required minLength={8}
                    style={{ paddingRight: '40px', width: '100%' }}
                  />
                  <span onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-light)' }}>
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Share this with the user — they should change it from Settings.</p>
              </div>
              <div className="form-group">
                <label><i className="fas fa-shield-alt"></i> Role</label>
                <select name="role" value={form.role} onChange={handleInputChange}>
                  <option value="admin">Admin — can manage all content</option>
                  <option value="superadmin">Superadmin — can also manage users</option>
                </select>
              </div>
              <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={saving}>
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default UsersSection
