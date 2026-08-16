import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import LeadModal from './components/LeadModal'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import MapPage from './pages/MapPage'
import AdminPage from './pages/AdminPage'
import { useAuthStore, usePropertyStore } from './store'

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <AuthModal />
      <LeadModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px',
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: 'white' },
          },
        }}
      />
    </>
  )
}

export default function App() {
  const { init } = useAuthStore()
  const { fetchProperties } = usePropertyStore()

  useEffect(() => {
    // Initialize Supabase auth session listener
    init()
    // Load properties from Supabase on startup
    fetchProperties()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin - no navbar */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Public pages with navbar */}
        <Route path="/" element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        } />
        <Route path="/listings" element={
          <AppLayout>
            <ListingsPage />
          </AppLayout>
        } />
        <Route path="/property/:id" element={
          <AppLayout>
            <PropertyDetailPage />
          </AppLayout>
        } />
        <Route path="/map" element={
          <AppLayout>
            <MapPage />
          </AppLayout>
        } />

        {/* 404 */}
        <Route path="*" element={
          <AppLayout>
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Page Not Found</h2>
              <p style={{ color: '#64748b', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                Go Home
              </a>
            </div>
          </AppLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
