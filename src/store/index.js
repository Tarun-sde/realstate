import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import supabase from '../config/supabase'
import { MOCK_PROPERTIES, ADMIN_CREDENTIALS } from '../data/mockData'

const ADMIN_EMAILS = [
  (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim(),
  'demo.admin@gmail.com',
  'admin@gmail.com',
].filter(Boolean)

export const isUserAdmin = (email) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

// ---- AUTH STORE ----
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isLoading: false,
      error: null,

      // Initialize auth state from existing Supabase session
      init: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const isAdmin = isUserAdmin(session.user.email)
            set({
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                role: isAdmin ? 'admin' : 'user',
              },
              isAdmin,
            })
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              const isAdmin = isUserAdmin(session.user.email)
              set({
                user: {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                  role: isAdmin ? 'admin' : 'user',
                },
                isAdmin,
              })
            } else if (!get().user?.isLocalAdmin) {
              set({ user: null, isAdmin: false })
            }
          })
        } catch (e) {
          console.warn('Auth init note:', e)
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        const cleanEmail = email.trim().toLowerCase()

        // 1. Check built-in demo admin credentials
        const isBuiltinAdmin =
          (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() ||
           cleanEmail === 'demo.admin@gmail.com' ||
           cleanEmail === 'admin@gmail.com') &&
          (password === ADMIN_CREDENTIALS.password ||
           password === 'admin123' ||
           password === 'Admin@123')

        if (isBuiltinAdmin) {
          const adminUser = {
            id: 'admin-local-master',
            email: cleanEmail,
            name: 'Demo Admin',
            role: 'admin',
            isLocalAdmin: true,
          }
          set({
            user: adminUser,
            isAdmin: true,
            isLoading: false,
          })
          return { success: true, isAdmin: true }
        }

        // 2. Try Supabase Auth
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false }
          }
          const isAdmin = isUserAdmin(data.user.email)
          set({
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email.split('@')[0],
              role: isAdmin ? 'admin' : 'user',
            },
            isAdmin,
            isLoading: false,
          })
          return { success: true, isAdmin }
        } catch (err) {
          set({ error: err.message, isLoading: false })
          return { success: false }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        const cleanEmail = email.trim().toLowerCase()
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: { data: { name } },
          })
          if (error) {
            set({ error: error.message, isLoading: false })
            return { success: false }
          }
          // If email confirmation is disabled, user is available right away
          if (data.user && !data.session) {
            set({ isLoading: false })
            return { success: true, needsConfirmation: true }
          }
          const isAdmin = isUserAdmin(data.user?.email)
          set({
            user: data.user
              ? {
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.name || name,
                  role: isAdmin ? 'admin' : 'user',
                }
              : null,
            isAdmin,
            isLoading: false,
          })
          return { success: true }
        } catch (err) {
          set({ error: err.message, isLoading: false })
          return { success: false }
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
        } catch (e) {
          // ignore
        }
        set({ user: null, isAdmin: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'jai-auth',
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
)

// ---- PROPERTY STORE ----
export const usePropertyStore = create((set, get) => ({
  properties: [],
  leads: [],
  isLoading: false,

  // Fetch properties from Supabase
  fetchProperties: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error)
      // Fallback to mock data if table doesn't exist yet
      set({ properties: MOCK_PROPERTIES, isLoading: false })
      return
    }
    set({ properties: data || [], isLoading: false })
  },

  getProperties: () => get().properties,

  getFeatured: () => get().properties.filter((p) => p.featured),

  getById: (id) => get().properties.find((p) => String(p.id) === String(id)),

  addProperty: async (property) => {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ ...property, created_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) {
      console.error('Error adding property:', error)
      throw error
    }
    set((state) => ({ properties: [data, ...state.properties] }))
    return data
  },

  updateProperty: async (id, updates) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating property:', error)
      throw error
    }
    set((state) => ({
      properties: state.properties.map((p) => (String(p.id) === String(id) ? data : p)),
    }))
    return data
  },

  deleteProperty: async (id) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) {
      console.error('Error deleting property:', error)
      throw error
    }
    set((state) => ({
      properties: state.properties.filter((p) => String(p.id) !== String(id)),
    }))
  },

  toggleSold: async (id) => {
    const property = get().properties.find((p) => String(p.id) === String(id))
    if (!property) return
    const newStatus = property.status === 'sold' ? 'available' : 'sold'
    await get().updateProperty(id, { status: newStatus })
  },

  // Fetch leads from Supabase
  fetchLeads: async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      return
    }
    set({ leads: data || [] })
  },

  addLead: async (lead) => {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, created_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) {
      console.error('Error adding lead:', error)
      // Fallback: store locally
      const newLead = { ...lead, id: Date.now().toString(), created_at: new Date().toISOString() }
      set((state) => ({ leads: [newLead, ...state.leads] }))
      return newLead
    }
    set((state) => ({ leads: [data, ...state.leads] }))
    return data
  },

  getLeads: () => get().leads,
}))

// ---- UI STORE ----
export const useUIStore = create((set) => ({
  showAuthModal: false,
  authMode: 'login',
  showLeadModal: false,
  selectedPropertyId: null,
  leadSubmittedProperties: new Set(),

  openLogin: () => set({ showAuthModal: true, authMode: 'login' }),
  openRegister: () => set({ showAuthModal: true, authMode: 'register' }),
  closeAuthModal: () => set({ showAuthModal: false }),

  switchAuthMode: () =>
    set((state) => ({
      authMode: state.authMode === 'login' ? 'register' : 'login',
    })),

  openLeadModal: (propertyId) => set({ showLeadModal: true, selectedPropertyId: propertyId }),
  closeLeadModal: () => set({ showLeadModal: false, selectedPropertyId: null }),

  markLeadSubmitted: (propertyId) =>
    set((state) => ({
      leadSubmittedProperties: new Set([...state.leadSubmittedProperties, propertyId]),
    })),

  hasSubmittedLead: (propertyId) => false,
}))
