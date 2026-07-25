import { useState } from 'react'
import {
  PowerMethodEigenvalueCalculationError,
  calculatePowerMethodEigenvalue,
} from './engine'
import type { PowerMethodEigenvalueResult } from './types'
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
  a11: '4', a12: '1', a13: '0',
  a21: '1', a22: '3', a23: '0',
  a31: '0', a32: '0', a33: '1',
  initialX1: '1', initialX2: '1', initialX3: '1',
  tolerance: '0.0000000001',
  maximumIterations: '200',
}

export function PowerMethodEigenvalueCalculator() {
  const [a11, setA11] = useState(example.a11)
  const [a12, setA12] = useState(example.a12)
  const [a13, setA13] = useState(example.a13)
  const [a21, setA21] = useState(example.a21)
  const [a22, setA22] = useState(example.a22)
  const [a23, setA23] = useState(example.a23)
  const [a31, setA31] = useState(example.a31)
  const [a32, setA32] = useState(example.a32)
  const [a33, setA33] = useState(example.a33)
  const [initialX1, setInitialX1] = useState(example.initialX1)
  const [initialX2, setInitialX2] = useState(example.initialX2)
  const [initialX3, setInitialX3] = useState(example.initialX3)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<PowerMethodEigenvalueResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculatePowerMethodEigenvalue({
        a11: Number(a11), a12: Number(a12), a13: Number(a13),
        a21: Number(a21), a22: Number(a22), a23: Number(a23),
        a31: Number(a31), a32: Number(a32), a33: Number(a33),
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
        error instanceof PowerMethodEigenvalueCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setA11(example.a11); setA12(example.a12); setA13(example.a13)
    setA21(example.a21); setA22(example.a22); setA23(example.a23)
    setA31(example.a31); setA32(example.a32); setA33(example.a33)
    setInitialX1(example.initialX1)
    setInitialX2(example.initialX2)
    setInitialX3(example.initialX3)
    setTolerance(example.tolerance)
    setMaximumIterations(example.maximumIterations)
    setResult(null); setErrorMessage('')
  }

  function clearInputs() {
    setA11(''); setA12(''); setA13('')
    setA21(''); setA22(''); setA23('')
    setA31(''); setA32(''); setA33('')
    setInitialX1(''); setInitialX2(''); setInitialX3('')
    setTolerance(''); setMaximumIterations('')
    setResult(null); setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–35"
        icon="λ"
        title="Power Method Eigenvalue"
        subtitle="Dominant eigenvalue and eigenvector of a 3×3 matrix"
      />

      <ReferenceBasis>
        vₖ₊₁ = Avₖ / ‖Avₖ‖
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Matrix Entry" symbol="a₁₁" value={a11} unit="—" onChange={setA11} />
        <NumericInput label="Matrix Entry" symbol="a₁₂" value={a12} unit="—" onChange={setA12} />
        <NumericInput label="Matrix Entry" symbol="a₁₃" value={a13} unit="—" onChange={setA13} />
        <NumericInput label="Matrix Entry" symbol="a₂₁" value={a21} unit="—" onChange={setA21} />
        <NumericInput label="Matrix Entry" symbol="a₂₂" value={a22} unit="—" onChange={setA22} />
        <NumericInput label="Matrix Entry" symbol="a₂₃" value={a23} unit="—" onChange={setA23} />
        <NumericInput label="Matrix Entry" symbol="a₃₁" value={a31} unit="—" onChange={setA31} />
        <NumericInput label="Matrix Entry" symbol="a₃₂" value={a32} unit="—" onChange={setA32} />
        <NumericInput label="Matrix Entry" symbol="a₃₃" value={a33} unit="—" onChange={setA33} />
        <NumericInput label="Initial Vector" symbol="v₁" value={initialX1} unit="—" onChange={setInitialX1} />
        <NumericInput label="Initial Vector" symbol="v₂" value={initialX2} unit="—" onChange={setInitialX2} />
        <NumericInput label="Initial Vector" symbol="v₃" value={initialX3} unit="—" onChange={setInitialX3} />
        <NumericInput label="Eigenvalue Tolerance" symbol="tol" value={tolerance} unit="—" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="—" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Run power method" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Dominant eigenvalue"
          headlineValue={formatEngineeringNumber(result.eigenvalue)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Eigenvector Component 1" value={formatEngineeringNumber(result.eigenvector1)} unit="—" />
          <ResultItem label="Eigenvector Component 2" value={formatEngineeringNumber(result.eigenvector2)} unit="—" />
          <ResultItem label="Eigenvector Component 3" value={formatEngineeringNumber(result.eigenvector3)} unit="—" />
          <ResultItem label="Residual Norm" value={formatEngineeringNumber(result.residualNorm)} unit="—" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
