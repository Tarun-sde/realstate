import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, List, PlusCircle, Users, LogOut, Edit2, Trash2,
  CheckCircle, XCircle, MapPin, TrendingUp, Eye, Plus, X, Save, ChevronDown, Upload, ImagePlus,
} from 'lucide-react'
import { useAuthStore, usePropertyStore } from '../store'
import supabase from '../config/supabase'
import toast from 'react-hot-toast'
import { BROKER_INFO } from '../data/mockData'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'listings', label: 'Listings', icon: List },
  { id: 'add', label: 'Add Property', icon: PlusCircle },
  { id: 'leads', label: 'Inquiries', icon: Users },
]

const EMPTY_FORM = {
  title: '', location: '', area_value: '', area_unit: 'sqft',
  price: '', price_display: '', status: 'available',
  description: '', facing: '', road_width: '', featured: false,
  lat: '25.5941', lng: '85.1376', owner_contact: '+91 98765 43210',
  images: ['/land1.png'],
}

export default function AdminPage() {
  const { user, isAdmin, logout } = useAuthStore()
  const { getProperties, getLeads, addProperty, updateProperty, deleteProperty, toggleSold, fetchLeads } = usePropertyStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [imgUrl, setImgUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isAdmin) fetchLeads()
  }, [isAdmin])

  if (!user || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Admin Access Required</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>You need to be logged in as an admin to access this page.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Go Home</Link>
        </div>
      </div>
    )
  }

  const properties = getProperties()
  const leads = getLeads()
  const available = properties.filter(p => p.status === 'available').length
  const sold = properties.filter(p => p.status === 'sold').length

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const addImage = () => {
    if (imgUrl.trim()) {
      setForm(p => ({ ...p, images: [...(p.images || []), imgUrl.trim()] }))
      setImgUrl('')
    }
  }

  const removeImage = (i) => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`)
        continue
      }
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 5MB limit.`)
        continue
      }
      const ext = file.name.split('.').pop()
      const fileName = `properties/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { upsert: false, contentType: file.type })
      if (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload "${file.name}": ${error.message}`)
        continue
      }
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path)
      uploaded.push(urlData.publicUrl)
    }
    if (uploaded.length > 0) {
      setForm(p => ({ ...p, images: [...(p.images || []), ...uploaded] }))
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded!`)
    }
    setUploading(false)
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = {
      ...form,
      area_value: parseFloat(form.area_value),
      price: parseFloat(form.price),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      images: form.images.length ? form.images : ['/land1.png'],
    }
    try {
      if (editing) {
        await updateProperty(editing, data)
        toast.success('Property updated successfully!')
        setEditing(null)
      } else {
        await addProperty(data)
        toast.success('Property added successfully!')
      }
      setForm(EMPTY_FORM)
      setTab('listings')
    } catch (err) {
      toast.error('Failed to save property. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (p) => {
    setForm({ ...p, images: p.images || ['/land1.png'] })
    setEditing(p.id)
    setTab('add')
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id) => {
    try {
      await deleteProperty(id)
      setDeleteConfirm(null)
      toast.success('Property deleted.')
    } catch (err) {
      toast.error('Failed to delete property.')
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: 'white' }}>
            Admin Panel
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {BROKER_INFO.name}
          </div>
        </div>

        <nav style={{ padding: '16px 10px', flex: 1 }}>
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  marginBottom: 4, fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                  background: tab === t.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: tab === t.id ? 'white' : 'rgba(255,255,255,0.65)',
                }}
              >
                <Icon size={18} />
                {t.label}
                {t.id === 'leads' && leads.length > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#f59e0b', color: 'white',
                    fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                  }}>
                    {leads.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontSize: 13, padding: '8px 14px',
          }}>
            <Eye size={16} /> View Website
          </Link>
          <button onClick={() => { logout(); navigate('/') }} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            color: '#f87171', background: 'transparent', border: 'none',
            cursor: 'pointer', fontSize: 13, padding: '8px 14px', borderRadius: 8,
          }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top Bar */}
        <div style={{
          background: 'white', padding: '0 28px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
            {TABS.find(t => t.id === tab)?.label}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a3c5e, #2563ab)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 14, fontWeight: 700,
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Admin</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                {[
                  { label: 'Total Properties', value: properties.length, color: '#1a3c5e', bg: '#eff6ff', icon: '🏡' },
                  { label: 'Available', value: available, color: '#059669', bg: '#f0fdf4', icon: '✅' },
                  { label: 'Sold', value: sold, color: '#dc2626', bg: '#fff1f2', icon: '🏷️' },
                  { label: 'Total Inquiries', value: leads.length, color: '#d97706', bg: '#fffbeb', icon: '📩' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'white', borderRadius: 16, padding: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent properties */}
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Listings</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Property', 'Location', 'Price', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 5).map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={p.images?.[0] || '/land1.png'} style={{ width: 40, height: 34, borderRadius: 6, objectFit: 'cover' }} alt="" />
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.title}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 14, color: '#64748b' }}>{p.location}</td>
                          <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#1a3c5e' }}>{p.price_display}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                              background: p.status === 'sold' ? '#fee2e2' : '#dcfce7',
                              color: p.status === 'sold' ? '#dc2626' : '#065f46',
                              textTransform: 'uppercase',
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button onClick={() => handleEdit(p)} style={{
                              background: 'none', border: '1px solid #e2e8f0', borderRadius: 6,
                              padding: '5px 10px', cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 500,
                            }}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LISTINGS */}
          {tab === 'listings' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-primary" onClick={() => { cancelEdit(); setTab('add') }}>
                  <Plus size={16} /> Add Property
                </button>
              </div>
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['#', 'Property', 'Location', 'Price', 'Size', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p, i) => (
                        <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>{i + 1}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={p.images?.[0] || '/land1.png'} style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} alt="" />
                              <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                {p.title}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{p.location}</td>
                          <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#1a3c5e', whiteSpace: 'nowrap' }}>{p.price_display}</td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                            {p.area_value} {p.area_unit}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => { toggleSold(p.id); toast.success(`Marked as ${p.status === 'sold' ? 'available' : 'sold'}`) }}
                              style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                background: p.status === 'sold' ? '#fee2e2' : '#dcfce7',
                                color: p.status === 'sold' ? '#dc2626' : '#065f46',
                                textTransform: 'uppercase',
                              }}
                            >
                              {p.status}
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Link to={`/property/${p.id}`} style={{
                                padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                                color: '#374151', display: 'flex', alignItems: 'center', textDecoration: 'none',
                              }}>
                                <Eye size={14} />
                              </Link>
                              <button onClick={() => handleEdit(p)} style={{
                                padding: '6px 8px', borderRadius: 6, border: '1px solid #bfdbfe',
                                background: '#eff6ff', color: '#1a3c5e', cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteConfirm(p.id)} style={{
                                padding: '6px 8px', borderRadius: 6, border: '1px solid #fecaca',
                                background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADD / EDIT PROPERTY */}
          {tab === 'add' && (
            <div className="animate-fadeIn" style={{ maxWidth: 750 }}>
              {editing && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
                  padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
                    ✏️ Editing existing property
                  </span>
                  <button onClick={cancelEdit} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 600, fontSize: 14,
                  }}>
                    Cancel Edit
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: 24 }}>
                  {/* Basic Info */}
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Property Information</h3>
                    <div style={{ display: 'grid', gap: 16 }}>
                      <div>
                        <label className="form-label">Property Title *</label>
                        <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Prime Residential Plot – Boring Road" required />
                      </div>
                      <div>
                        <label className="form-label">Location *</label>
                        <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Boring Road, Patna" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Price (₹) *</label>
                          <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="4800000" required />
                        </div>
                        <div>
                          <label className="form-label">Price Display *</label>
                          <input className="form-input" name="price_display" value={form.price_display} onChange={handleChange} placeholder="₹48 Lakh" required />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Area Value *</label>
                          <input className="form-input" name="area_value" type="number" step="0.01" value={form.area_value} onChange={handleChange} placeholder="2400" required />
                        </div>
                        <div>
                          <label className="form-label">Area Unit *</label>
                          <select className="form-input" name="area_unit" value={form.area_unit} onChange={handleChange}>
                            <option value="sqft">Square Feet (sq.ft)</option>
                            <option value="acre">Acre</option>
                            <option value="bigha">Bigha</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Facing</label>
                          <select className="form-input" name="facing" value={form.facing} onChange={handleChange}>
                            {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(d => (
                              <option key={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Road Width</label>
                          <input className="form-input" name="road_width" value={form.road_width} onChange={handleChange} placeholder="30 feet" />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Description *</label>
                        <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the property..." required style={{ resize: 'vertical' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Status</label>
                          <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Latitude</label>
                          <input className="form-input" name="lat" value={form.lat} onChange={handleChange} placeholder="25.5941" />
                        </div>
                        <div>
                          <label className="form-label">Longitude</label>
                          <input className="form-input" name="lng" value={form.lng} onChange={handleChange} placeholder="85.1376" />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Owner Contact</label>
                        <input className="form-input" name="owner_contact" value={form.owner_contact} onChange={handleChange} placeholder="+91 98765 43210" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleChange} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                        <label htmlFor="featured" style={{ fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                          Mark as Featured Listing
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Property Images</h3>

                    {/* ── Upload from Device ── */}
                    <div
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #bfdbfe', borderRadius: 12,
                        padding: '28px 20px', textAlign: 'center',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        background: uploading ? '#f8fafc' : '#eff6ff',
                        marginBottom: 16, transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = '#dbeafe' }}
                      onMouseLeave={e => { e.currentTarget.style.background = uploading ? '#f8fafc' : '#eff6ff' }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={uploadImages}
                      />
                      {uploading ? (
                        <>
                          <div style={{
                            width: 40, height: 40, border: '3px solid #bfdbfe',
                            borderTopColor: '#2563ab', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 10px',
                          }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>Uploading images...</div>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={32} color="#2563ab" style={{ margin: '0 auto 10px' }} />
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
                            Click to Upload from Device
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            JPG, PNG, WEBP • Max 5MB per image • Multiple files supported
                          </div>
                        </>
                      )}
                    </div>

                    {/* ── Or paste URL ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>or paste image URL</span>
                      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <input
                        className="form-input" style={{ flex: 1 }}
                        value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                        placeholder="https://... or /land1.png"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                      />
                      <button type="button" onClick={addImage} className="btn-primary" style={{ padding: '12px 20px', flexShrink: 0 }}>
                        Add
                      </button>
                    </div>

                    {/* ── Quick presets ── */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center' }}>Presets:</span>
                      {['/land1.png', '/land2.png', '/land3.png', '/land4.png', '/land5.png'].map(img => (
                        <button
                          key={img} type="button"
                          onClick={() => setForm(p => ({ ...p, images: p.images.includes(img) ? p.images : [...(p.images || []), img] }))}
                          style={{
                            padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6,
                            fontSize: 12, cursor: 'pointer', background: 'white', color: '#374151',
                          }}
                        >
                          {img}
                        </button>
                      ))}
                    </div>

                    {/* ── Current images ── */}
                    {form.images?.length > 0 && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                          Selected Images ({form.images.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {(form.images || []).map((img, i) => (
                            <div key={i} style={{ position: 'relative', width: 90 }}>
                              <img src={img} alt="" style={{ width: 90, height: 68, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                              <button
                                type="button" onClick={() => removeImage(i)}
                                style={{
                                  position: 'absolute', top: -6, right: -6, background: '#dc2626',
                                  border: 'none', borderRadius: '50%', width: 22, height: 22,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <X size={12} color="white" />
                              </button>
                              {i === 0 && (
                                <div style={{
                                  position: 'absolute', bottom: 0, left: 0, right: 0,
                                  background: 'rgba(0,0,0,0.55)', borderRadius: '0 0 8px 8px',
                                  fontSize: 9, color: 'white', textAlign: 'center', padding: '2px 0', fontWeight: 700,
                                }}>COVER</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Submit */}
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={saving}>
                    {saving ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                        {editing ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      <><Save size={16} /> {editing ? 'Update Property' : 'Add Property'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LEADS */}
          {tab === 'leads' && (
            <div className="animate-fadeIn">
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {leads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <h3 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>No Inquiries Yet</h3>
                    <p style={{ color: '#64748b', fontSize: 14 }}>When buyers submit inquiries, they will appear here.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['#', 'Name', 'Phone', 'Property Interested', 'Date'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead, i) => (
                          <tr key={lead.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>{i + 1}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{lead.name}</div>
                              {lead.user_email && <div style={{ fontSize: 12, color: '#64748b' }}>{lead.user_email}</div>}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <a href={`tel:${lead.phone}`} style={{ fontSize: 14, fontWeight: 600, color: '#1a3c5e', textDecoration: 'none' }}>
                                {lead.phone}
                              </a>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lead.property_title}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
                             {new Date(lead.created_at || lead.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delete Property?</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>This action cannot be undone. The property will be permanently removed.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1, padding: '12px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
