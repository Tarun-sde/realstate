// Loading skeleton components
export function CardSkeleton() {
  return (
    <div style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div className="skeleton" style={{ height: 220 }} />
      <div style={{ padding: 18 }}>
        <div className="skeleton" style={{ height: 18, borderRadius: 4, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '70%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '50%', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ height: 36, borderRadius: 8, flex: 1 }} />
          <div className="skeleton" style={{ height: 36, borderRadius: 8, flex: 2 }} />
        </div>
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px' }}>
      <div className="skeleton" style={{ height: 420, borderRadius: 16, marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        <div>
          <div className="skeleton" style={{ height: 36, borderRadius: 8, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 18, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 18, borderRadius: 4, width: '80%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
        </div>
        <div>
          <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div className="skeleton" style={{ height: 16, borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  )
}
