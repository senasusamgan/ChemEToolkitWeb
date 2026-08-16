/**
 * AppHeader
 * Application header with navigation
 */

import type { ReactNode } from 'react'
import './AppHeader.css'

interface AppHeaderProps {
  brand: ReactNode
  navigation?: ReactNode
  className?: string
}

export function AppHeader({
  brand,
  navigation,
  className = '',
}: AppHeaderProps) {
  return (
    <header className={`app-header ${className}`}>
      {brand}
      {navigation && (
        <nav className="app-header__nav">
          {navigation}
        </nav>
      )}
    </header>
  )
}
