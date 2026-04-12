import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { compressImage } from '../../utils/imageCompressor'
import { toast } from '../../utils/toast'

function MembersSection() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', role: '', department: '', bio: '', email: '', linkedin: '', github: '', photo: '', order: 0, isActive: true })
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/excom')
      setMembers(data.data)
    } catch {
      setError('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const openModal = (member = null) => {
    if (member) {
      setEditingId(member._id)
      setForm({
        name: member.name, role: member.role, department: member.department || '',
        bio: member.bio || '', email: member.email || '', linkedin: member.linkedin || '',
        github: member.github || '', photo: member.photo || '',
        order: member.order ?? 0, isActive: member.isActive ?? true,
      })
    } else {
      setEditingId(null)
      setForm({ name: '', role: '', department: '', bio: '', email: '', linkedin: '', github: '', photo: '', order: 0, isActive: true })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null) }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8)
        setForm(prev => ({ ...prev, photo: compressed }))
      } catch (err) {
        console.error('Image compression failed', err)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const { data } = await api.put(`/admin/excom/${editingId}`, form)
        setMembers(prev => prev.map(m => m._id === editingId ? data.data : m))
      } else {
        const { data } = await api.post('/admin/excom', form)
        setMembers(prev => [...prev, data.data])
      }
      toast.success(editingId ? 'Member updated.' : 'Member added.')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return
    try {
      await api.delete(`/admin/excom/${id}`)
      setMembers(prev => prev.filter(m => m._id !== id))
      toast.success('Member deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  return (
    <section className="content-section active">
      <h1>Members Management</h1>
      <div className="section-header">
        <h2>ExCom Members</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add Member
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : (
        <div className="members-grid">
          {members.length > 0 ? members.map(member => (
            <div key={member._id} className="member-card">
              <div className="member-avatar">
                <img src={member.photo || 'https://randomuser.me/api/portraits/men/1.jpg'} alt={member.name} />
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-dept">{member.department}</p>
                <div className="member-contact" style={{ marginTop: '10px' }}>
                  {member.email && <a href={`mailto:${member.email}`}><i className="fas fa-envelope"></i></a>}
                  {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>}
                  {member.github && <a href={member.github} target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>}
                </div>
              </div>
              <div className="member-actions">
                <button type="button" onClick={() => openModal(member)} title="Edit"><i className="fas fa-edit"></i></button>
                <button type="button" onClick={() => handleDelete(member._id)} title="Delete" style={{ color: 'var(--danger-color)' }}><i className="fas fa-trash"></i></button>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-light)', padding: '20px' }}>No members yet. Click "Add Member" to add one.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="auth-header">
              <h2>{editingId ? 'Edit Member' : 'Add New Member'}</h2>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="e.g. Ahmed Ali" required />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-user-tag"></i> Role</label>
                  <input type="text" name="role" value={form.role} onChange={handleInputChange} placeholder="e.g. Chairperson" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-users"></i> Department</label>
                  <input type="text" name="department" value={form.department} onChange={handleInputChange} placeholder="e.g. Engineering" />
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-align-left"></i> Bio (optional)</label>
                <textarea name="bio" value={form.bio} onChange={handleInputChange} placeholder="Short bio..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="name@ieee.org" />
              </div>
              <div className="form-group">
                <label><i className="fab fa-linkedin"></i> LinkedIn URL (optional)</label>
                <input type="url" name="linkedin" value={form.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="form-group">
                <label><i className="fab fa-github"></i> GitHub URL (optional)</label>
                <input type="url" name="github" value={form.github} onChange={handleInputChange} placeholder="https://github.com/..." />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-sort-numeric-up"></i> Display Order</label>
                  <input type="number" name="order" value={form.order} onChange={handleInputChange} min="0" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '28px' }}>
                    <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handleInputChange} />
                    <label htmlFor="isActive" style={{ margin: 0 }}>Active (visible on website)</label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-camera"></i> Photo</label>
                <div className="profile-upload" style={{ marginTop: '10px' }}>
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--input-bg)' }}>
                      <i className="fas fa-user" style={{ color: 'var(--text-muted)' }}></i>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i> Upload Photo
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Member' : 'Save Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default MembersSection
