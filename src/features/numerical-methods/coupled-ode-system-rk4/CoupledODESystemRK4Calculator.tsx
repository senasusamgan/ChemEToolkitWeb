import { useState } from 'react'
import {
  CoupledODESystemRK4CalculationError,
  calculateCoupledODESystemRK4,
} from './engine'
import type { CoupledODESystemRK4Result } from './types'
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
  initialX: '0',
  finalX: '5',
  initialY1: '1',
  initialY2: '0',
  a11: '-1',
  a12: '1',
  a21: '-2',
  a22: '-0.5',
  b1: '0',
  b2: '1',
  stepSize: '0.05',
}

export function CoupledODESystemRK4Calculator() {
  const [initialX, setInitialX] = useState(example.initialX)
  const [finalX, setFinalX] = useState(example.finalX)
  const [initialY1, setInitialY1] = useState(example.initialY1)
  const [initialY2, setInitialY2] = useState(example.initialY2)
  const [a11, setA11] = useState(example.a11)
  const [a12, setA12] = useState(example.a12)
  const [a21, setA21] = useState(example.a21)
  const [a22, setA22] = useState(example.a22)
  const [b1, setB1] = useState(example.b1)
  const [b2, setB2] = useState(example.b2)
  const [stepSize, setStepSize] = useState(example.stepSize)

  const [result, setResult] =
    useState<CoupledODESystemRK4Result | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateCoupledODESystemRK4({
        initialX: Number(initialX),
        finalX: Number(finalX),
        initialY1: Number(initialY1),
        initialY2: Number(initialY2),
        a11: Number(a11),
        a12: Number(a12),
        a21: Number(a21),
        a22: Number(a22),
        b1: Number(b1),
        b2: Number(b2),
        stepSize: Number(stepSize),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CoupledODESystemRK4CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setInitialX(example.initialX)
    setFinalX(example.finalX)
    setInitialY1(example.initialY1)
    setInitialY2(example.initialY2)
    setA11(example.a11)
    setA12(example.a12)
    setA21(example.a21)
    setA22(example.a22)
    setB1(example.b1)
    setB2(example.b2)
    setStepSize(example.stepSize)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInitialX('')
    setFinalX('')
    setInitialY1('')
    setInitialY2('')
    setA11('')
    setA12('')
    setA21('')
    setA22('')
    setB1('')
    setB2('')
    setStepSize('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–13"
        icon="⇄"
        title="Coupled ODE System RK4"
        subtitle="Classical RK4 integration for a two-state linear dynamic system"
      />

      <ReferenceBasis>
        y₁′ = a₁₁y₁ + a₁₂y₂ + b₁ · y₂′ = a₂₁y₁ + a₂₂y₂ + b₂
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Initial x" symbol="x₀" value={initialX} unit="—" onChange={setInitialX} />
        <NumericInput label="Final x" symbol="xf" value={finalX} unit="—" onChange={setFinalX} />
        <NumericInput label="Initial State 1" symbol="y₁,₀" value={initialY1} unit="—" onChange={setInitialY1} />
        <NumericInput label="Initial State 2" symbol="y₂,₀" value={initialY2} unit="—" onChange={setInitialY2} />
        <NumericInput label="Matrix Coefficient" symbol="a₁₁" value={a11} unit="1/x" onChange={setA11} />
        <NumericInput label="Matrix Coefficient" symbol="a₁₂" value={a12} unit="1/x" onChange={setA12} />
        <NumericInput label="Matrix Coefficient" symbol="a₂₁" value={a21} unit="1/x" onChange={setA21} />
        <NumericInput label="Matrix Coefficient" symbol="a₂₂" value={a22} unit="1/x" onChange={setA22} />
        <NumericInput label="Forcing 1" symbol="b₁" value={b1} unit="state/x" onChange={setB1} />
        <NumericInput label="Forcing 2" symbol="b₂" value={b2} unit="state/x" onChange={setB2} />
        <NumericInput label="Step Size" symbol="h" value={stepSize} unit="x" onChange={setStepSize} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Integrate coupled system" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Final state 1"
          headlineValue={formatEngineeringNumber(result.finalY1)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Final State 2" value={formatEngineeringNumber(result.finalY2)} unit="—" />
          <ResultItem label="State Norm" value={formatEngineeringNumber(result.stateNorm)} unit="—" />
          <ResultItem label="Final x" value={formatEngineeringNumber(result.finalX)} unit="—" />
          <ResultItem label="Step Count" value={String(result.stepCount)} unit="steps" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
