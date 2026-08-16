import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuthStore, useUIStore, usePropertyStore } from '../store'

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const { user, isAdmin, logout } = useAuthStore()
  const { openLogin, openRegister } = useUIStore()
  const brokerInfo = usePropertyStore(s => s.brokerInfo)
  const BROKER_INFO = brokerInfo

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/listings', label: 'Properties' },
    { to: '/map', label: 'Map View' },
  ]

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="Jaa Maa Gauri Properties Logo"
              style={{
                width: 44, height: 44,
                borderRadius: 10,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', lineHeight: 1.1, fontFamily: 'Playfair Display, serif' }}>
                {BROKER_INFO.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Land Broker · Patna</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="nav-desktop">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  color: isActive(link.to) ? '#1a3c5e' : '#475569',
                  background: isActive(link.to) ? '#eff6ff' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link to="/admin" style={{
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                fontWeight: 600, fontSize: 14, color: '#d97706',
                background: isActive('/admin') ? '#fef3c7' : 'transparent',
              }}>
                Dashboard
              </Link>
            )}

            <div style={{ width: 1, height: 28, background: '#e2e8f0', margin: '0 4px' }} />

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#eff6ff', border: 'none', cursor: 'pointer',
                    padding: '8px 14px', borderRadius: 10, fontWeight: 600,
                    fontSize: 14, color: '#1a3c5e',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#1a3c5e', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700
                  }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name}
                  <ChevronDown size={14} />
                </button>
                {userDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%', background: 'white',
                    borderRadius: 12, padding: 8, minWidth: 180,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200,
                    animation: 'fadeInScale 0.15s ease',
                  }}>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserDropdown(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        borderRadius: 8, textDecoration: 'none', color: '#374151',
                        fontSize: 14, fontWeight: 500, transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={16} color="#1a3c5e" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserDropdown(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        borderRadius: 8, width: '100%', border: 'none', background: 'transparent',
                        cursor: 'pointer', color: '#dc2626', fontSize: 14, fontWeight: 500,
                        textAlign: 'left', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ padding: '9px 18px', fontSize: 14 }} onClick={openLogin}>
                  Sign In
                </button>
                <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 14 }} onClick={openRegister}>
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', border: 'none', background: 'transparent',
              cursor: 'pointer', padding: 6, borderRadius: 8,
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={24} color="#0f172a" /> : <Menu size={24} color="#0f172a" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            padding: '12px 0 20px',
            borderTop: '1px solid #e2e8f0',
            animation: 'slideUp 0.2s ease',
          }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'block', padding: '12px 4px', textDecoration: 'none',
                fontWeight: 600, fontSize: 15, color: isActive(link.to) ? '#1a3c5e' : '#475569',
                borderBottom: '1px solid #f1f5f9',
              }}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" style={{
                display: 'block', padding: '12px 4px', textDecoration: 'none',
                fontWeight: 600, fontSize: 15, color: '#d97706',
                borderBottom: '1px solid #f1f5f9',
              }}>
                Admin Dashboard
              </Link>
            )}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              {user ? (
                <button className="btn-secondary" onClick={logout} style={{ flex: 1, justifyContent: 'center' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <>
                  <button className="btn-secondary" onClick={openLogin} style={{ flex: 1, justifyContent: 'center' }}>
                    Sign In
                  </button>
                  <button className="btn-primary" onClick={openRegister} style={{ flex: 1, justifyContent: 'center' }}>
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
