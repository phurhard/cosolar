import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: throw on Supabase error
function unwrap({ data, error }) {
  if (error) throw error
  return data
}

// ── Installations ──────────────────────────────────────────────────────────

export const Installation = {
  list: () =>
    supabase.from('installations').select('*').then(unwrap),

  filter: (filters) => {
    let q = supabase.from('installations').select('*')
    for (const [key, val] of Object.entries(filters)) {
      q = q.eq(key, val)
    }
    return q.then(unwrap)
  },

  create: (data) =>
    supabase.from('installations').insert(data).select().single().then(unwrap),

  update: (id, data) =>
    supabase.from('installations').update(data).eq('id', id).select().single().then(unwrap),
}

// ── InstallerProfile ───────────────────────────────────────────────────────

export const InstallerProfile = {
  list: () =>
    supabase.from('installer_profiles').select('*').then(unwrap),

  filter: (filters) => {
    let q = supabase.from('installer_profiles').select('*')
    for (const [key, val] of Object.entries(filters)) {
      q = q.eq(key, val)
    }
    return q.then(unwrap)
  },

  create: (data) =>
    supabase.from('installer_profiles').insert(data).select().single().then(unwrap),

  update: (id, data) =>
    supabase.from('installer_profiles').update(data).eq('id', id).select().single().then(unwrap),
}

// ── Contact messages ───────────────────────────────────────────────────────

export const ContactMessage = {
  create: (data) =>
    supabase.from('contact_messages').insert(data).select().single().then(unwrap),
}
