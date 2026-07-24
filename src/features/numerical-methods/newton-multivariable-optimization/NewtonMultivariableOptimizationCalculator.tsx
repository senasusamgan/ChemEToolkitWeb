import { useState } from 'react'
import {
  NewtonMultivariableOptimizationCalculationError,
  calculateNewtonMultivariableOptimization,
} from './engine'
import type { NewtonMultivariableOptimizationResult } from './types'
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
  q11: '4',
  q12: '1',
  q22: '3',
  c1: '-1',
  c2: '-2',
  initialX: '10',
  initialY: '-5',
  tolerance: '0.0000000001',
  maximumIterations: '10',
}

export function NewtonMultivariableOptimizationCalculator() {
  const [q11, setQ11] = useState(example.q11)
  const [q12, setQ12] = useState(example.q12)
  const [q22, setQ22] = useState(example.q22)
  const [c1, setC1] = useState(example.c1)
  const [c2, setC2] = useState(example.c2)
  const [initialX, setInitialX] = useState(example.initialX)
  const [initialY, setInitialY] = useState(example.initialY)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<NewtonMultivariableOptimizationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateNewtonMultivariableOptimization({
        q11: Number(q11),
        q12: Number(q12),
        q22: Number(q22),
        c1: Number(c1),
        c2: Number(c2),
        initialX: Number(initialX),
        initialY: Number(initialY),
        tolerance: Number(tolerance),
        maximumIterations: Number(maximumIterations),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof NewtonMultivariableOptimizationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setQ11(example.q11)
    setQ12(example.q12)
    setQ22(example.q22)
    setC1(example.c1)
    setC2(example.c2)
    setInitialX(example.initialX)
    setInitialY(example.initialY)
    setTolerance(example.tolerance)
    setMaximumIterations(example.maximumIterations)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setQ11('')
    setQ12('')
    setQ22('')
    setC1('')
    setC2('')
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
        code="NM–31"
        icon="∇²"
        title="Newton Multivariable Optimization"
        subtitle="Second-order minimization of a two-variable quadratic"
      />

      <ReferenceBasis>
        xₖ₊₁ = xₖ − H⁻¹∇f
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Hessian Entry" symbol="q₁₁" value={q11} unit="—" onChange={setQ11} />
        <NumericInput label="Hessian Entry" symbol="q₁₂" value={q12} unit="—" onChange={setQ12} />
        <NumericInput label="Hessian Entry" symbol="q₂₂" value={q22} unit="—" onChange={setQ22} />
        <NumericInput label="Linear Coefficient" symbol="c₁" value={c1} unit="—" onChange={setC1} />
        <NumericInput label="Linear Coefficient" symbol="c₂" value={c2} unit="—" onChange={setC2} />
        <NumericInput label="Initial x" symbol="x₀" value={initialX} unit="—" onChange={setInitialX} />
        <NumericInput label="Initial y" symbol="y₀" value={initialY} unit="—" onChange={setInitialY} />
        <NumericInput label="Gradient Tolerance" symbol="tol" value={tolerance} unit="—" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="—" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Run Newton optimization" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Optimized x"
          headlineValue={formatEngineeringNumber(result.optimumX)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Optimized y" value={formatEngineeringNumber(result.optimumY)} unit="—" />
          <ResultItem label="Objective Value" value={formatEngineeringNumber(result.objectiveValue)} unit="—" />
          <ResultItem label="Gradient Norm" value={formatEngineeringNumber(result.gradientNorm)} unit="—" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
          <ResultItem label="Hessian Determinant" value={formatEngineeringNumber(result.determinant)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
