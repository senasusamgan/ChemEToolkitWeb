import { useState } from 'react'
import {
  CubicHermiteInterpolationCalculationError,
  calculateCubicHermiteInterpolation,
} from './engine'
import type { CubicHermiteInterpolationResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

const example = {
  x0: '0',
  x1: '2',
  y0: '1',
  y1: '5',
  derivative0: '0',
  derivative1: '4',
  evaluationX: '1',
}

export function CubicHermiteInterpolationCalculator() {
  const [x0, setX0] = useState(example.x0)
  const [x1, setX1] = useState(example.x1)
  const [y0, setY0] = useState(example.y0)
  const [y1, setY1] = useState(example.y1)
  const [derivative0, setDerivative0] = useState(example.derivative0)
  const [derivative1, setDerivative1] = useState(example.derivative1)
  const [evaluationX, setEvaluationX] = useState(example.evaluationX)

  const [result, setResult] =
    useState<CubicHermiteInterpolationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateCubicHermiteInterpolation({
        x0: Number(x0),
        x1: Number(x1),
        y0: Number(y0),
        y1: Number(y1),
        derivative0: Number(derivative0),
        derivative1: Number(derivative1),
        evaluationX: Number(evaluationX),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CubicHermiteInterpolationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setX0(example.x0)
    setX1(example.x1)
    setY0(example.y0)
    setY1(example.y1)
    setDerivative0(example.derivative0)
    setDerivative1(example.derivative1)
    setEvaluationX(example.evaluationX)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setX0('')
    setX1('')
    setY0('')
    setY1('')
    setDerivative0('')
    setDerivative1('')
    setEvaluationX('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–18"
        icon="⌁"
        title="Cubic Hermite Interpolation"
        subtitle="Value and slope interpolation using endpoint values and derivatives"
      />

      <ReferenceBasis>
        Cubic Hermite basis functions h₀₀, h₁₀, h₀₁ and h₁₁
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Left Coordinate" symbol="x₀" value={x0} unit="—" onChange={setX0} />
        <NumericInput label="Right Coordinate" symbol="x₁" value={x1} unit="—" onChange={setX1} />
        <NumericInput label="Left Value" symbol="y₀" value={y0} unit="—" onChange={setY0} />
        <NumericInput label="Right Value" symbol="y₁" value={y1} unit="—" onChange={setY1} />
        <NumericInput label="Left Derivative" symbol="y′₀" value={derivative0} unit="y/x" onChange={setDerivative0} />
        <NumericInput label="Right Derivative" symbol="y′₁" value={derivative1} unit="y/x" onChange={setDerivative1} />
        <NumericInput label="Evaluation Coordinate" symbol="x" value={evaluationX} unit="—" onChange={setEvaluationX} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Interpolate" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Interpolated value"
          headlineValue={formatEngineeringNumber(result.interpolatedValue)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Interpolated Derivative" value={formatEngineeringNumber(result.interpolatedDerivative)} unit="y/x" />
          <ResultItem label="Normalized Coordinate" value={formatEngineeringNumber(result.normalizedCoordinate)} unit="—" />
          <ResultItem label="Basis h₀₀" value={formatEngineeringNumber(result.h00)} unit="—" />
          <ResultItem label="Basis h₁₀" value={formatEngineeringNumber(result.h10)} unit="—" />
          <ResultItem label="Basis h₀₁" value={formatEngineeringNumber(result.h01)} unit="—" />
          <ResultItem label="Basis h₁₁" value={formatEngineeringNumber(result.h11)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
