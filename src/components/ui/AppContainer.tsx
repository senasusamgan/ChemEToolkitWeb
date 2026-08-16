/**
 * AppContainer
 * Primary layout container with responsive max-width and gutters
 */

import type { ReactNode } from 'react'
import './AppContainer.css'

interface AppContainerProps {
  children: ReactNode
  width?: 'full' | 'content'
  className?: string
}

export function AppContainer({
  children,
  width = 'full',
  className = '',
}: AppContainerProps) {
  return (
    <div
      className={`app-container app-container--${width} ${className}`}
    >
      {children}
    </div>
  )
}
