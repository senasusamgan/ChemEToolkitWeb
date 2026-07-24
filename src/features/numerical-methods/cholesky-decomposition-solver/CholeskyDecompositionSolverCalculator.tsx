import { useState } from 'react'
import {
  CholeskyDecompositionSolverCalculationError,
  calculateCholeskyDecompositionSolver,
} from './engine'
import type { CholeskyDecompositionSolverResult } from './types'
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
}

export function CholeskyDecompositionSolverCalculator() {
  const [a11, setA11] = useState(example.a11)
  const [a12, setA12] = useState(example.a12)
  const [a13, setA13] = useState(example.a13)
  const [a22, setA22] = useState(example.a22)
  const [a23, setA23] = useState(example.a23)
  const [a33, setA33] = useState(example.a33)
  const [b1, setB1] = useState(example.b1)
  const [b2, setB2] = useState(example.b2)
  const [b3, setB3] = useState(example.b3)

  const [result, setResult] =
    useState<CholeskyDecompositionSolverResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateCholeskyDecompositionSolver({
        a11: Number(a11), a12: Number(a12), a13: Number(a13),
        a22: Number(a22), a23: Number(a23), a33: Number(a33),
        b1: Number(b1), b2: Number(b2), b3: Number(b3),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CholeskyDecompositionSolverCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setA11(example.a11); setA12(example.a12); setA13(example.a13)
    setA22(example.a22); setA23(example.a23); setA33(example.a33)
    setB1(example.b1); setB2(example.b2); setB3(example.b3)
    setResult(null); setErrorMessage('')
  }

  function clearInputs() {
    setA11(''); setA12(''); setA13('')
    setA22(''); setA23(''); setA33('')
    setB1(''); setB2(''); setB3('')
    setResult(null); setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–14"
        icon="△"
        title="Cholesky Decomposition Solver"
        subtitle="Direct solution of a symmetric positive-definite 3×3 system"
      />

      <ReferenceBasis>
        A = LLᵀ followed by forward and backward substitution
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
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Factor and solve" />

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
          <ResultItem label="Determinant" value={formatEngineeringNumber(result.determinant)} unit="—" />
          <ResultItem label="Residual Norm" value={formatEngineeringNumber(result.residualNorm)} unit="—" />
          <ResultItem label="L Diagonal" value={`${formatEngineeringNumber(result.l11)}, ${formatEngineeringNumber(result.l22)}, ${formatEngineeringNumber(result.l33)}`} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
