import { useState } from 'react'
import {
  ThomasTridiagonalSolverCalculationError,
  calculateThomasTridiagonalSolver,
} from './engine'
import type { ThomasTridiagonalSolverResult } from './types'
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
  lower1: '-1',
  lower2: '-1',
  lower3: '-1',
  diagonal1: '4',
  diagonal2: '4',
  diagonal3: '4',
  diagonal4: '4',
  upper1: '-1',
  upper2: '-1',
  upper3: '-1',
  rhs1: '5',
  rhs2: '5',
  rhs3: '10',
  rhs4: '23',
}

export function ThomasTridiagonalSolverCalculator() {
  const [lower1, setLower1] = useState(example.lower1)
  const [lower2, setLower2] = useState(example.lower2)
  const [lower3, setLower3] = useState(example.lower3)
  const [diagonal1, setDiagonal1] = useState(example.diagonal1)
  const [diagonal2, setDiagonal2] = useState(example.diagonal2)
  const [diagonal3, setDiagonal3] = useState(example.diagonal3)
  const [diagonal4, setDiagonal4] = useState(example.diagonal4)
  const [upper1, setUpper1] = useState(example.upper1)
  const [upper2, setUpper2] = useState(example.upper2)
  const [upper3, setUpper3] = useState(example.upper3)
  const [rhs1, setRhs1] = useState(example.rhs1)
  const [rhs2, setRhs2] = useState(example.rhs2)
  const [rhs3, setRhs3] = useState(example.rhs3)
  const [rhs4, setRhs4] = useState(example.rhs4)

  const [result, setResult] =
    useState<ThomasTridiagonalSolverResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateThomasTridiagonalSolver({
        lower1: Number(lower1),
        lower2: Number(lower2),
        lower3: Number(lower3),
        diagonal1: Number(diagonal1),
        diagonal2: Number(diagonal2),
        diagonal3: Number(diagonal3),
        diagonal4: Number(diagonal4),
        upper1: Number(upper1),
        upper2: Number(upper2),
        upper3: Number(upper3),
        rhs1: Number(rhs1),
        rhs2: Number(rhs2),
        rhs3: Number(rhs3),
        rhs4: Number(rhs4),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ThomasTridiagonalSolverCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLower1(example.lower1)
    setLower2(example.lower2)
    setLower3(example.lower3)
    setDiagonal1(example.diagonal1)
    setDiagonal2(example.diagonal2)
    setDiagonal3(example.diagonal3)
    setDiagonal4(example.diagonal4)
    setUpper1(example.upper1)
    setUpper2(example.upper2)
    setUpper3(example.upper3)
    setRhs1(example.rhs1)
    setRhs2(example.rhs2)
    setRhs3(example.rhs3)
    setRhs4(example.rhs4)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLower1('')
    setLower2('')
    setLower3('')
    setDiagonal1('')
    setDiagonal2('')
    setDiagonal3('')
    setDiagonal4('')
    setUpper1('')
    setUpper2('')
    setUpper3('')
    setRhs1('')
    setRhs2('')
    setRhs3('')
    setRhs4('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–40"
        icon="T"
        title="Thomas Tridiagonal Solver"
        subtitle="Efficient direct solution of a 4×4 tridiagonal system"
      />

      <ReferenceBasis>
        Forward elimination and backward substitution without pivoting
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Lower Diagonal" symbol="a₂" value={lower1} unit="—" onChange={setLower1} />
        <NumericInput label="Lower Diagonal" symbol="a₃" value={lower2} unit="—" onChange={setLower2} />
        <NumericInput label="Lower Diagonal" symbol="a₄" value={lower3} unit="—" onChange={setLower3} />
        <NumericInput label="Main Diagonal" symbol="b₁" value={diagonal1} unit="—" onChange={setDiagonal1} />
        <NumericInput label="Main Diagonal" symbol="b₂" value={diagonal2} unit="—" onChange={setDiagonal2} />
        <NumericInput label="Main Diagonal" symbol="b₃" value={diagonal3} unit="—" onChange={setDiagonal3} />
        <NumericInput label="Main Diagonal" symbol="b₄" value={diagonal4} unit="—" onChange={setDiagonal4} />
        <NumericInput label="Upper Diagonal" symbol="c₁" value={upper1} unit="—" onChange={setUpper1} />
        <NumericInput label="Upper Diagonal" symbol="c₂" value={upper2} unit="—" onChange={setUpper2} />
        <NumericInput label="Upper Diagonal" symbol="c₃" value={upper3} unit="—" onChange={setUpper3} />
        <NumericInput label="Right-Hand Side" symbol="d₁" value={rhs1} unit="—" onChange={setRhs1} />
        <NumericInput label="Right-Hand Side" symbol="d₂" value={rhs2} unit="—" onChange={setRhs2} />
        <NumericInput label="Right-Hand Side" symbol="d₃" value={rhs3} unit="—" onChange={setRhs3} />
        <NumericInput label="Right-Hand Side" symbol="d₄" value={rhs4} unit="—" onChange={setRhs4} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve tridiagonal system" />

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
          <ResultItem label="Solution x₄" value={formatEngineeringNumber(result.x4)} unit="—" />
          <ResultItem label="Residual Norm" value={formatEngineeringNumber(result.residualNorm)} unit="—" />
          <ResultItem label="Minimum Modified Pivot" value={formatEngineeringNumber(result.minimumModifiedPivot)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
