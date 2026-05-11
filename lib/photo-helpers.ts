import { supabase } from './supabase'

// Upload a base64-encoded JPEG to Supabase Storage at avatars/{userId}/{slot}_{ts}.jpg
// Returns the public URL or null on error.
export const uploadPhotoToStorage = async (base64: string, userId: string, slot: number): Promise<string | null> => {
  try {
    const path = `${userId}/${slot}_${Date.now()}.jpg`
    const byteChars = atob(base64)
    const byteArr = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i)
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, byteArr, { upsert: true, contentType: 'image/jpeg' })
    if (error) { console.warn('Storage upload error:', error.message); return null }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    console.log('✅ Upload success, public URL:', data.publicUrl)
    return data.publicUrl
  } catch (e) {
    console.warn('Upload failed:', e)
    return null
  }
}

// Calls the moderate-photo edge function. Returns true if safe (or on any
// error — better to allow than block users when moderation is unavailable).
export async function isImageSafe(base64: string): Promise<boolean> {
  if (!base64 || base64.length < 100) return true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return true // not logged in yet — skip
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    const res = await fetch(`${supabaseUrl}/functions/v1/moderate-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ base64 }),
    })
    const json = await res.json()
    return json?.safe !== false
  } catch { return true }
}
