import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { compressImage } from '../../utils/imageCompressor'

function EventsSection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', date: '', location: '', attendanceCount: '', description: '', status: 'upcoming', image: '', registrationLink: '', agendaLink: '' })
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/events')
      setEvents(data.data)
    } catch {
      setError('Failed to load events.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  const openModal = (event = null) => {
    if (event) {
      setEditingId(event._id)
      setForm({
        title: event.title,
        date: event.date ? event.date.slice(0, 10) : '',
        location: event.location || '',
        attendanceCount: event.attendanceCount || '',
        description: event.description || '',
        status: event.status,
        image: event.image || '',
        registrationLink: event.registrationLink || '',
        agendaLink: event.agendaLink || '',
      })
    } else {
      setEditingId(null)
      setForm({ title: '', date: '', location: '', attendanceCount: '', description: '', status: 'upcoming', image: '', registrationLink: '', agendaLink: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null) }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.8)
        setForm(prev => ({ ...prev, image: compressed }))
      } catch (err) {
        console.error('Image compression failed', err)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, attendanceCount: form.attendanceCount ? Number(form.attendanceCount) : undefined }
      if (editingId) {
        const { data } = await api.put(`/admin/events/${editingId}`, payload)
        setEvents(prev => prev.map(ev => ev._id === editingId ? data.data : ev))
      } else {
        const { data } = await api.post('/admin/events', payload)
        setEvents(prev => [...prev, data.data])
      }
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await api.delete(`/admin/events/${id}`)
      setEvents(prev => prev.filter(ev => ev._id !== id))
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <section className="content-section active">
      <h1>Events Management</h1>
      {error && <p style={{ color: 'var(--danger-color)', marginBottom: '12px' }}>{error}</p>}
      <div className="section-header">
        <h2>All Events</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Add Event
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : (
        <div className="events-grid">
          {events.length > 0 ? events.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-card-header" style={{ padding: '0', position: 'relative' }}>
                <img src={event.image || '/images/placeholder-event.png'} alt={event.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="action-btn mini" onClick={() => openModal(event)} style={{ background: 'white', color: 'var(--primary-color)' }}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button type="button" className="action-btn mini danger" onClick={() => handleDelete(event._id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="event-card-body">
                <span className={`status-badge ${event.status}`} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--sidebar-active)', color: 'var(--primary-color)', marginBottom: '10px', display: 'inline-block' }}>
                  {event.status}
                </span>
                <h3>{event.title}</h3>
                <div className="event-date"><i className="fas fa-calendar-alt"></i> {event.date ? new Date(event.date).toLocaleDateString() : '—'}</div>
                <div className="event-location" style={{ marginTop: '5px' }}><i className="fas fa-map-marker-alt"></i> {event.location}</div>
                <div className="event-description" style={{ fontSize: '0.85rem', margin: '15px 0' }}>{event.description}</div>
              </div>
              <div className="event-card-footer">
                <div className="event-attendance"><i className="fas fa-users"></i> {event.attendanceCount ?? '—'} Expected</div>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-light)', padding: '20px' }}>No events yet. Click "Add Event" to create one.</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="auth-header">
              <h2>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-heading"></i> Event Title</label>
                <input type="text" name="title" value={form.title} onChange={handleInputChange} placeholder="e.g. Arduino Workshop" required />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-calendar-day"></i> Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-map-marker-alt"></i> Location</label>
                  <input type="text" name="location" value={form.location} onChange={handleInputChange} placeholder="e.g. Room 402" required />
                </div>
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-users"></i> Expected Attendance</label>
                  <input type="number" name="attendanceCount" value={form.attendanceCount} onChange={handleInputChange} placeholder="e.g. 50" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-info-circle"></i> Status</label>
                  <select name="status" value={form.status} onChange={handleInputChange}>
                    <option value="upcoming">Upcoming</option>
                    <option value="planning">Planning</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-align-left"></i> Description</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} placeholder="Enter event description..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', minHeight: '100px' }}></textarea>
              </div>
              <div className="form-group">
                <label><i className="fas fa-link"></i> Registration Link (optional)</label>
                <input type="url" name="registrationLink" value={form.registrationLink} onChange={handleInputChange} placeholder="https://forms.gle/..." />
              </div>
              <div className="form-group">
                <label><i className="fas fa-list-alt"></i> Agenda Link (optional)</label>
                <input type="url" name="agendaLink" value={form.agendaLink} onChange={handleInputChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label><i className="fas fa-image"></i> Event Poster (URL or upload)</label>
                <input type="text" name="image" value={form.image} onChange={handleInputChange} placeholder="https://... or upload below" />
                <div className="profile-upload" style={{ marginTop: '10px' }}>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i> Upload Poster
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default EventsSection
