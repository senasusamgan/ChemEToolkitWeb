import { useState } from 'react'
import {
  BroydenNonlinearSystemCalculationError,
  calculateBroydenNonlinearSystem,
} from './engine'
import type { BroydenNonlinearSystemResult } from './types'
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
  circleConstant: '4',
  exponentialConstant: '3',
  initialX: '1',
  initialY: '1',
  tolerance: '0.0000000001',
  maximumIterations: '100',
}

export function BroydenNonlinearSystemCalculator() {
  const [circleConstant, setCircleConstant] = useState(example.circleConstant)
  const [exponentialConstant, setExponentialConstant] = useState(example.exponentialConstant)
  const [initialX, setInitialX] = useState(example.initialX)
  const [initialY, setInitialY] = useState(example.initialY)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<BroydenNonlinearSystemResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateBroydenNonlinearSystem({
        circleConstant: Number(circleConstant),
        exponentialConstant: Number(exponentialConstant),
        initialX: Number(initialX),
        initialY: Number(initialY),
        tolerance: Number(tolerance),
        maximumIterations: Number(maximumIterations),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof BroydenNonlinearSystemCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setCircleConstant(example.circleConstant)
    setExponentialConstant(example.exponentialConstant)
    setInitialX(example.initialX)
    setInitialY(example.initialY)
    setTolerance(example.tolerance)
    setMaximumIterations(example.maximumIterations)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setCircleConstant('')
    setExponentialConstant('')
    setInitialX('')
    setInitialY('')
    setTolerance('')
    setMaximumIterations('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–16"
        icon="ƒ"
        title="Broyden Nonlinear System"
        subtitle="Quasi-Newton solution of a two-equation nonlinear system"
      />

      <ReferenceBasis>
        f₁ = x² + y² − c₁ · f₂ = exp(x) + y − c₂
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Circle Constant" symbol="c₁" value={circleConstant} unit="—" onChange={setCircleConstant} />
        <NumericInput label="Exponential Equation Constant" symbol="c₂" value={exponentialConstant} unit="—" onChange={setExponentialConstant} />
        <NumericInput label="Initial Guess x" symbol="x₀" value={initialX} unit="—" onChange={setInitialX} />
        <NumericInput label="Initial Guess y" symbol="y₀" value={initialY} unit="—" onChange={setInitialY} />
        <NumericInput label="Residual Tolerance" symbol="tol" value={tolerance} unit="—" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="—" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve with Broyden" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Solution x"
          headlineValue={formatEngineeringNumber(result.x)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Solution y" value={formatEngineeringNumber(result.y)} unit="—" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
          <ResultItem label="Residual Norm" value={formatEngineeringNumber(result.residualNorm)} unit="—" />
          <ResultItem label="Equation 1 Residual" value={formatEngineeringNumber(result.equation1Residual)} unit="—" />
          <ResultItem label="Equation 2 Residual" value={formatEngineeringNumber(result.equation2Residual)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
