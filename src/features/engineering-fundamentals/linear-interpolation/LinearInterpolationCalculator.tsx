import { useState } from 'react'
import {
  LinearInterpolationCalculationError,
  calculateLinearInterpolation,
} from './engine'
import type { LinearInterpolationResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'

const EXAMPLE = {
  firstX: '0',
  firstY: '20',
  secondX: '10',
  secondY: '80',
  targetX: '4',
}

export function LinearInterpolationCalculator() {
  const [firstX, setFirstX] =
    useState(EXAMPLE.firstX)
  const [firstY, setFirstY] =
    useState(EXAMPLE.firstY)
  const [secondX, setSecondX] =
    useState(EXAMPLE.secondX)
  const [secondY, setSecondY] =
    useState(EXAMPLE.secondY)
  const [targetX, setTargetX] =
    useState(EXAMPLE.targetX)

  const [result, setResult] =
    useState<LinearInterpolationResult | null>(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  function calculate() {
    try {
      setResult(
        calculateLinearInterpolation({
          firstX: Number(firstX),
          firstY: Number(firstY),
          secondX: Number(secondX),
          secondY: Number(secondY),
          targetX: Number(targetX),
        }),
      )

      setErrorMessage('')
    } catch (error) {
      setResult(null)

      setErrorMessage(
        error instanceof LinearInterpolationCalculationError
          ? error.message
          : 'The interpolation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFirstX(EXAMPLE.firstX)
    setFirstY(EXAMPLE.firstY)
    setSecondX(EXAMPLE.secondX)
    setSecondY(EXAMPLE.secondY)
    setTargetX(EXAMPLE.targetX)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFirstX('')
    setFirstY('')
    setSecondX('')
    setSecondY('')
    setTargetX('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="EF–15"
        icon="↗"
        title="Linear Interpolation"
        subtitle="Estimate a value between two known data points"
      />

      <ReferenceBasis>
        First-degree interpolation between two tabulated points
      </ReferenceBasis>

      <div className="native-formula">
        y = y₁ + (x − x₁)(y₂ − y₁)/(x₂ − x₁)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="First x-value"
          symbol="x₁"
          value={firstX}
          unit="—"
          onChange={setFirstX}
        />
        <NumericInput
          label="First y-value"
          symbol="y₁"
          value={firstY}
          unit="—"
          onChange={setFirstY}
        />
        <NumericInput
          label="Second x-value"
          symbol="x₂"
          value={secondX}
          unit="—"
          onChange={setSecondX}
        />
        <NumericInput
          label="Second y-value"
          symbol="y₂"
          value={secondY}
          unit="—"
          onChange={setSecondY}
        />
        <NumericInput
          label="Target x-value"
          symbol="x"
          value={targetX}
          unit="—"
          onChange={setTargetX}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Interpolate value"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Interpolated y-value"
          headlineValue={formatEngineeringNumber(
            result.interpolatedY,
          )}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Position in interval"
            value={formatEngineeringNumber(
              100 * result.interpolationFraction,
            )}
            unit="%"
          />
          <ResultItem
            label="x-interval width"
            value={formatEngineeringNumber(
              result.intervalWidth,
            )}
            unit="—"
          />
          <ResultItem
            label="Evaluation type"
            value={
              result.isExtrapolation
                ? 'Extrapolation'
                : 'Interpolation'
            }
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
