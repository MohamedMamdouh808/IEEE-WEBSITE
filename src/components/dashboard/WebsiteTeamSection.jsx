import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { toast } from '../../utils/toast'

const TIER_LABELS = { 1: 'Tier I — Leadership', 2: 'Tier II — Design', 3: 'Tier III — Engineering' }

const emptyForm = { name: '', role: '', tier: 2, photo: '', email: '', linkedin: '', github: '', order: 0, isActive: true }

function WebsiteTeamSection() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/website-team')
      setMembers(data.data)
    } catch {
      setError('Failed to load website team.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const openModal = (member = null) => {
    if (member) {
      setEditingId(member._id)
      setForm({
        name: member.name, role: member.role, tier: member.tier,
        photo: member.photo || '', email: member.email || '',
        linkedin: member.linkedin || '', github: member.github || '',
        order: member.order, isActive: member.isActive,
      })
    } else {
      setEditingId(null)
      setForm(emptyForm)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null) }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setForm(prev => ({ ...prev, photo: url }))
    } catch (err) {
      toast.error('Photo upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, tier: Number(form.tier), order: Number(form.order) }
      if (editingId) {
        const { data } = await api.put(`/admin/website-team/${editingId}`, payload)
        setMembers(prev => prev.map(m => m._id === editingId ? data.data : m))
      } else {
        const { data } = await api.post('/admin/website-team', payload)
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
    if (!window.confirm('Delete this team member?')) return
    try {
      await api.delete(`/admin/website-team/${id}`)
      setMembers(prev => prev.filter(m => m._id !== id))
      toast.success('Team member deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  const grouped = { 1: [], 2: [], 3: [] }
  members.forEach(m => { if (grouped[m.tier]) grouped[m.tier].push(m) })

  return (
    <section className="content-section active">
      <h1>Website Team</h1>
      <div className="section-header">
        <h2>Team Members</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add Member
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : (
        [1, 2, 3].map(tier => grouped[tier].length > 0 && (
          <div key={tier} style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              {TIER_LABELS[tier]}
            </h3>
            <div className="partners-grid">
              {grouped[tier].map(member => (
                <div key={member._id} className="partner-card">
                  <div className="partner-logo">
                    {member.photo
                      ? <img src={member.photo} alt={member.name} style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'top' }} />
                      : <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}><i className="fas fa-user" /></div>
                    }
                  </div>
                  <div className="partner-info">
                    <p className="partner-type">{member.role}</p>
                    <h3>{member.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: member.isActive ? 'var(--success-color)' : 'var(--text-light)' }}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </p>
                    <div className="partner-actions">
                      <button type="button" className="action-btn mini" onClick={() => openModal(member)}><i className="fas fa-edit"></i></button>
                      <button type="button" className="action-btn mini danger" onClick={() => handleDelete(member._id)}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="auth-header">
              <h2>{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="e.g. Mennatallah Mostafa" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-briefcase"></i> Role</label>
                <input type="text" name="role" value={form.role} onChange={handleInputChange} placeholder="e.g. Webmaster" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-layer-group"></i> Tier</label>
                <select name="tier" value={form.tier} onChange={handleInputChange}>
                  <option value={1}>Tier I — Leadership</option>
                  <option value={2}>Tier II — Design</option>
                  <option value={3}>Tier III — Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-sort-numeric-up"></i> Display Order</label>
                <input type="number" name="order" value={form.order} onChange={handleInputChange} min="0" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email (optional)</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="name@example.com" />
              </div>
              <div className="form-group">
                <label><i className="fab fa-linkedin"></i> LinkedIn URL (optional)</label>
                <input type="url" name="linkedin" value={form.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="form-group">
                <label><i className="fab fa-github"></i> GitHub URL (optional)</label>
                <input type="url" name="github" value={form.github} onChange={handleInputChange} placeholder="https://github.com/..." />
              </div>
              <div className="form-group">
                <label><i className="fas fa-image"></i> Photo (URL or upload)</label>
                <input type="text" name="photo" value={form.photo} onChange={handleInputChange} placeholder="https://... or upload below" />
                <div className="profile-upload" style={{ marginTop: '10px' }}>
                  {form.photo && <img src={form.photo} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid var(--border-color)' }} />}
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i> Upload Photo
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handleInputChange} />
                <label htmlFor="isActive" style={{ margin: 0 }}>Active (visible on website)</label>
              </div>
              <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={saving || uploading}>
                {uploading ? 'Uploading photo...' : saving ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default WebsiteTeamSection
