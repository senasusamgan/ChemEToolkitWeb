import { useState } from 'react'
import {
  NaturalCubicSplineInterpolationCalculationError,
  calculateNaturalCubicSplineInterpolation,
} from './engine'
import type { NaturalCubicSplineInterpolationResult } from './types'
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
  x1: '0', y1: '0',
  x2: '1', y2: '1',
  x3: '2', y3: '0',
  x4: '3', y4: '1',
  evaluationX: '1.5',
}

export function NaturalCubicSplineInterpolationCalculator() {
  const [x1, setX1] = useState(example.x1)
  const [y1, setY1] = useState(example.y1)
  const [x2, setX2] = useState(example.x2)
  const [y2, setY2] = useState(example.y2)
  const [x3, setX3] = useState(example.x3)
  const [y3, setY3] = useState(example.y3)
  const [x4, setX4] = useState(example.x4)
  const [y4, setY4] = useState(example.y4)
  const [evaluationX, setEvaluationX] = useState(example.evaluationX)

  const [result, setResult] =
    useState<NaturalCubicSplineInterpolationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateNaturalCubicSplineInterpolation({
        x1: Number(x1), y1: Number(y1),
        x2: Number(x2), y2: Number(y2),
        x3: Number(x3), y3: Number(y3),
        x4: Number(x4), y4: Number(y4),
        evaluationX: Number(evaluationX),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof NaturalCubicSplineInterpolationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setX1(example.x1); setY1(example.y1)
    setX2(example.x2); setY2(example.y2)
    setX3(example.x3); setY3(example.y3)
    setX4(example.x4); setY4(example.y4)
    setEvaluationX(example.evaluationX)
    setResult(null); setErrorMessage('')
  }

  function clearInputs() {
    setX1(''); setY1('')
    setX2(''); setY2('')
    setX3(''); setY3('')
    setX4(''); setY4('')
    setEvaluationX('')
    setResult(null); setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–29"
        icon="⌁"
        title="Natural Cubic Spline Interpolation"
        subtitle="Smooth interpolation through four ordered data points"
      />

      <ReferenceBasis>
        Piecewise cubic interpolation with natural endpoint conditions
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Point 1 — x" symbol="x₁" value={x1} unit="—" onChange={setX1} />
        <NumericInput label="Point 1 — y" symbol="y₁" value={y1} unit="—" onChange={setY1} />
        <NumericInput label="Point 2 — x" symbol="x₂" value={x2} unit="—" onChange={setX2} />
        <NumericInput label="Point 2 — y" symbol="y₂" value={y2} unit="—" onChange={setY2} />
        <NumericInput label="Point 3 — x" symbol="x₃" value={x3} unit="—" onChange={setX3} />
        <NumericInput label="Point 3 — y" symbol="y₃" value={y3} unit="—" onChange={setY3} />
        <NumericInput label="Point 4 — x" symbol="x₄" value={x4} unit="—" onChange={setX4} />
        <NumericInput label="Point 4 — y" symbol="y₄" value={y4} unit="—" onChange={setY4} />
        <NumericInput label="Evaluation Coordinate" symbol="x" value={evaluationX} unit="—" onChange={setEvaluationX} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Interpolate spline" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Interpolated value"
          headlineValue={formatEngineeringNumber(result.interpolatedValue)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="First Derivative" value={formatEngineeringNumber(result.interpolatedFirstDerivative)} unit="y/x" />
          <ResultItem label="Second Derivative" value={formatEngineeringNumber(result.interpolatedSecondDerivative)} unit="y/x²" />
          <ResultItem label="Active Interval" value={String(result.intervalIndex)} unit="—" />
          <ResultItem label="Node Second Derivatives" value={`${formatEngineeringNumber(result.secondDerivative1)}, ${formatEngineeringNumber(result.secondDerivative2)}, ${formatEngineeringNumber(result.secondDerivative3)}, ${formatEngineeringNumber(result.secondDerivative4)}`} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
