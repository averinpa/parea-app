// Pure helper functions extracted from index.tsx (Stage 1 of refactor).

export const prettyEventTime = (s: string | undefined | null) => {
  if (!s) return s
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return s
    .replace(/(\d{4})-(\d{2})-(\d{2})/, (_, _y, m, d) => `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]}`)
    .replace(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/, (_, d, m, y) => `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`)
}

// Maximum age gap (in years) Parea considers compatible for social matching.
// Tighter than dating apps (Parea = events/companions), wider than ±5 to allow
// inter-generational social mixing. Hard-applied only at FEED discovery — once a
// joiner has the event (e.g. via deep link), the host decides for themselves.
export const MAX_AGE_GAP = 15

// Score a join requester's compatibility with the host (0–100)
export function scoreRequesterForHost(
  req: { langs?: string[]; age?: number; drinksPref?: string; smokingPref?: string; interests?: string[] },
  host: { langs?: string[]; age?: string | number; drinksPref?: string; smokingPref?: string; interests?: string[] },
  eventCategory?: string
): number {
  let score = 0
  // Language overlap (30 pts)
  const reqLangs = req.langs || []
  const hostLangs = host.langs || []
  const langOverlap = reqLangs.filter(l => hostLangs.includes(l)).length
  score += Math.min(30, langOverlap * 18)
  // Age proximity (25 pts)
  const hAge = typeof host.age === 'string' ? parseInt(host.age || '25') : (host.age || 25)
  const ageDiff = Math.abs((req.age || 25) - hAge)
  score += ageDiff <= 3 ? 25 : ageDiff <= 7 ? 18 : ageDiff <= 12 ? 10 : 3
  // Lifestyle match (25 pts)
  if (!host.drinksPref || req.drinksPref === host.drinksPref) score += 13
  if (!host.smokingPref || req.smokingPref === host.smokingPref) score += 12
  // Interests overlap (20 pts)
  const reqI = req.interests || []
  const hostI = host.interests || []
  const overlap = reqI.filter(i => hostI.includes(i)).length
  if (overlap >= 2) score += 20
  else if (overlap === 1) score += 12
  else if (eventCategory && reqI.includes(eventCategory)) score += 8
  return Math.min(100, score)
}

// Score how well an event fits a requester (0–100)
export function scoreEventForRequester(
  user: { langs?: string[]; age?: string | number; drinksPref?: string; smokingPref?: string; interests?: string[] },
  event: { category?: string; title?: string; maxParticipants?: number }
): number {
  let score = 30 // base
  const interests = user.interests || []
  const category = event.category || ''
  // Category matches interests (35 pts)
  if (interests.includes(category)) score += 35
  else if (interests.some(i => category.includes(i) || i.includes(category))) score += 18
  // Title keyword match (15 pts)
  const titleWords = (event.title || '').toLowerCase().split(/\s+/)
  const titleHits = interests.filter(i => titleWords.some(w => w.includes(i.toLowerCase()) || i.toLowerCase().includes(w))).length
  score += Math.min(15, titleHits * 8)
  // Group size preference (20 pts)
  const max = event.maxParticipants || 5
  const age = typeof user.age === 'string' ? parseInt(user.age || '25') : (user.age || 25)
  if (max <= 2) score += age < 28 ? 20 : 12
  else if (max <= 6) score += 20
  else score += 10
  return Math.min(100, score)
}
