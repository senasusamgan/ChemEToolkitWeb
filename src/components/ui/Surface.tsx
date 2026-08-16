/**
 * Surface
 * Card-like container component with elevation options
 */

import type { ReactNode } from 'react'
import './Surface.css'

interface SurfaceProps {
  children: ReactNode
  variant?: 'base' | 'elevated' | 'subtle'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function Surface({
  children,
  variant = 'base',
  padding = 'md',
  className = '',
  as: Component = 'div',
}: SurfaceProps) {
  const variantClass = variant !== 'base' ? `surface--${variant}` : ''
  const paddingClass = padding !== 'none' ? `surface--padding-${padding}` : ''

  return (
    <Component
      className={`surface ${variantClass} ${paddingClass} ${className}`}
    >
      {children}
    </Component>
  )
}

export { Surface as Card }
