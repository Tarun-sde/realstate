import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { usePropertyStore } from '../store'
import { CardSkeleton } from '../components/Skeletons'

const LOCATIONS = ['All Locations', 'Boring Road', 'Bailey Road', 'Kankarbagh', 'Danapur', 'Saguna More', 'Phulwari Sharif']
const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₹30 Lakh', min: 0, max: 3000000 },
  { label: '₹30L – ₹60L', min: 3000000, max: 6000000 },
  { label: '₹60L – ₹1 Crore', min: 6000000, max: 10000000 },
  { label: 'Above ₹1 Crore', min: 10000000, max: Infinity },
]
const SIZE_OPTIONS = [
  { label: 'Any Size', min: 0, max: Infinity, unit: null },
  { label: 'Under 1500 sq.ft', min: 0, max: 1500, unit: 'sqft' },
  { label: '1500 – 3000 sq.ft', min: 1500, max: 3000, unit: 'sqft' },
  { label: 'Above 3000 sq.ft', min: 3000, max: Infinity, unit: 'sqft' },
  { label: '1+ Acre', min: 1, max: Infinity, unit: 'acre' },
]

export default function ListingsPage() {
  const [searchParams] = useSearchParams()
  const { getProperties } = usePropertyStore()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || 'All Locations')
  const [priceRange, setPriceRange] = useState(0)
  const [sizeFilter, setSizeFilter] = useState(0)
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoading(false), 800)
  }, [])

  const allProperties = getProperties()

  const filtered = allProperties.filter(p => {
    // Search
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !p.location.toLowerCase().includes(search.toLowerCase())) return false
    // Location
    if (location !== 'All Locations' && !p.location.includes(location)) return false
    // Price
    const pr = PRICE_RANGES[priceRange]
    if (p.price < pr.min || p.price > pr.max) return false
    // Status
    if (status !== 'all' && p.status !== status) return false
    // Size
    const sf = SIZE_OPTIONS[sizeFilter]
    if (sf.unit) {
      if (p.area_unit !== sf.unit) return false
      if (p.area_value < sf.min || p.area_value > sf.max) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0
  })

  const clearFilters = () => {
    setSearch(''); setLocation('All Locations')
    setPriceRange(0); setSizeFilter(0); setStatus('all'); setSortBy('newest')
  }

  const hasFilters = search || location !== 'All Locations' || priceRange !== 0 || sizeFilter !== 0 || status !== 'all'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2563ab 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 6 }}>
            Land Plots in Patna
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
            {sorted.length} properties found • Verified land listings across Patna, Bihar
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Filter Bar */}
        <div className="filter-bar" style={{ marginBottom: 28 }}>
          {/* Search */}
          <div style={{ flex: '1 1 220px', position: 'relative', minWidth: 180 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="form-input" style={{ paddingLeft: 36, margin: 0 }}
              placeholder="Search properties..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="filter-select" value={location} onChange={e => setLocation(e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>

          <select className="filter-select" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))}>
            {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
          </select>

          <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>

          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
              background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 14,
            }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="properties-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No Properties Found</h3>
            <p style={{ color: '#64748b', marginBottom: 20 }}>Try adjusting your filters to see more results.</p>
            <button className="btn-primary" onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, fontWeight: 500 }}>
              Showing {sorted.length} {sorted.length === 1 ? 'property' : 'properties'}
              {hasFilters ? ' (filtered)' : ''}
            </p>
            <div className="properties-grid">
              {sorted.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
