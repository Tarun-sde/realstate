import { Link } from 'react-router-dom'
import { MapPin, Maximize2, Tag, Eye } from 'lucide-react'
import { useAuthStore, useUIStore } from '../store'

const formatArea = (value, unit) => {
  if (unit === 'sqft') return `${value.toLocaleString()} sq.ft`
  if (unit === 'acre') return `${value} Acre`
  if (unit === 'bigha') return `${value} Bigha`
  return `${value} ${unit}`
}

export default function PropertyCard({ property, featured = false }) {
  const { user } = useAuthStore()
  const { openLogin, openLeadModal } = useUIStore()

  const handleGetDetails = (e) => {
    e.preventDefault()
    if (!user) {
      openLogin()
    } else {
      openLeadModal(property.id)
    }
  }

  const isSold = property.status === 'sold'

  return (
    <div
      className="property-card animate-fadeIn"
      style={{ opacity: isSold ? 0.88 : 1 }}
    >
      {/* Image */}
      <div className="card-image">
        <img
          src={property.images?.[0] || '/land1.png'}
          alt={property.title}
          loading="lazy"
        />
        {/* Status badge */}
        <span className={isSold ? 'sold-badge' : 'available-badge'}>
          {isSold ? '● SOLD' : '● Available'}
        </span>
        {featured && !isSold && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: 'white', fontSize: 10, fontWeight: 700,
            letterSpacing: 0.8, padding: '3px 8px', borderRadius: 4,
            textTransform: 'uppercase',
          }}>
            Featured
          </span>
        )}
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
        }} />
        {/* Price on image */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          color: 'white', fontWeight: 800, fontSize: 18,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}>
          {property.price_display}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{
          fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 8,
          lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {property.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#64748b" strokeWidth={2} />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              {property.location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Maximize2 size={14} color="#64748b" strokeWidth={2} />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              {formatArea(property.area_value, property.area_unit)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            to={`/property/${property.id}`}
            style={{
              flex: 1, textAlign: 'center', padding: '9px 12px',
              borderRadius: 8, border: '1.5px solid #e2e8f0',
              textDecoration: 'none', color: '#374151', fontWeight: 600,
              fontSize: 13, transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a3c5e'; e.currentTarget.style.color = '#1a3c5e' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
          >
            <Eye size={14} /> View
          </Link>

          {isSold ? (
            <button
              disabled
              style={{
                flex: 2, padding: '9px 12px', borderRadius: 8,
                background: '#f1f5f9', border: 'none', cursor: 'not-allowed',
                color: '#94a3b8', fontWeight: 600, fontSize: 13,
              }}
            >
              Property Sold
            </button>
          ) : (
            <button
              onClick={handleGetDetails}
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', padding: '9px 16px', fontSize: 13 }}
            >
              <Tag size={13} /> Get Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
