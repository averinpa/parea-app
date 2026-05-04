import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('moderate-photo invoked', { method: req.method })
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('auth header present:', !!authHeader)
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    console.log('user check:', { hasUser: !!user, userError: userError?.message })
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { base64 } = await req.json().catch(() => ({}))
    console.log('base64 received:', { length: base64?.length || 0 })
    if (!base64 || typeof base64 !== 'string' || base64.length < 100) {
      return new Response(JSON.stringify({ safe: true, reason: 'no_image' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_KEY')
    console.log('anthropic key present:', !!anthropicKey, 'len:', anthropicKey?.length || 0)
    if (!anthropicKey) {
      return new Response(JSON.stringify({ safe: true, reason: 'no_key' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Detect image format from base64 magic bytes
    const detectMime = (b64: string): string => {
      if (b64.startsWith('/9j/')) return 'image/jpeg'
      if (b64.startsWith('iVBORw')) return 'image/png'
      if (b64.startsWith('R0lGOD')) return 'image/gif'
      if (b64.startsWith('UklGR')) return 'image/webp'
      return 'image/jpeg'
    }
    const mediaType = detectMime(base64)

    const apiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 64,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: 'You are a strict content moderator for a social events app. Examine this image. Reply with EXACTLY one word: BLOCK or OK.\n\nReply BLOCK if the image contains ANY of:\n- Nudity (full or partial), bare breasts, exposed genitals, buttocks\n- Underwear / lingerie / swimsuit shown in a sexual or revealing way\n- Sexually suggestive poses or contexts\n- Sexual or pornographic content\n- A person who looks under 18\n- Drugs, weapons, blood, gore, violence\n- Hate symbols, offensive gestures\n\nReply OK only if the image is completely safe.\nWhen in doubt, reply BLOCK.' },
          ],
        }],
      }),
    })

    const data = await apiResp.json()
    console.log('moderate-photo Anthropic response:', JSON.stringify({ status: apiResp.status, content: data?.content, error: data?.error, mediaType, base64Len: base64.length }))

    if (apiResp.status !== 200) {
      return new Response(JSON.stringify({ safe: true, reason: 'api_http_error', status: apiResp.status, detail: data?.error?.message || null }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!data?.content?.[0]?.text) {
      return new Response(JSON.stringify({ safe: true, reason: 'no_content', detail: data?.error?.message || null }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const answer = String(data.content[0].text).trim().toUpperCase()
    // BLOCK anywhere in answer = unsafe; OK = safe; anything else = block (strict)
    const safe = answer.includes('OK') && !answer.includes('BLOCK')
    return new Response(JSON.stringify({ safe, answer }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ safe: true, reason: 'exception', error: String(e) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
