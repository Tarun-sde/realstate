import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Maximize2, ArrowLeft, Phone, CheckCircle, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { usePropertyStore, useAuthStore, useUIStore } from '../store'
import { BROKER_INFO } from '../data/mockData'
import PropertyCard from '../components/PropertyCard'

const formatArea = (value, unit) => {
  if (unit === 'sqft') return `${value.toLocaleString()} sq.ft`
  if (unit === 'acre') return `${value} Acre`
  if (unit === 'bigha') return `${value} Bigha`
  return `${value} ${unit}`
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, getProperties } = usePropertyStore()
  const { user } = useAuthStore()
  const { openLogin, openLeadModal, leadSubmittedProperties } = useUIStore()

  const [currentImg, setCurrentImg] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const property = getById(id)

  useEffect(() => {
    window.scrollTo(0, 0)
    setCurrentImg(0)
  }, [id])

  // Check if lead already submitted for this property
  const leadSubmitted = leadSubmittedProperties?.has?.(id)

  if (!property) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏷️</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Property Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>This listing may have been removed or the link is incorrect.</p>
        <Link to="/listings" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Listings</Link>
      </div>
    )
  }

  const images = property.images || ['/land1.png']
  const isSold = property.status === 'sold'

  const prevImg = () => setCurrentImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setCurrentImg(i => (i + 1) % images.length)

  const handleGetDetails = () => {
    if (!user) { openLogin(); return }
    openLeadModal(property.id)
  }

  // Similar properties
  const similar = getProperties()
    .filter(p => p.id !== id && p.status !== 'sold')
    .slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14,
          }}>
            <ArrowLeft size={16} /> Back
          </button>
          <span style={{ color: '#e2e8f0' }}>›</span>
          <Link to="/listings" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>Listings</Link>
          <span style={{ color: '#e2e8f0' }}>›</span>
          <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {property.title}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }} className="detail-grid">
          {/* Left Column */}
          <div>
            {/* Image Gallery */}
            <div style={{ marginBottom: 28 }}>
              {/* Main Image */}
              <div style={{
                position: 'relative', borderRadius: 16, overflow: 'hidden',
                height: 420, background: '#0f172a',
              }}>
                <img
                  src={images[currentImg]}
                  alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
                />
                {isSold && (
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    background: '#dc2626', color: 'white', fontWeight: 700,
                    fontSize: 13, letterSpacing: 1.5, padding: '6px 14px', borderRadius: 6,
                    textTransform: 'uppercase',
                  }}>
                    ● SOLD
                  </div>
                )}
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImg} style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                      width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ChevronLeft size={22} color="white" />
                    </button>
                    <button onClick={nextImg} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                      width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ChevronRight size={22} color="white" />
                    </button>
                  </>
                )}
                {/* Fullscreen */}
                <button onClick={() => setFullscreen(true)} style={{
                  position: 'absolute', bottom: 14, right: 14,
                  background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8,
                  padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  color: 'white', fontSize: 13, fontWeight: 500,
                }}>
                  <Expand size={14} /> Fullscreen
                </button>
                {/* Image counter */}
                <div style={{
                  position: 'absolute', bottom: 14, left: 14,
                  background: 'rgba(0,0,0,0.5)', color: 'white',
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                }}>
                  {currentImg + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, overflow: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      style={{
                        flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
                        border: i === currentImg ? '2.5px solid #2563ab' : '2.5px solid transparent',
                        cursor: 'pointer', padding: 0, transition: 'border-color 0.2s',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                <div>
                  {!isSold && (
                    <span style={{
                      background: '#d1fae5', color: '#065f46', fontSize: 11,
                      fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 10,
                      display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.8px',
                    }}>
                      ● Available
                    </span>
                  )}
                  <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                    {property.title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    <MapPin size={16} color="#64748b" />
                    <span style={{ color: '#64748b', fontSize: 15 }}>{property.location}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1a3c5e' }}>{property.price_display}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Negotiable</div>
                </div>
              </div>

              {/* Key Details */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 16, background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24,
              }}>
                {[
                  { label: 'Land Size', value: formatArea(property.area_value, property.area_unit) },
                  { label: 'Road Width', value: property.road_width || 'N/A' },
                  { label: 'Facing', value: property.facing || 'N/A' },
                  { label: 'Status', value: isSold ? 'SOLD' : 'Available' },
                ].map(d => (
                  <div key={d.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', marginBottom: 12 }}>About This Property</h3>
                {user && leadSubmitted ? (
                  <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.8 }}>{property.description}</p>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.8, maxHeight: 80, overflow: 'hidden' }}>
                      {property.description}
                    </p>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                      background: 'linear-gradient(to top, white, transparent)',
                    }} />
                    <div style={{ marginTop: 8, padding: '14px 16px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                      <p style={{ fontSize: 14, color: '#0369a1' }}>
                        🔒 {user ? 'Submit an inquiry to view the full description and contact details.' : 'Login to view full property details.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Section - only after lead */}
            {user && leadSubmitted && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1px solid #86efac', borderRadius: 16, padding: 24, marginBottom: 24,
                animation: 'fadeIn 0.4s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <CheckCircle size={22} color="#059669" />
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#065f46' }}>Owner Contact Details</h3>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Broker Phone</div>
                    <a href={`tel:${property.owner_contact}`} style={{
                      fontSize: 18, fontWeight: 800, color: '#1a3c5e', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Phone size={18} /> {property.owner_contact}
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                  <a href={`tel:${property.owner_contact}`} className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Phone size={15} /> Call Now
                  </a>
                  <a
                    href={`https://wa.me/${BROKER_INFO.whatsapp}?text=Hi, I'm interested in: ${property.title} at ${property.location}. Price: ${property.price_display}`}
                    target="_blank" rel="noreferrer"
                    className="btn-whatsapp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Inquiry Card */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 20,
              position: 'sticky', top: 90,
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a3c5e', marginBottom: 4 }}>
                {property.price_display}
              </div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                {formatArea(property.area_value, property.area_unit)} · {property.location}
              </div>

              {isSold ? (
                <div style={{
                  background: '#fee2e2', borderRadius: 10, padding: '14px 16px',
                  textAlign: 'center', color: '#dc2626', fontWeight: 700, fontSize: 16,
                }}>
                  🏷️ This Property is SOLD
                </div>
              ) : leadSubmitted && user ? (
                <div>
                  <div style={{
                    background: '#d1fae5', borderRadius: 10, padding: '12px 16px',
                    marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <CheckCircle size={18} color="#059669" />
                    <span style={{ color: '#065f46', fontWeight: 600, fontSize: 14 }}>Inquiry Submitted!</span>
                  </div>
                  <a
                    href={`https://wa.me/${BROKER_INFO.whatsapp}?text=Hi, I'm interested in: ${property.title}`}
                    target="_blank" rel="noreferrer"
                    className="btn-whatsapp"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Continue on WhatsApp
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleGetDetails}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                >
                  {user ? '📋 Submit Inquiry' : '🔒 Login to Get Details'}
                </button>
              )}

              {!isSold && !leadSubmitted && (
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
                  {user ? 'Submit inquiry to view contact & full details' : 'Login required to view contact details'}
                </p>
              )}

              {/* Info */}
              <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                {[
                  { label: 'Property ID', value: `JL-${property.id.toString().padStart(4, '0')}` },
                  { label: 'Listed on', value: new Date(property.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { label: 'Facing', value: property.facing || 'N/A' },
                ].map(info => (
                  <div key={info.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid #f8fafc',
                  }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{info.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
              Similar Properties
            </h2>
            <div className="properties-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {similar.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Gallery */}
      {fullscreen && (
        <div className="gallery-fullscreen">
          <button onClick={() => setFullscreen(false)} style={{
            position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: '50%', width: 44, height: 44,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
          }}>
            <X size={22} color="white" />
          </button>
          <button onClick={prevImg} style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronLeft size={24} color="white" />
          </button>
          <img
            src={images[currentImg]}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
          />
          <button onClick={nextImg} style={{
            position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronRight size={24} color="white" />
          </button>
          <div style={{ position: 'absolute', bottom: 24, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            {currentImg + 1} / {images.length}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
