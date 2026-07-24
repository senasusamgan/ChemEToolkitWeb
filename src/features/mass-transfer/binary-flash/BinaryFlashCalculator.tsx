import { useState } from 'react'
import {
  BinaryFlashCalculationError,
  calculateBinaryFlash,
  phaseStateTitle,
} from './engine'
import type { BinaryFlashResult } from './types'
import './binaryFlash.css'

const EXAMPLE = {
  feedFlowRate: '100',
  feedLightMoleFraction: '0.5',
  lightComponentKValue: '2',
  heavyComponentKValue: '0.5',
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 1e-12) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 10,
  }).format(value)
}

export function BinaryFlashCalculator() {
  const [feedFlowRate, setFeedFlowRate] = useState(
    EXAMPLE.feedFlowRate,
  )
  const [
    feedLightMoleFraction,
    setFeedLightMoleFraction,
  ] = useState(EXAMPLE.feedLightMoleFraction)
  const [
    lightComponentKValue,
    setLightComponentKValue,
  ] = useState(EXAMPLE.lightComponentKValue)
  const [
    heavyComponentKValue,
    setHeavyComponentKValue,
  ] = useState(EXAMPLE.heavyComponentKValue)

  const [result, setResult] =
    useState<BinaryFlashResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      const nextResult = calculateBinaryFlash({
        feedFlowRate: Number(feedFlowRate),
        feedLightMoleFraction: Number(
          feedLightMoleFraction,
        ),
        lightComponentKValue: Number(
          lightComponentKValue,
        ),
        heavyComponentKValue: Number(
          heavyComponentKValue,
        ),
      })

      setResult(nextResult)
      setErrorMessage('')
    } catch (error) {
      setResult(null)

      if (error instanceof BinaryFlashCalculationError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'The calculation could not be completed.',
        )
      }
    }
  }

  function loadExample() {
    setFeedFlowRate(EXAMPLE.feedFlowRate)
    setFeedLightMoleFraction(
      EXAMPLE.feedLightMoleFraction,
    )
    setLightComponentKValue(
      EXAMPLE.lightComponentKValue,
    )
    setHeavyComponentKValue(
      EXAMPLE.heavyComponentKValue,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedFlowRate('')
    setFeedLightMoleFraction('')
    setLightComponentKValue('')
    setHeavyComponentKValue('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div className="native-icon">◐</div>
        <div>
          <p>Mass Transfer · MT–29</p>
          <h2>Binary Flash Calculation</h2>
          <span>
            Phase state, vapor fraction and equilibrium
            compositions
          </span>
        </div>
      </header>

      <aside className="native-reference">
        <strong>Reference basis</strong>
        <span>Rachford–Rice equation · constant K-values</span>
        <a href="#references">View bibliography ↘</a>
      </aside>

      <div className="native-formula">
        Σ zᵢ(Kᵢ − 1) / [1 + β(Kᵢ − 1)] = 0
      </div>

      <div className="native-input-grid">
        <label>
          <span>Feed Flow Rate</span>
          <span className="native-input-shell">
            <input
              inputMode="decimal"
              value={feedFlowRate}
              onChange={(event) =>
                setFeedFlowRate(event.target.value)
              }
            />
            <b>mol/s</b>
          </span>
        </label>

        <label>
          <span>Feed Light Fraction</span>
          <span className="native-input-shell">
            <input
              inputMode="decimal"
              value={feedLightMoleFraction}
              onChange={(event) =>
                setFeedLightMoleFraction(
                  event.target.value,
                )
              }
            />
            <b>—</b>
          </span>
        </label>

        <label>
          <span>Light-Component K-Value</span>
          <span className="native-input-shell">
            <input
              inputMode="decimal"
              value={lightComponentKValue}
              onChange={(event) =>
                setLightComponentKValue(
                  event.target.value,
                )
              }
            />
            <b>—</b>
          </span>
        </label>

        <label>
          <span>Heavy-Component K-Value</span>
          <span className="native-input-shell">
            <input
              inputMode="decimal"
              value={heavyComponentKValue}
              onChange={(event) =>
                setHeavyComponentKValue(
                  event.target.value,
                )
              }
            />
            <b>—</b>
          </span>
        </label>
      </div>

      <div className="native-actions">
        <button type="button" onClick={loadExample}>
          Load example
        </button>
        <button type="button" onClick={clearInputs}>
          Clear
        </button>
        <button
          type="button"
          className="native-primary-action"
          onClick={calculate}
        >
          ▦ Solve binary flash
        </button>
      </div>

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div className="native-result-panel" aria-live="polite">
          <div className="native-result-heading">
            <div>
              <p>Phase state</p>
              <strong>
                {phaseStateTitle(result.phaseState)}
              </strong>
            </div>
            <span>{result.modelName}</span>
          </div>

          <div className="native-result-grid">
            <ResultItem
              label="Vapor Fraction"
              value={formatNumber(result.vaporFraction)}
              unit="—"
            />
            <ResultItem
              label="Liquid Fraction"
              value={formatNumber(result.liquidFraction)}
              unit="—"
            />
            <ResultItem
              label="Vapor Flow"
              value={formatNumber(result.vaporFlowRate)}
              unit="mol/s"
            />
            <ResultItem
              label="Liquid Flow"
              value={formatNumber(result.liquidFlowRate)}
              unit="mol/s"
            />
            <ResultItem
              label="Vapor Light Fraction"
              value={formatNumber(
                result.vaporLightMoleFraction,
              )}
              unit="—"
            />
            <ResultItem
              label="Liquid Light Fraction"
              value={formatNumber(
                result.liquidLightMoleFraction,
              )}
              unit="—"
            />
            <ResultItem
              label="Rachford–Rice Residual"
              value={formatNumber(
                result.rachfordRiceResidual,
              )}
              unit="—"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

interface ResultItemProps {
  label: string
  value: string
  unit: string
}

function ResultItem({
  label,
  value,
  unit,
}: ResultItemProps) {
  return (
    <article>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{unit}</span>
    </article>
  )
}
