import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { uploadToCloudinary } from '../../utils/cloudinary'

function GallerySection() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ src: '', alt: '', order: 0, isActive: true })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/gallery')
      setPhotos(data.data)
    } catch {
      setError('Failed to load gallery.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPhotos() }, [])

  const openModal = (photo = null) => {
    if (photo) {
      setEditingId(photo._id)
      setForm({ ...photo })
    } else {
      setEditingId(null)
      setForm({ src: '', alt: '', order: 0, isActive: true })
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
      setForm(prev => ({ ...prev, src: url }))
    } catch (err) {
      setError('Photo upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const { data } = await api.put(`/admin/gallery/${editingId}`, form)
        setPhotos(prev => prev.map(p => p._id === editingId ? data.data : p))
      } else {
        const { data } = await api.post('/admin/gallery', form)
        setPhotos(prev => [...prev, data.data])
      }
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      await api.delete(`/admin/gallery/${id}`)
      setPhotos(prev => prev.filter(p => p._id !== id))
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <section className="content-section active">
      <h1>Gallery Management</h1>
      {error && <p style={{ color: 'var(--danger-color)', marginBottom: '12px' }}>{error}</p>}
      <div className="section-header">
        <h2>Homepage Catalogue Photos</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add Photo
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : (
        <div className="partners-grid">
          {photos.length > 0 ? photos.map(photo => (
            <div key={photo._id} className="partner-card" style={{ opacity: photo.isActive ? 1 : 0.6 }}>
              <div className="partner-logo" style={{ background: '#f5f5f5', overflow: 'hidden' }}>
                <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="partner-info">
                <h3>{photo.alt || 'No Alt Text'}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order: {photo.order}</p>
                <p style={{ fontSize: '0.75rem', color: photo.isActive ? 'var(--success-color)' : 'var(--text-light)' }}>
                  {photo.isActive ? 'Active' : 'Inactive'}
                </p>
                <div className="partner-actions">
                  <button type="button" className="action-btn mini" onClick={() => openModal(photo)}><i className="fas fa-edit"></i></button>
                  <button type="button" className="action-btn mini danger" onClick={() => handleDelete(photo._id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-light)', padding: '20px' }}>No photos yet. Click "Add Photo" to add one.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="auth-header">
              <h2>{editingId ? 'Edit Photo' : 'Add Photo to Gallery'}</h2>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-image"></i> Photo (URL or upload)</label>
                <input type="text" name="src" value={form.src} onChange={handleInputChange} placeholder="https://... or upload below" />
                <div className="profile-upload" style={{ marginTop: '10px' }}>
                  {form.src && <img src={form.src.length > 100 ? form.src : (form.src.startsWith('/') ? 'https://ieee-website-2026.vercel.app' + form.src : form.src)} alt="Preview" style={{ width: '120px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)', background: 'white' }} />}
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i> Compress & Upload Photo
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-heading"></i> Alt Text</label>
                <input type="text" name="alt" value={form.alt} onChange={handleInputChange} placeholder="Describe the photo" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-sort-numeric-up"></i> Display Order</label>
                <input type="number" name="order" value={form.order} onChange={handleInputChange} min="0" />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handleInputChange} />
                <label htmlFor="isActive" style={{ margin: 0 }}>Active (visible on website)</label>
              </div>
              <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={saving || uploading}>
                {uploading ? 'Uploading photo...' : saving ? 'Saving...' : editingId ? 'Update Photo' : 'Save Photo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default GallerySection
