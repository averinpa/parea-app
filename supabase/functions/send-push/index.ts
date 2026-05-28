import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sends an Expo push to one or more profiles.
// Body: { toProfileIds: string[], title: string, body: string, data?: object }
//
// Security: the caller must be an authenticated user (valid JWT), and may only
// push to profiles they have a relationship with — a shared chat, a crew invite,
// or a join request (covers all legit triggers: message, invite, accept, join
// request, host approve). This stops anyone holding the public anon key from
// spamming arbitrary users with arbitrary push content.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const admin = createClient(supabaseUrl, serviceKey)

    // ── 1. Authenticate the caller from their JWT ──────────────────────────
    const authHeader = req.headers.get('Authorization') || ''
    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'missing auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'invalid auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: callerProfile } = await admin
      .from('profiles').select('id').eq('auth_id', user.id).single()
    const callerId: string | undefined = callerProfile?.id
    if (!callerId) {
      return new Response(JSON.stringify({ error: 'no profile' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { toProfileIds, title, body, data } = await req.json()
    const ids: string[] = Array.isArray(toProfileIds) ? toProfileIds : [toProfileIds].filter(Boolean)
    if (ids.length === 0 || !title) {
      return new Response(JSON.stringify({ error: 'toProfileIds and title required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Scope: keep only recipients the caller is allowed to push to ─────
    const allowed = new Set<string>()
    // (a) people who share a chat with the caller
    const { data: myChats } = await admin
      .from('chat_members').select('chat_id').eq('profile_id', callerId)
    const myChatIds = (myChats || []).map((c: any) => c.chat_id)
    if (myChatIds.length > 0) {
      const { data: peers } = await admin
        .from('chat_members').select('profile_id')
        .in('chat_id', myChatIds).neq('profile_id', callerId)
      ;(peers || []).forEach((p: any) => allowed.add(p.profile_id))
    }
    // (b) crew invites in either direction (two queries — or() misparses UUIDs)
    const [{ data: ciOut }, { data: ciIn }] = await Promise.all([
      admin.from('crew_invites').select('invitee_id').eq('inviter_id', callerId),
      admin.from('crew_invites').select('inviter_id').eq('invitee_id', callerId),
    ])
    ;(ciOut || []).forEach((r: any) => allowed.add(r.invitee_id))
    ;(ciIn || []).forEach((r: any) => allowed.add(r.inviter_id))
    // (c) join requests where one side is requester and the other host
    const [{ data: jrMine }, { data: jrHosted }] = await Promise.all([
      admin.from('join_requests').select('host_id').eq('requester_id', callerId),
      admin.from('join_requests').select('requester_id').eq('host_id', callerId),
    ])
    ;(jrMine || []).forEach((r: any) => { if (r.host_id) allowed.add(r.host_id) })
    ;(jrHosted || []).forEach((r: any) => { if (r.requester_id) allowed.add(r.requester_id) })

    const safeIds = ids.filter((id) => allowed.has(id))
    if (safeIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no authorized recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Look up tokens (service role) and fire the push ──────────────────
    const { data: rows, error } = await admin
      .from('profiles')
      .select('id, expo_push_token')
      .in('id', safeIds)
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const messages = (rows || [])
      .filter((r: any) => r.expo_push_token)
      .map((r: any) => ({
        to: r.expo_push_token,
        title,
        body: body || '',
        data: data || {},
        sound: 'default',
        priority: 'high',
      }))

    if (messages.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no tokens' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resp = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })
    const result = await resp.json()

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
