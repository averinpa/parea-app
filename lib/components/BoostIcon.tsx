import React from 'react'
import Svg, { Path } from 'react-native-svg'

// Boost icon — three ascending sparkle stars (small, medium, large) on the
// bottom-left → top-right diagonal. Generated for Parea's Boost feature
// (premium, ascending, sparkle vibe) — distinct from Tinder/Bumble flame
// and from any rocket/arrow shapes. Single fill so the parent picks color.
export function BoostIcon({ size = 24, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 14L5.75 16.25L8 17L5.75 17.75L5 20L4.25 17.75L2 17L4.25 16.25L5 14Z" fill={color} />
      <Path d="M11.5 8L12.5 11L15.5 12L12.5 13L11.5 16L10.5 13L7.5 12L10.5 11L11.5 8Z" fill={color} />
      <Path d="M18 2L19.5 6.5L24 8L19.5 9.5L18 14L16.5 9.5L12 8L16.5 6.5L18 2Z" fill={color} />
    </Svg>
  )
}
