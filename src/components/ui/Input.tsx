/**
 * Input
 * Text input field component
 */

import type { InputHTMLAttributes } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  className?: string
}

export function Input({
  error = false,
  className = '',
  ...props
}: InputProps) {
  const errorClass = error ? 'input--error' : ''

  return (
    <input
      className={`input ${errorClass} ${className}`}
      {...props}
    />
  )
}
