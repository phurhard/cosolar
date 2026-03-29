import { createClient } from 'npm:@supabase/supabase-js@2.49.4'
import { Resend } from 'npm:resend@4.1.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('REVIEW_FROM_EMAIL') || 'CoSolar <notifications@cosolar.africa>'
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!resendApiKey || !supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment secrets' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || '',
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.app_metadata?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can send review emails' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const {
      requesterEmail,
      status,
      comment,
      adminEmail,
      installationType,
      location,
      installationId,
    } = await req.json()

    if (!requesterEmail || !status) {
      return new Response(
        JSON.stringify({ error: 'requesterEmail and status are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const normalizedStatus = String(status).toLowerCase()
    const statusLabel = normalizedStatus === 'approved' ? 'approved' : 'rejected'
    const safeComment = comment ? escapeHtml(String(comment)) : ''
    const safeType = installationType ? escapeHtml(String(installationType)) : 'installation'
    const safeLocation = location ? escapeHtml(String(location)) : 'the submitted location'
    const safeAdminEmail = adminEmail ? escapeHtml(String(adminEmail)) : escapeHtml(user.email || 'the CoSolar admin team')
    const safeInstallationId = installationId ? escapeHtml(String(installationId)) : ''

    const resend = new Resend(resendApiKey)

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: requesterEmail,
      subject: `Your CoSolar installation was ${statusLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 16px;">Installation review update</h2>
          <p>Your ${safeType} in ${safeLocation} was <strong>${statusLabel}</strong>.</p>
          ${safeComment ? `<p><strong>Admin comment:</strong><br />${safeComment}</p>` : ''}
          <p><strong>Reviewed by:</strong> ${safeAdminEmail}</p>
          ${safeInstallationId ? `<p style="color: #6b7280; font-size: 12px;">Reference: ${safeInstallationId}</p>` : ''}
        </div>
      `,
    })

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
