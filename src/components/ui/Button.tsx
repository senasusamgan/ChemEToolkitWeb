/**
 * Button
 * Primary interactive button component
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = size !== 'md' ? `button--${size}` : ''

  return (
    <button
      className={`button button--${variant} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
