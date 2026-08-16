import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Maximize2, TrendingUp, Shield, Phone, ChevronRight, Star, ArrowRight } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { usePropertyStore } from '../store'
import { BROKER_INFO } from '../data/mockData'
import { CardSkeleton } from '../components/Skeletons'

const LOCATIONS = ['All', 'Boring Road', 'Bailey Road', 'Kankarbagh', 'Danapur', 'Saguna More', 'Phulwari Sharif']

export default function HomePage() {
  const { getProperties, getFeatured } = usePropertyStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('available')

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const allProperties = getProperties()
  const featured = getFeatured().filter(p => p.status !== 'sold').slice(0, 4)
  const stats = {
    total: allProperties.length,
    available: allProperties.filter(p => p.status === 'available').length,
    sold: allProperties.filter(p => p.status === 'sold').length,
    locations: [...new Set(allProperties.map(p => p.location.split(',')[0]))].length,
  }

  return (
    <div>
      {/* ---- HERO ---- */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
          <div style={{ maxWidth: 680 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24,
              padding: '6px 16px', marginBottom: 20,
            }}>
              <MapPin size={14} color="#f59e0b" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                Patna, Bihar's Trusted Land Broker
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800, color: 'white', lineHeight: 1.15,
              marginBottom: 18,
              textShadow: '0 2px 20px rgba(0,0,0,0.2)',
            }}>
              Find Your Perfect <br />
              <span style={{ color: '#f59e0b' }}>Land Plot</span> in Patna
            </h1>

            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 32,
              lineHeight: 1.7, maxWidth: 540,
            }}>
              Premium land listings across Patna's most sought-after localities.
              Buy and sell verified land plots with complete documentation support.
            </p>

            {/* Search Bar */}
            <div style={{
              display: 'flex', gap: 0, background: 'white', borderRadius: 14,
              padding: 6, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              maxWidth: 540,
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)'
                }} />
                <input
                  type="text"
                  placeholder="Search by location or property..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', border: 'none',
                    outline: 'none', fontSize: 15, color: '#374151', borderRadius: 10,
                    background: 'transparent',
                  }}
                />
              </div>
              <Link
                to={`/listings?q=${search}`}
                className="btn-primary"
                style={{ borderRadius: 10, padding: '12px 22px', whiteSpace: 'nowrap', textDecoration: 'none' }}
              >
                Search
              </Link>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {['Boring Road', 'Bailey Road', 'Kankarbagh'].map(loc => (
                <Link key={loc} to={`/listings?location=${loc}`} style={{
                  padding: '6px 14px', background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)', borderRadius: 20, fontSize: 13,
                  color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 500, transition: 'all 0.2s',
                }}>
                  {loc} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- STATS STRIP ---- */}
      <section style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2563ab 100%)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Listings', value: stats.total + '+' },
            { label: 'Available Plots', value: stats.available },
            { label: 'Successfully Sold', value: stats.sold + '+' },
            { label: 'Locations Covered', value: stats.locations + '+' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FEATURED LISTINGS ---- */}
      <section style={{ padding: '70px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 28, height: 3, background: '#d97706', borderRadius: 2 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 1 }}>
                Featured Listings
              </span>
            </div>
            <h2 className="section-title">Prime Land Plots in Patna</h2>
            <p className="section-subtitle">Hand-picked properties with verified documentation</p>
          </div>
          <Link to="/listings" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Listings <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="properties-grid">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="properties-grid">
            {featured.map(p => (
              <PropertyCard key={p.id} property={p} featured />
            ))}
          </div>
        )}
      </section>

      {/* ---- WHY CHOOSE US ---- */}
      <section style={{ background: '#f8fafc', padding: '70px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 28, height: 3, background: '#d97706', borderRadius: 2 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 1 }}>
                Why Choose Us
              </span>
              <div style={{ width: 28, height: 3, background: '#d97706', borderRadius: 2 }} />
            </div>
            <h2 className="section-title">Patna's Most Trusted Land Broker</h2>
            <p className="section-subtitle" style={{ maxWidth: 500, margin: '10px auto 0' }}>
              Over {new Date().getFullYear() - parseInt(BROKER_INFO.established)} years of experience in Patna's land market
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                icon: <Shield size={28} color="#1a3c5e" />,
                title: 'Verified Properties',
                desc: 'All listings undergo thorough legal document verification before being listed.',
              },
              {
                icon: <Star size={28} color="#d97706" />,
                title: '13+ Years Experience',
                desc: `Established in ${BROKER_INFO.established}, we have deep knowledge of Patna's land market.`,
              },
              {
                icon: <TrendingUp size={28} color="#059669" />,
                title: 'Best Market Price',
                desc: 'We ensure you get the best value whether you\'re buying or selling land.',
              },
              {
                icon: <Phone size={28} color="#7c3aed" />,
                title: '24/7 Support',
                desc: 'Our team is always available to assist with any queries regarding land deals.',
              },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'white', borderRadius: 16, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: '#f1f5f9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 16,
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA SECTION ---- */}
      <section style={{ padding: '70px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3c5e 0%, #2563ab 100%)',
            borderRadius: 24, padding: '52px 40px',
            boxShadow: '0 20px 60px rgba(26,60,94,0.3)',
          }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '2rem',
              fontWeight: 700, color: 'white', marginBottom: 12,
            }}>
              Ready to Buy or Sell Land?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
              Connect with Patna's most trusted land broker today. Get expert guidance for your land investment.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/listings" className="btn-accent" style={{ textDecoration: 'none' }}>
                Browse All Plots <ArrowRight size={16} />
              </Link>
              <a
                href={`https://wa.me/${BROKER_INFO.whatsapp}?text=Hi, I want to inquire about your land listings in Patna.`}
                target="_blank" rel="noreferrer"
                className="btn-whatsapp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.7)', padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'linear-gradient(135deg, #2563ab, #1a3c5e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MapPin size={18} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'white', fontFamily: 'Playfair Display, serif' }}>
                  {BROKER_INFO.name}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 240 }}>
                Your trusted partner for land buying and selling in Patna, Bihar since {BROKER_INFO.established}.
              </p>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Quick Links</h4>
              {[['Home', '/'], ['Properties', '/listings'], ['Map View', '/map']].map(([label, href]) => (
                <div key={href} style={{ marginBottom: 8 }}>
                  <Link to={href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {label}
                  </Link>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Contact</h4>
              <div style={{ fontSize: 14, lineHeight: 2 }}>
                <div>📞 {BROKER_INFO.phone}</div>
                <div>📧 {BROKER_INFO.email}</div>
                <div>📍 {BROKER_INFO.address}</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center', fontSize: 13 }}>
            © {new Date().getFullYear()} {BROKER_INFO.name}. All rights reserved. | Built with ❤️ for Patna, Bihar
          </div>
        </div>
      </footer>
    </div>
  )
}
