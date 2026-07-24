import type { ReactNode } from 'react'
import './batch01.css'

export function formatEngineeringNumber(value: number): string {
  if (Object.is(value, -0) || Math.abs(value) < 1e-14) {
    return '0'
  }

  const absolute = Math.abs(value)

  if (absolute >= 1e6 || absolute < 1e-4) {
    return value.toExponential(6).replace(/\.0+e/, 'e')
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 10,
  }).format(value)
}

interface CalculatorHeaderProps {
  code: string
  icon: string
  title: string
  subtitle: string
}

export function CalculatorHeader({
  code,
  icon,
  title,
  subtitle,
}: CalculatorHeaderProps) {
  return (
    <header className="native-calculator-header">
      <div className="native-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p>Mass Transfer · {code}</p>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
    </header>
  )
}

interface ReferenceBasisProps {
  children: ReactNode
}

export function ReferenceBasis({ children }: ReferenceBasisProps) {
  return (
    <aside className="native-reference">
      <strong>Reference basis</strong>
      <span>{children}</span>
      <a href="#references">View bibliography ↘</a>
    </aside>
  )
}

interface NumericInputProps {
  label: string
  symbol?: string
  value: string
  unit: string
  placeholder?: string
  onChange: (value: string) => void
}

export function NumericInput({
  label,
  symbol,
  value,
  unit,
  placeholder,
  onChange,
}: NumericInputProps) {
  return (
    <label>
      <span>
        {label}
        {symbol ? <small className="native-symbol"> {symbol}</small> : null}
      </span>
      <span className="native-input-shell">
        <input
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        <b>{unit}</b>
      </span>
    </label>
  )
}

interface ActionBarProps {
  onLoadExample: () => void
  onClear: () => void
  onCalculate: () => void
  calculateLabel: string
}

export function ActionBar({
  onLoadExample,
  onClear,
  onCalculate,
  calculateLabel,
}: ActionBarProps) {
  return (
    <div className="native-actions">
      <button type="button" onClick={onLoadExample}>
        Load example
      </button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
      <button
        type="button"
        className="native-primary-action"
        onClick={onCalculate}
      >
        ▦ {calculateLabel}
      </button>
    </div>
  )
}

interface ResultItemProps {
  label: string
  value: string
  unit: string
}

export function ResultItem({ label, value, unit }: ResultItemProps) {
  return (
    <article>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{unit}</span>
    </article>
  )
}

interface ResultPanelProps {
  headlineLabel: string
  headlineValue: string
  modelName: string
  children: ReactNode
  note?: string
}

export function ResultPanel({
  headlineLabel,
  headlineValue,
  modelName,
  children,
  note,
}: ResultPanelProps) {
  return (
    <div className="native-result-panel" aria-live="polite">
      <div className="native-result-heading">
        <div>
          <p>{headlineLabel}</p>
          <strong>{headlineValue}</strong>
        </div>
        <span>{modelName}</span>
      </div>
      <div className="native-result-grid">{children}</div>
      {note ? <p className="native-limitation">{note}</p> : null}
    </div>
  )
}
