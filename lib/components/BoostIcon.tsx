import React from 'react'
import { Rocket } from 'lucide-react-native'

// Boost icon — Lucide's diagonal rocket. Matches the Flaticon reference Daria
// picked (line-art diagonal rocket with flame). Single stroke so the parent
// picks color. Replaces an earlier 3-sparkle-stars version she found too busy.
export function BoostIcon({ size = 24, color = '#fff' }: { size?: number; color?: string }) {
  // Stroke width scales subtly with size so tiny pills (10px) don't go fuzzy.
  const stroke = size <= 12 ? 2.4 : size <= 18 ? 2.2 : 2
  return <Rocket size={size} color={color} strokeWidth={stroke} />
}
