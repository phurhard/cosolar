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
  list: async () =>
    await supabase.from('installations').select('*').then(unwrap),

  filter: async (filters) => {
    let q = supabase.from('installations').select('*')
    for (const [key, val] of Object.entries(filters)) {
      q = q.eq(key, val)
    }
    return await q.then(unwrap)
  },

  create: async (data) =>
    await supabase.from('installations').insert(data).select().single().then(unwrap),

  update: async (id, data) =>
    await supabase.from('installations').update(data).eq('id', id).select().single().then(unwrap),

  review: async ({ id, status, comment, adminEmail }) => {
    const { data, error } = await supabase.rpc('review_installation', {
      p_installation_id: id,
      p_status: status,
      p_comment: comment ?? null,
      p_admin_email: adminEmail ?? null,
    })

    return unwrap({ data, error })
  },
}

// ── InstallerProfile ───────────────────────────────────────────────────────

export const InstallerProfile = {
  list: async () =>
    await supabase.from('installer_profiles').select('*').then(unwrap),

  filter: async (filters) => {
    let q = supabase.from('installer_profiles').select('*')
    for (const [key, val] of Object.entries(filters)) {
      q = q.eq(key, val)
    }
    return await q.then(unwrap)
  },

  create: async (data) =>
    await supabase.from('installer_profiles').insert(data).select().single().then(unwrap),

  update: async (id, data) =>
    await supabase.from('installer_profiles').update(data).eq('id', id).select().single().then(unwrap),
}

// ── Contact messages ───────────────────────────────────────────────────────

export const ContactMessage = {
  create: async (data) =>
    await supabase.from('contact_messages').insert(data).select().single().then(unwrap),
}

// ── Notifications ──────────────────────────────────────────────────────────

export const Notification = {
  listMine: async (userEmail) =>
    await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(unwrap),

  markRead: async (id) =>
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .is('read_at', null)
      .then(unwrap),

  markAllRead: async (userEmail) =>
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_email', userEmail)
      .is('read_at', null)
      .then(unwrap),
}

export const sendInstallationReviewEmail = async (payload) => {
  const { data, error } = await supabase.functions.invoke('send-installation-review-email', {
    body: payload,
  })

  if (error) {
    throw error
  }

  return data
}
