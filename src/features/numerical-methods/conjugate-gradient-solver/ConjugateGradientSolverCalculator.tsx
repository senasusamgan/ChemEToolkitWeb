import { useState } from 'react'
import {
  ConjugateGradientSolverCalculationError,
  calculateConjugateGradientSolver,
} from './engine'
import type { ConjugateGradientSolverResult } from './types'
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
  a11: '4', a12: '1', a13: '1',
  a22: '3', a23: '0.5', a33: '2',
  b1: '1', b2: '2', b3: '3',
  initialX1: '0', initialX2: '0', initialX3: '0',
  tolerance: '0.0000000001',
  maximumIterations: '100',
}

export function ConjugateGradientSolverCalculator() {
  const [a11, setA11] = useState(example.a11)
  const [a12, setA12] = useState(example.a12)
  const [a13, setA13] = useState(example.a13)
  const [a22, setA22] = useState(example.a22)
  const [a23, setA23] = useState(example.a23)
  const [a33, setA33] = useState(example.a33)
  const [b1, setB1] = useState(example.b1)
  const [b2, setB2] = useState(example.b2)
  const [b3, setB3] = useState(example.b3)
  const [initialX1, setInitialX1] = useState(example.initialX1)
  const [initialX2, setInitialX2] = useState(example.initialX2)
  const [initialX3, setInitialX3] = useState(example.initialX3)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<ConjugateGradientSolverResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateConjugateGradientSolver({
        a11: Number(a11), a12: Number(a12), a13: Number(a13),
        a22: Number(a22), a23: Number(a23), a33: Number(a33),
        b1: Number(b1), b2: Number(b2), b3: Number(b3),
        initialX1: Number(initialX1),
        initialX2: Number(initialX2),
        initialX3: Number(initialX3),
        tolerance: Number(tolerance),
        maximumIterations: Number(maximumIterations),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ConjugateGradientSolverCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setA11(example.a11); setA12(example.a12); setA13(example.a13)
    setA22(example.a22); setA23(example.a23); setA33(example.a33)
    setB1(example.b1); setB2(example.b2); setB3(example.b3)
    setInitialX1(example.initialX1); setInitialX2(example.initialX2); setInitialX3(example.initialX3)
    setTolerance(example.tolerance); setMaximumIterations(example.maximumIterations)
    setResult(null); setErrorMessage('')
  }

  function clearInputs() {
    setA11(''); setA12(''); setA13('')
    setA22(''); setA23(''); setA33('')
    setB1(''); setB2(''); setB3('')
    setInitialX1(''); setInitialX2(''); setInitialX3('')
    setTolerance(''); setMaximumIterations('')
    setResult(null); setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–15"
        icon="↻"
        title="Conjugate Gradient Solver"
        subtitle="Iterative solution of a symmetric positive-definite 3×3 system"
      />

      <ReferenceBasis>
        Residual-orthogonal Krylov iteration
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Matrix Entry" symbol="a₁₁" value={a11} unit="—" onChange={setA11} />
        <NumericInput label="Matrix Entry" symbol="a₁₂" value={a12} unit="—" onChange={setA12} />
        <NumericInput label="Matrix Entry" symbol="a₁₃" value={a13} unit="—" onChange={setA13} />
        <NumericInput label="Matrix Entry" symbol="a₂₂" value={a22} unit="—" onChange={setA22} />
        <NumericInput label="Matrix Entry" symbol="a₂₃" value={a23} unit="—" onChange={setA23} />
        <NumericInput label="Matrix Entry" symbol="a₃₃" value={a33} unit="—" onChange={setA33} />
        <NumericInput label="Right-Hand Side" symbol="b₁" value={b1} unit="—" onChange={setB1} />
        <NumericInput label="Right-Hand Side" symbol="b₂" value={b2} unit="—" onChange={setB2} />
        <NumericInput label="Right-Hand Side" symbol="b₃" value={b3} unit="—" onChange={setB3} />
        <NumericInput label="Initial Guess" symbol="x₁,₀" value={initialX1} unit="—" onChange={setInitialX1} />
        <NumericInput label="Initial Guess" symbol="x₂,₀" value={initialX2} unit="—" onChange={setInitialX2} />
        <NumericInput label="Initial Guess" symbol="x₃,₀" value={initialX3} unit="—" onChange={setInitialX3} />
        <NumericInput label="Relative Tolerance" symbol="tol" value={tolerance} unit="—" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="—" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Run conjugate gradient" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Solution x₁"
          headlineValue={formatEngineeringNumber(result.x1)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Solution x₂" value={formatEngineeringNumber(result.x2)} unit="—" />
          <ResultItem label="Solution x₃" value={formatEngineeringNumber(result.x3)} unit="—" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
          <ResultItem label="Residual Norm" value={formatEngineeringNumber(result.residualNorm)} unit="—" />
          <ResultItem label="Relative Residual" value={formatEngineeringNumber(result.relativeResidual)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
