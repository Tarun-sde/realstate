import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { usePropertyStore } from '../store'

// Leaflet CSS import
import 'leaflet/dist/leaflet.css'

export default function MapPage() {
  const { getProperties } = usePropertyStore()
  const [MapComponents, setMapComponents] = useState(null)
  const properties = getProperties()

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, L]) => {
      // Fix default marker icon
      delete L.default.Icon.Default.prototype._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setMapComponents({ ...rl })
    })
  }, [])

  const available = properties.filter(p => p.status === 'available')
  const sold = properties.filter(p => p.status === 'sold')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2563ab 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 6 }}>
            Map View – Land Plots
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
            Browse all land listings on the map · Centered on Patna, Bihar
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#059669' }} />
            Available ({available.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626' }} />
            Sold ({sold.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
            <MapPin size={14} color="#64748b" /> Click any pin to see details
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          {!MapComponents ? (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#e2e8f0', borderRadius: 16,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, border: '3px solid #2563ab',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 1s linear infinite', margin: '0 auto 12px',
                }} />
                <p style={{ color: '#64748b', fontSize: 14 }}>Loading map...</p>
              </div>
            </div>
          ) : (
            <MapComponents.MapContainer
              center={[25.5941, 85.1376]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <MapComponents.TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map(p => (
                <MapComponents.Marker key={p.id} position={[p.lat, p.lng]}>
                  <MapComponents.Popup>
                    <div style={{ padding: 4, minWidth: 220 }}>
                      <img
                        src={p.images?.[0] || '/land1.png'}
                        alt={p.title}
                        style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                      />
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                        📍 {p.location}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a3c5e' }}>{p.price_display}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                          background: p.status === 'sold' ? '#fee2e2' : '#dcfce7',
                          color: p.status === 'sold' ? '#dc2626' : '#065f46',
                          textTransform: 'uppercase',
                        }}>
                          {p.status}
                        </span>
                      </div>
                      <a
                        href={`/property/${p.id}`}
                        style={{
                          display: 'block', textAlign: 'center', background: '#1a3c5e',
                          color: 'white', padding: '8px 12px', borderRadius: 8,
                          textDecoration: 'none', fontSize: 13, fontWeight: 600,
                        }}
                      >
                        View Details →
                      </a>
                    </div>
                  </MapComponents.Popup>
                </MapComponents.Marker>
              ))}
            </MapComponents.MapContainer>
          )}
        </div>

        {/* Property List below map */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 }}>
            All Listed Properties
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {properties.map(p => (
              <Link key={p.id} to={`/property/${p.id}`} style={{
                display: 'flex', gap: 16, background: 'white', borderRadius: 12, padding: 16,
                textDecoration: 'none', transition: 'box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
              >
                <img
                  src={p.images?.[0] || '/land1.png'}
                  alt={p.title}
                  style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 3 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>📍 {p.location}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#1a3c5e' }}>{p.price_display}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: p.status === 'sold' ? '#fee2e2' : '#dcfce7',
                    color: p.status === 'sold' ? '#dc2626' : '#065f46',
                    textTransform: 'uppercase',
                  }}>
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
