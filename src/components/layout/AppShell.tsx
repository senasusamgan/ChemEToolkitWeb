/**
 * AppShell
 * Application shell structure
 */

import type { ReactNode } from 'react'
import './AppShell.css'

interface AppShellProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
}

export function AppShell({
  children,
  header,
  footer,
  className = '',
}: AppShellProps) {
  return (
    <div className={`app-shell ${className}`}>
      {header}
      <main className="app-shell__main">
        {children}
      </main>
      {footer}
    </div>
  )
}
