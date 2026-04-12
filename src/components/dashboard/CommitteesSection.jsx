import { useState, useRef, useEffect } from 'react'
import api from '../../api/index'
import { compressImage } from '../../utils/imageCompressor'
import { toast } from '../../utils/toast'

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_COMMITTEE = {
  name: '', slug: '', category: 'technical', icon: '', image: '',
  tagline: '', shortDesc: '', order: 0, isActive: true,
  goals: [], activities: [],
}

const EMPTY_MEMBER = {
  name: '', roleType: 'head', role: '', bio: '',
  photo: '', email: '', linkedin: '', github: '', order: 0, isActive: true,
}

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// ── Main component ────────────────────────────────────────────────────────────

function CommitteesSection() {
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Committee modal
  const [committeeModal, setCommitteeModal] = useState(false)
  const [editingCommittee, setEditingCommittee] = useState(null) // null = new
  const [cForm, setCForm] = useState(EMPTY_COMMITTEE)
  const [saving, setSaving] = useState(false)
  const imageInputRef = useRef(null)

  // Members modal
  const [membersModal, setMembersModal] = useState(false)
  const [activeCommittee, setActiveCommittee] = useState(null) // the committee being managed
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)

  // Member edit modal (nested inside members modal)
  const [memberModal, setMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [mForm, setMForm] = useState(EMPTY_MEMBER)
  const [memberSaving, setMemberSaving] = useState(false)
  const photoInputRef = useRef(null)

  // ── Committees CRUD ───────────────────────────────────────────────────────

  const fetchCommittees = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/committees')
      setCommittees(data.data)
    } catch {
      setError('Failed to load committees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCommittees() }, [])

  const openCommitteeModal = (committee = null) => {
    setError('')
    if (committee) {
      setEditingCommittee(committee._id)
      setCForm({
        name: committee.name,
        slug: committee.slug,
        category: committee.category,
        icon: committee.icon || '',
        image: committee.image || '',
        tagline: committee.tagline || '',
        shortDesc: committee.shortDesc || '',
        order: committee.order ?? 0,
        isActive: committee.isActive ?? true,
        goals: committee.goals ? committee.goals.map(g => ({ ...g })) : [],
        activities: committee.activities ? committee.activities.map(a => ({ ...a })) : [],
      })
    } else {
      setEditingCommittee(null)
      setCForm(EMPTY_COMMITTEE)
    }
    setCommitteeModal(true)
  }

  const closeCommitteeModal = () => { setCommitteeModal(false); setEditingCommittee(null) }

  const handleCChange = (e) => {
    const { name, value, type, checked } = e.target
    setCForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Auto-slug from name if creating new
      ...(name === 'name' && !editingCommittee ? { slug: slugify(value) } : {}),
    }))
  }

  const handleCImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 800, 800, 0.8)
      setCForm(prev => ({ ...prev, image: compressed }))
    } catch(err) { console.error(err) }
  }

  // Goals
  const addGoal = () => setCForm(prev => ({ ...prev, goals: [...prev.goals, { title: '', desc: '' }] }))
  const removeGoal = (i) => setCForm(prev => ({ ...prev, goals: prev.goals.filter((_, idx) => idx !== i) }))
  const updateGoal = (i, field, val) =>
    setCForm(prev => ({ ...prev, goals: prev.goals.map((g, idx) => idx === i ? { ...g, [field]: val } : g) }))

  // Activities
  const addActivity = () => setCForm(prev => ({ ...prev, activities: [...prev.activities, { title: '', desc: '' }] }))
  const removeActivity = (i) => setCForm(prev => ({ ...prev, activities: prev.activities.filter((_, idx) => idx !== i) }))
  const updateActivity = (i, field, val) =>
    setCForm(prev => ({ ...prev, activities: prev.activities.map((a, idx) => idx === i ? { ...a, [field]: val } : a) }))

  const handleCommitteeSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...cForm, order: Number(cForm.order) }
      if (editingCommittee) {
        const { data } = await api.put(`/admin/committees/${editingCommittee}`, payload)
        setCommittees(prev => prev.map(c => c._id === editingCommittee ? data.data : c))
      } else {
        const { data } = await api.post('/admin/committees', payload)
        setCommittees(prev => [...prev, data.data])
      }
      toast.success(editingCommittee ? 'Committee updated.' : 'Committee created.')
      closeCommitteeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (committee) => {
    try {
      const { data } = await api.put(`/admin/committees/${committee._id}`, { isActive: !committee.isActive })
      setCommittees(prev => prev.map(c => c._id === committee._id ? data.data : c))
      toast.success('Status updated.')
    } catch {
      toast.error('Failed to toggle status.')
    }
  }

  const handleCommitteeDelete = async (id) => {
    if (!window.confirm('Delete this committee? This will NOT delete its members automatically.')) return
    try {
      await api.delete(`/admin/committees/${id}`)
      setCommittees(prev => prev.filter(c => c._id !== id))
      toast.success('Committee deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  // ── Members CRUD ──────────────────────────────────────────────────────────

  const openMembersModal = async (committee) => {
    setActiveCommittee(committee)
    setMembersModal(true)
    setMembersLoading(true)
    try {
      const { data } = await api.get(`/admin/members?committee=${committee._id}`)
      setMembers(data.data)
    } catch {
      setError('Failed to load members.')
    } finally {
      setMembersLoading(false)
    }
  }

  const closeMembersModal = () => { setMembersModal(false); setActiveCommittee(null); setMembers([]) }

  const openMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member._id)
      setMForm({
        name: member.name,
        roleType: member.roleType,
        role: member.role || '',
        bio: member.bio || '',
        photo: member.photo || '',
        email: member.email || '',
        linkedin: member.linkedin || '',
        github: member.github || '',
        stars: member.stars ?? '',
        order: member.order ?? 0,
        isActive: member.isActive ?? true,
      })
    } else {
      setEditingMember(null)
      setMForm(EMPTY_MEMBER)
    }
    setMemberModal(true)
  }

  const closeMemberModal = () => { setMemberModal(false); setEditingMember(null) }

  const handleMChange = (e) => {
    const { name, value, type, checked } = e.target
    setMForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 400, 400, 0.8)
      setMForm(prev => ({ ...prev, photo: compressed }))
    } catch(err) { console.error(err) }
  }

  const handleMemberSubmit = async (e) => {
    e.preventDefault()
    setMemberSaving(true)
    try {
      const payload = {
        ...mForm,
        committee: activeCommittee._id,
        order: Number(mForm.order),
      }
      if (editingMember) {
        const { data } = await api.put(`/admin/members/${editingMember}`, payload)
        setMembers(prev => prev.map(m => m._id === editingMember ? data.data : m))
      } else {
        const { data } = await api.post('/admin/members', payload)
        setMembers(prev => [...prev, data.data])
      }
      toast.success(editingMember ? 'Member updated.' : 'Member added.')
      closeMemberModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setMemberSaving(false)
    }
  }

  const handleMemberDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return
    try {
      await api.delete(`/admin/members/${id}`)
      setMembers(prev => prev.filter(m => m._id !== id))
      toast.success('Member deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const roleTypeLabel = { head: 'Head', vice_head: 'Vice Head' }
  const categoryColor = { technical: '#00629b', 'non-technical': '#78be20' }

  return (
    <section className="content-section active">
      <h1>Committees Management</h1>
      {error && <p style={{ color: 'var(--danger-color)', marginBottom: '12px' }}>{error}</p>}

      <div className="section-header">
        <h2>All Committees</h2>
        <div className="section-actions">
          <button type="button" className="action-btn" onClick={() => openCommitteeModal()}>
            <i className="fas fa-plus"></i> Add Committee
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading...</p>
      ) : committees.length === 0 ? (
        <p style={{ color: 'var(--text-light)', padding: '20px' }}>No committees yet. Click "Add Committee" to create one.</p>
      ) : (
        <div className="events-grid">
          {committees.map(c => (
            <div key={c._id} className="event-card" style={{ opacity: c.isActive ? 1 : 0.6 }}>
              <div className="event-card-header" style={{ padding: 0, position: 'relative' }}>
                {c.image ? (
                  <img src={c.image?.startsWith('/') ? 'https://ieee-website-2026.vercel.app' + c.image : c.image} alt={c.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <div style={{ display: c.image ? 'none' : 'flex', width: '100%', height: '140px', background: 'var(--primary-color)', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${c.icon || 'fa-users'}`} style={{ fontSize: '3rem', color: 'white', opacity: 0.8 }}></i>
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  <button type="button" className="action-btn mini" title="Edit" onClick={() => openCommitteeModal(c)} style={{ background: 'white', color: 'var(--primary-color)' }}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button type="button" className="action-btn mini" title={c.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(c)} style={{ background: 'white', color: c.isActive ? 'var(--success-color)' : 'var(--text-muted)' }}>
                    <i className={`fas ${c.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                  </button>
                  <button type="button" className="action-btn mini danger" title="Delete" onClick={() => handleCommitteeDelete(c._id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: categoryColor[c.category] || '#333', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {c.category}
                </span>
              </div>

              <div className="event-card-body">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.icon && <i className={`fas ${c.icon}`} style={{ color: 'var(--primary-color)' }}></i>}
                  {c.name}
                </h3>
                {c.tagline && <p style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '0.82rem', margin: '4px 0 8px' }}>{c.tagline}</p>}
                {c.shortDesc && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{c.shortDesc}</p>}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span><i className="fas fa-link"></i> /{c.slug}</span>
                  <span style={{ marginLeft: '12px' }}><i className="fas fa-sort-numeric-up"></i> Order: {c.order}</span>
                </div>
              </div>

              <div className="event-card-footer">
                <button type="button" className="action-btn" onClick={() => openMembersModal(c)} style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-users"></i> Manage Members
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Committee Add/Edit Modal ───────────────────────────────────────── */}
      {committeeModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <span className="close-modal" onClick={closeCommitteeModal}>&times;</span>
            <div className="auth-header">
              <h2>{editingCommittee ? 'Edit Committee' : 'Add New Committee'}</h2>
            </div>
            <form className="auth-form" onSubmit={handleCommitteeSubmit}>

              {/* Basic info */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label><i className="fas fa-heading"></i> Committee Name</label>
                  <input type="text" name="name" value={cForm.name} onChange={handleCChange} placeholder="e.g. Artificial Intelligence" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-link"></i> Slug</label>
                  <input type="text" name="slug" value={cForm.slug} onChange={handleCChange} placeholder="e.g. ai" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-tag"></i> Category</label>
                  <select name="category" value={cForm.category} onChange={handleCChange}>
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non-Technical</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-icons"></i> Icon (FA class)</label>
                  <input type="text" name="icon" value={cForm.icon} onChange={handleCChange} placeholder="e.g. fa-brain" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label><i className="fas fa-sort-numeric-up"></i> Order</label>
                  <input type="number" name="order" value={cForm.order} onChange={handleCChange} min="0" />
                </div>
              </div>

              <div className="form-group">
                <label><i className="fas fa-quote-left"></i> Tagline</label>
                <input type="text" name="tagline" value={cForm.tagline} onChange={handleCChange} placeholder="One-liner that appears on the card" />
              </div>

              <div className="form-group">
                <label><i className="fas fa-align-left"></i> Short Description</label>
                <textarea name="shortDesc" value={cForm.shortDesc} onChange={handleCChange} placeholder="2-3 sentence overview" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', minHeight: '80px' }} />
              </div>

              <div className="form-group">
                <label><i className="fas fa-image"></i> Cover Image (URL or upload)</label>
                <input type="text" name="image" value={cForm.image} onChange={handleCChange} placeholder="https://..." />
                <div style={{ marginTop: '8px' }}>
                  <input type="file" ref={imageInputRef} onChange={handleCImageUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" className="upload-btn" onClick={() => imageInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt"></i> Upload Image
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="isActive" id="c-isActive" checked={cForm.isActive} onChange={handleCChange} />
                <label htmlFor="c-isActive" style={{ margin: 0 }}>Active (visible on public site)</label>
              </div>

              {/* Goals */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong><i className="fas fa-bullseye"></i> Goals</strong>
                  <button type="button" className="action-btn mini" onClick={addGoal}><i className="fas fa-plus"></i> Add</button>
                </div>
                {cForm.goals.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start', background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Goal Title</label>
                        <input type="text" value={g.title} onChange={e => updateGoal(i, 'title', e.target.value)} placeholder="e.g. Explore AI Concepts" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Goal Description</label>
                        <input type="text" value={g.desc} onChange={e => updateGoal(i, 'desc', e.target.value)} placeholder="e.g. Introduce members to..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                      </div>
                    </div>
                    <button type="button" className="action-btn mini danger" style={{ marginTop: '26px' }} onClick={() => removeGoal(i)}><i className="fas fa-trash"></i></button>
                  </div>
                ))}
              </div>

              {/* Activities */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong><i className="fas fa-running"></i> Activities</strong>
                  <button type="button" className="action-btn mini" onClick={addActivity}><i className="fas fa-plus"></i> Add</button>
                </div>
                {cForm.activities.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start', background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activity Title</label>
                        <input type="text" value={a.title} onChange={e => updateActivity(i, 'title', e.target.value)} placeholder="e.g. Educational Sessions" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activity Description</label>
                        <input type="text" value={a.desc} onChange={e => updateActivity(i, 'desc', e.target.value)} placeholder="What happens in this activity..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                      </div>
                    </div>
                    <button type="button" className="action-btn mini danger" style={{ marginTop: '26px' }} onClick={() => removeActivity(i)}><i className="fas fa-trash"></i></button>
                  </div>
                ))}
              </div>

              <button type="submit" className="auth-button" style={{ marginTop: '24px' }} disabled={saving}>
                {saving ? 'Saving...' : editingCommittee ? 'Update Committee' : 'Create Committee'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Members Modal ─────────────────────────────────────────────────── */}
      {membersModal && activeCommittee && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <span className="close-modal" onClick={closeMembersModal}>&times;</span>
            <div className="auth-header">
              <h2>
                {activeCommittee.icon && <i className={`fas ${activeCommittee.icon}`} style={{ marginRight: '8px' }}></i>}
                {activeCommittee.name} — Members
              </h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button type="button" className="action-btn" onClick={() => openMemberModal()}>
                <i className="fas fa-plus"></i> Add Member
              </button>
            </div>

            {membersLoading ? (
              <p style={{ color: 'var(--text-light)', padding: '20px' }}>Loading members...</p>
            ) : members.length === 0 ? (
              <p style={{ color: 'var(--text-light)', padding: '20px' }}>No members yet. Add the head and vice head(s).</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['head', 'vice_head'].map(type => {
                  const group = members.filter(m => m.roleType === type)
                  if (group.length === 0) return null
                  return (
                    <div key={type}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', marginTop: '8px' }}>
                        {roleTypeLabel[type]}
                      </div>
                      {group.map(m => (
                        <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '8px', opacity: m.isActive ? 1 : 0.5 }}>
                          <img
                            src={m.photo || '/images/placeholder-avatar.png'}
                            alt={m.name}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            onError={e => { e.target.src = '/images/ieeebluelogo.png' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600 }}>{m.name}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.role}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button type="button" className="action-btn mini" onClick={() => openMemberModal(m)} style={{ background: 'var(--input-bg)', color: 'var(--primary-color)' }}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button type="button" className="action-btn mini danger" onClick={() => handleMemberDelete(m._id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Member add/edit sub-modal */}
            {memberModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '30px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
                  <span className="close-modal" onClick={closeMemberModal} style={{ top: '15px', right: '15px' }}>&times;</span>
                  <h2 style={{ marginBottom: '20px' }}>{editingMember ? 'Edit Member' : 'Add Member'}</h2>
                  <form className="auth-form" onSubmit={handleMemberSubmit}>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 2 }}>
                        <label><i className="fas fa-user"></i> Full Name</label>
                        <input type="text" name="name" value={mForm.name} onChange={handleMChange} placeholder="Firstname Lastname" required />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label><i className="fas fa-id-badge"></i> Role Type</label>
                        <select name="roleType" value={mForm.roleType} onChange={handleMChange}>
                          <option value="head">Head</option>
                          <option value="vice_head">Vice Head</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 2 }}>
                        <label><i className="fas fa-briefcase"></i> Role / Title</label>
                        <input type="text" name="role" value={mForm.role} onChange={handleMChange} placeholder="e.g. AI Head, Cybersecurity Researcher" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label><i className="fas fa-align-left"></i> Bio</label>
                      <textarea name="bio" value={mForm.bio} onChange={handleMChange} placeholder="Short bio..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', minHeight: '70px' }} />
                    </div>

                    <div className="form-group">
                      <label><i className="fas fa-image"></i> Photo (URL or upload)</label>
                      <input type="text" name="photo" value={mForm.photo} onChange={handleMChange} placeholder="https://..." />
                      <div style={{ marginTop: '8px' }}>
                        <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                        <button type="button" className="upload-btn" onClick={() => photoInputRef.current.click()}>
                          <i className="fas fa-cloud-upload-alt"></i> Upload Photo
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label><i className="fas fa-envelope"></i> Email</label>
                        <input type="email" name="email" value={mForm.email} onChange={handleMChange} placeholder="email@example.com" />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label><i className="fab fa-linkedin"></i> LinkedIn URL</label>
                        <input type="text" name="linkedin" value={mForm.linkedin} onChange={handleMChange} placeholder="https://linkedin.com/in/..." />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label><i className="fab fa-github"></i> GitHub URL</label>
                        <input type="text" name="github" value={mForm.github} onChange={handleMChange} placeholder="https://github.com/..." />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label><i className="fas fa-sort-numeric-up"></i> Order</label>
                        <input type="number" name="order" value={mForm.order} onChange={handleMChange} min="0" />
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" name="isActive" id="m-isActive" checked={mForm.isActive} onChange={handleMChange} />
                      <label htmlFor="m-isActive" style={{ margin: 0 }}>Active</label>
                    </div>

                    <button type="submit" className="auth-button" style={{ marginTop: '20px' }} disabled={memberSaving}>
                      {memberSaving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default CommitteesSection
