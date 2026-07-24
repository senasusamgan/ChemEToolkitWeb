import { useState } from 'react'
import {
  LevenbergMarquardtRegressionCalculationError,
  calculateLevenbergMarquardtRegression,
} from './engine'
import type { LevenbergMarquardtRegressionResult } from './types'
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
  x1: '0', y1: '2',
  x2: '1', y2: '2.983649',
  x3: '2', y3: '4.451082',
  x4: '3', y4: '6.640234',
  initialA: '1',
  initialB: '0.1',
  initialDamping: '0.01',
  tolerance: '0.0000000001',
  maximumIterations: '200',
}

export function LevenbergMarquardtRegressionCalculator() {
  const [x1, setX1] = useState(example.x1)
  const [y1, setY1] = useState(example.y1)
  const [x2, setX2] = useState(example.x2)
  const [y2, setY2] = useState(example.y2)
  const [x3, setX3] = useState(example.x3)
  const [y3, setY3] = useState(example.y3)
  const [x4, setX4] = useState(example.x4)
  const [y4, setY4] = useState(example.y4)
  const [initialA, setInitialA] = useState(example.initialA)
  const [initialB, setInitialB] = useState(example.initialB)
  const [initialDamping, setInitialDamping] = useState(example.initialDamping)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<LevenbergMarquardtRegressionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateLevenbergMarquardtRegression({
        x1: Number(x1), y1: Number(y1),
        x2: Number(x2), y2: Number(y2),
        x3: Number(x3), y3: Number(y3),
        x4: Number(x4), y4: Number(y4),
        initialA: Number(initialA),
        initialB: Number(initialB),
        initialDamping: Number(initialDamping),
        tolerance: Number(tolerance),
        maximumIterations: Number(maximumIterations),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof LevenbergMarquardtRegressionCalculationError
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
    setInitialA(example.initialA)
    setInitialB(example.initialB)
    setInitialDamping(example.initialDamping)
    setTolerance(example.tolerance)
    setMaximumIterations(example.maximumIterations)
    setResult(null); setErrorMessage('')
  }

  function clearInputs() {
    setX1(''); setY1('')
    setX2(''); setY2('')
    setX3(''); setY3('')
    setX4(''); setY4('')
    setInitialA(''); setInitialB('')
    setInitialDamping('')
    setTolerance(''); setMaximumIterations('')
    setResult(null); setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–25"
        icon="∿"
        title="Levenberg–Marquardt Regression"
        subtitle="Damped nonlinear least squares for an exponential model"
      />

      <ReferenceBasis>
        y = a exp(bx) with adaptive damping
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
        <NumericInput label="Initial Parameter" symbol="a₀" value={initialA} unit="—" onChange={setInitialA} />
        <NumericInput label="Initial Parameter" symbol="b₀" value={initialB} unit="1/x" onChange={setInitialB} />
        <NumericInput label="Initial Damping" symbol="λ₀" value={initialDamping} unit="—" onChange={setInitialDamping} />
        <NumericInput label="Parameter Tolerance" symbol="tol" value={tolerance} unit="—" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="—" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Fit with LM" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Parameter a"
          headlineValue={formatEngineeringNumber(result.parameterA)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Parameter b" value={formatEngineeringNumber(result.parameterB)} unit="1/x" />
          <ResultItem label="RMSE" value={formatEngineeringNumber(result.rootMeanSquareError)} unit="—" />
          <ResultItem label="Residual Sum of Squares" value={formatEngineeringNumber(result.residualSumOfSquares)} unit="—" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Accepted Steps" value={String(result.acceptedSteps)} unit="steps" />
          <ResultItem label="Rejected Steps" value={String(result.rejectedSteps)} unit="steps" />
          <ResultItem label="Final Damping" value={formatEngineeringNumber(result.finalDamping)} unit="—" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
