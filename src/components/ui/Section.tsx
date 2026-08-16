/**
 * Section
 * Page section container with optional header
 */

import type { ReactNode } from 'react'
import './Section.css'

interface SectionProps {
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
}

export function Section({
  children,
  title,
  description,
  size = 'md',
  className = '',
  id,
}: SectionProps) {
  const sizeClass = size !== 'md' ? `section--${size}` : ''

  return (
    <section
      id={id}
      className={`section ${sizeClass} ${className}`}
    >
      {(title || description) && (
        <div className="section__header">
          {title && <h2 className="section__title">{title}</h2>}
          {description && <p className="section__description">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
