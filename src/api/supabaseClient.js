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

// ── Forum Posts ────────────────────────────────────────────────────────────

export const ForumPost = {
  list: async ({ category, search, limit = 50 } = {}) => {
    let q = supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category && category !== 'All') {
      q = q.eq('category', category)
    }
    if (search) {
      q = q.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }
    return await q.then(unwrap)
  },

  get: async (id) =>
    await supabase.from('forum_posts').select('*').eq('id', id).single().then(unwrap),

  create: async (data) =>
    await supabase.from('forum_posts').insert(data).select().single().then(unwrap),

  update: async (id, data) =>
    await supabase.from('forum_posts').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single().then(unwrap),

  delete: async (id) =>
    await supabase.from('forum_posts').delete().eq('id', id).then(unwrap),

  like: async (id) =>
    await supabase.rpc('increment_field', { table_name: 'forum_posts', row_id: id, field_name: 'likes_count' }).then(({ error }) => {
      // Fallback: direct update if RPC doesn't exist
      if (error) return supabase.from('forum_posts').update({ likes_count: supabase.raw('likes_count + 1') }).eq('id', id).then(unwrap)
    }),
}

// ── Forum Replies ──────────────────────────────────────────────────────────

export const ForumReply = {
  listByPost: async (postId) =>
    await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .then(unwrap),

  create: async (data) =>
    await supabase.from('forum_replies').insert(data).select().single().then(unwrap),

  delete: async (id) =>
    await supabase.from('forum_replies').delete().eq('id', id).then(unwrap),
}
