const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_profile, candidates } = await req.json()

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prompt = `You are a social compatibility matcher for Parea, a nightlife & events app. Score each candidate's compatibility with the user on a scale of 0-100.

User profile:
- Name: ${user_profile.name}, Age: ${user_profile.age}
- Languages: ${(user_profile.langs || []).join(', ') || 'unknown'}
- Interests: ${(user_profile.interests || []).join(', ') || 'unknown'}
- Drinks: ${user_profile.drinksPref || 'unknown'}
- Smoking: ${user_profile.smokingPref || 'unknown'}
- Bio: ${user_profile.bio || ''}
- Transport: ${user_profile.transport || 'unknown'}

Candidates:
${candidates.map((c: any, i: number) => `${i + 1}. ID: ${c.id}
   Name: ${c.name}, Age: ${c.age}
   Languages: ${(c.langs || []).join(', ') || 'unknown'}
   Interests: ${(c.interests || []).join(', ') || 'unknown'}
   Drinks: ${c.drinksPref || 'unknown'}
   Smoking: ${c.smokingPref || 'unknown'}
   Bio: ${c.bio || ''}
   Transport: ${c.transport || 'unknown'}`).join('\n\n')}

Return ONLY a valid JSON array, no explanation, no markdown. Format: [{"id":"...","score":85,"vibe":"Music & food"}]

Scoring weights:
- Shared interests: 40%
- Language overlap (at least 1 common): 25%
- Lifestyle match (drinks + smoking): 20%
- Bio vibe similarity: 10%
- Transport complement (car+lift = bonus): 5%

"vibe" must be a short 2-3 word tag in English describing their match (e.g. "Outdoor lovers", "Music & food", "Tech & coffee").`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const scores: { id: string; score: number; vibe: string }[] = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : []

    const scored = candidates
      .map((c: any) => {
        const match = scores.find((s: any) => String(s.id) === String(c.id))
        return { ...c, score: match?.score ?? 50, vibe: match?.vibe ?? '' }
      })
      .sort((a: any, b: any) => b.score - a.score)

    return new Response(JSON.stringify(scored), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('match-crew error:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
