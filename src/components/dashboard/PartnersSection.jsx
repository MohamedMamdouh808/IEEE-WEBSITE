import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { normalizeUrl, isValidUrl } from '../../utils/url'
import { toast } from '../../utils/toast'

function PartnersSection() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', website: '', logo: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/partners')
      setPartners(data.data)
    } catch {
      setError('Failed to load partners.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPartners() }, [])

  const openModal = (partner = null) => {
    if (partner) {
      setEditingId(partner._id)
      setForm({ name: partner.name, category: partner.category || '', website: partner.website || '', logo: partner.logo || '' })
    } else {
      setEditingId(null)
      setForm({ name: '', category: '', website: '', logo: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null) }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Add the missing https:// as soon as the admin leaves the field, so what
  // they see in the form is exactly what the logo on the site will link to.
  const handleLinkBlur = (e) => {
    const { name, value } = e.target
    const normalized = normalizeUrl(value)
    if (normalized !== value) setForm(prev => ({ ...prev, [name]: normalized }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setForm(prev => ({ ...prev, logo: url }))
    } catch (err) {
      toast.error('Logo upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidUrl(form.website)) return toast.error('Website URL doesn\'t look like a valid link.')
    setSaving(true)
    try {
      const payload = { ...form, website: normalizeUrl(form.website) }
      if (editingId) {
        const { data } = await api.put(`/admin/partners/${editingId}`, payload)
        setPartners(prev => prev.map(p => p._id === editingId ? data.data : p))
      } else {
        const { data } = await api.post('/admin/partners', payload)
        setPartners(prev => [...prev, data.data])
      }
      toast.success(editingId ? 'Partner updated.' : 'Partner saved.')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this partner?')) return
    try {
      await api.delete(`/admin/partners/${id}`)
      setPartners(prev => prev.filter(p => p._id !== id))
      toast.success('Partner deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  return (
    <section className="content-section active">
      <h1>Partners</h1>
      <div className="section-header">
        <h2>Our Partners</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add Partner
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : (
        <div className="partners-grid">
          {partners.length > 0 ? partners.map(partner => (
            <div key={partner._id} className="partner-card">
              <div className="partner-logo">
                <img src={partner.logo || '/images/placeholder-logo.png'} alt={partner.name} />
              </div>
              <div className="partner-info">
                <p className="partner-type">{partner.category}</p>
                <h3>{partner.name}</h3>
                <div className="partner-contact">
                  {normalizeUrl(partner.website)
                    ? <a className="link-chip" href={normalizeUrl(partner.website)} target="_blank" rel="noopener noreferrer" title={partner.website}><i className="fas fa-external-link-alt"></i> Website</a>
                    : <span className="link-chip link-chip--empty"><i className="fas fa-unlink"></i> No link — logo not clickable</span>}
                </div>
                <div className="partner-actions">
                  <button type="button" className="action-btn mini" onClick={() => openModal(partner)}><i className="fas fa-edit"></i></button>
                  <button type="button" className="action-btn mini danger" onClick={() => handleDelete(partner._id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-light)', padding: '20px' }}>No partners yet. Click "Add Partner" to add one.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="auth-header">
              <h2>{editingId ? 'Edit Partner' : 'Add New Partner'}</h2>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-building"></i> Partner Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="e.g. Google" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-tag"></i> Category</label>
                <input type="text" name="category" value={form.category} onChange={handleInputChange} placeholder="e.g. Technology Partner" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-link"></i> Website URL (optional)</label>
                <input type="text" inputMode="url" name="website" value={form.website} onChange={handleInputChange} onBlur={handleLinkBlur} placeholder="example.com or https://example.com" />
                <small className="form-hint">Add one and the logo becomes clickable on the home page — it opens this site in a new tab. Leave it empty for a plain logo.</small>
              </div>
              <div className="form-group">
                <label><i className="fas fa-image"></i> Logo (URL or upload)</label>
                <input type="text" name="logo" value={form.logo} onChange={handleInputChange} placeholder="https://... or upload below" />
                <div className="profile-upload" style={{ marginTop: '10px' }}>
                  {form.logo && <img src={form.logo} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'contain', border: '1px solid var(--border-color)', background: 'white' }} />}
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i> Upload Logo
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={saving || uploading}>
                {uploading ? 'Uploading logo...' : saving ? 'Saving...' : editingId ? 'Update Partner' : 'Save Partner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default PartnersSection
