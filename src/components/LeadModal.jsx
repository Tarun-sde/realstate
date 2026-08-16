import { useState } from 'react'
import { X, User, Phone, MessageSquare, CheckCircle } from 'lucide-react'
import { usePropertyStore, useUIStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function LeadModal({ onLeadSubmit }) {
  const { showLeadModal, selectedPropertyId, closeLeadModal, markLeadSubmitted } = useUIStore()
  const { addLead, getById, brokerInfo } = usePropertyStore()
  const BROKER_INFO = brokerInfo
  const { user } = useAuthStore()

  const [form, setForm] = useState({ name: user?.name || '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!showLeadModal) return null

  const property = getById(selectedPropertyId)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addLead({
        name: form.name,
        phone: form.phone,
        message: form.message,
        property_id: selectedPropertyId,
        property_title: property?.title || 'Unknown',
        user_email: user?.email,
      })

      markLeadSubmitted(selectedPropertyId)
      setSubmitted(true)
      toast.success('Inquiry sent! You can now view full details.')
      onLeadSubmit?.()
    } catch (err) {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    setForm({ name: user?.name || '', phone: '', message: '' })
    closeLeadModal()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
              {submitted ? 'Inquiry Sent!' : 'Get Full Details'}
            </h2>
            {!submitted && (
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Fill in your details to get complete property information & owner contact.
              </p>
            )}
          </div>
          <button onClick={handleClose} style={{
            border: 'none', background: '#f1f5f9', borderRadius: 8,
            width: 36, height: 36, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {property && (
          <div style={{
            background: '#f8fafc', borderRadius: 12, padding: '12px 16px',
            marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <img
              src={property.images?.[0] || '/land1.png'}
              alt={property.title}
              style={{ width: 60, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{property.title}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{property.location}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3c5e', marginTop: 2 }}>{property.price_display}</div>
            </div>
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Your Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    className="form-input" style={{ paddingLeft: 40 }}
                    name="name" type="text" placeholder="Full name"
                    value={form.name} onChange={handleChange} required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    className="form-input" style={{ paddingLeft: 40 }}
                    name="phone" type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange} required
                    pattern="[0-9+\s\-]{7,15}"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Message (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <MessageSquare size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 14 }} />
                  <textarea
                    className="form-input" style={{ paddingLeft: 40, minHeight: 80, resize: 'vertical' }}
                    name="message" placeholder="Any specific questions about this property..."
                    value={form.message} onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Sending...
                  </span>
                ) : 'Submit & Get Details'}
              </button>

              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                Your details are safe with us. No spam, ever.
              </p>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#d1fae5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle size={32} color="#059669" />
            </div>
            <p style={{ color: '#374151', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
              Thank you <strong>{form.name}</strong>! Our broker will contact you at{' '}
              <strong>{form.phone}</strong> shortly.
            </p>

            <div style={{
              background: '#f0fdf4', borderRadius: 12, padding: '16px 20px',
              marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{ fontSize: 13, color: '#064e3b', fontWeight: 600, marginBottom: 8 }}>
                Broker Contact Details
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                📞 {BROKER_INFO.phone}
              </div>
            </div>

            <a
              href={`https://wa.me/${BROKER_INFO.whatsapp}?text=Hi, I'm interested in the property: ${property?.title} (${property?.location}). Please share more details.`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
