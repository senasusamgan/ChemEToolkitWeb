import { useState } from 'react'
import {
  AdaptiveRungeKutta45CalculationError,
  calculateAdaptiveRungeKutta45,
} from './engine'
import type { AdaptiveRungeKutta45Result } from './types'
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
  initialY: '1',
  coefficientA: '-0.8',
  forcingB: '1.5',
  initialStepSize: '0.5',
  absoluteTolerance: '0.00000001',
  relativeTolerance: '0.000001',
  maximumSteps: '10000',
}

export function AdaptiveRungeKutta45Calculator() {
  const [initialX, setInitialX] = useState(example.initialX)
  const [finalX, setFinalX] = useState(example.finalX)
  const [initialY, setInitialY] = useState(example.initialY)
  const [coefficientA, setCoefficientA] = useState(example.coefficientA)
  const [forcingB, setForcingB] = useState(example.forcingB)
  const [initialStepSize, setInitialStepSize] = useState(example.initialStepSize)
  const [absoluteTolerance, setAbsoluteTolerance] = useState(example.absoluteTolerance)
  const [relativeTolerance, setRelativeTolerance] = useState(example.relativeTolerance)
  const [maximumSteps, setMaximumSteps] = useState(example.maximumSteps)

  const [result, setResult] =
    useState<AdaptiveRungeKutta45Result | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateAdaptiveRungeKutta45({
          initialX: Number(initialX),
          finalX: Number(finalX),
          initialY: Number(initialY),
          coefficientA: Number(coefficientA),
          forcingB: Number(forcingB),
          initialStepSize: Number(initialStepSize),
          absoluteTolerance: Number(absoluteTolerance),
          relativeTolerance: Number(relativeTolerance),
          maximumSteps: Number(maximumSteps),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof AdaptiveRungeKutta45CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setInitialX(example.initialX)
    setFinalX(example.finalX)
    setInitialY(example.initialY)
    setCoefficientA(example.coefficientA)
    setForcingB(example.forcingB)
    setInitialStepSize(example.initialStepSize)
    setAbsoluteTolerance(example.absoluteTolerance)
    setRelativeTolerance(example.relativeTolerance)
    setMaximumSteps(example.maximumSteps)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInitialX('')
    setFinalX('')
    setInitialY('')
    setCoefficientA('')
    setForcingB('')
    setInitialStepSize('')
    setAbsoluteTolerance('')
    setRelativeTolerance('')
    setMaximumSteps('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–12"
        icon="↝"
        title="Adaptive Runge–Kutta 4/5"
        subtitle="Dormand–Prince integration with automatic step-size control"
      />

      <ReferenceBasis>
        Linear ODE model y′ = ay + b
      </ReferenceBasis>

      <div className="native-formula">
        Embedded RK5/RK4 local-error estimate
      </div>

      <div className="native-input-grid">
        <NumericInput label="Initial x" symbol="x₀" value={initialX} unit="—" onChange={setInitialX} />
        <NumericInput label="Final x" symbol="xf" value={finalX} unit="—" onChange={setFinalX} />
        <NumericInput label="Initial y" symbol="y₀" value={initialY} unit="—" onChange={setInitialY} />
        <NumericInput label="Linear Coefficient" symbol="a" value={coefficientA} unit="1/x" onChange={setCoefficientA} />
        <NumericInput label="Constant Forcing" symbol="b" value={forcingB} unit="y/x" onChange={setForcingB} />
        <NumericInput label="Initial Step Size" symbol="h₀" value={initialStepSize} unit="x" onChange={setInitialStepSize} />
        <NumericInput label="Absolute Tolerance" symbol="atol" value={absoluteTolerance} unit="—" onChange={setAbsoluteTolerance} />
        <NumericInput label="Relative Tolerance" symbol="rtol" value={relativeTolerance} unit="—" onChange={setRelativeTolerance} />
        <NumericInput label="Maximum Attempts" symbol="Nmax" value={maximumSteps} unit="—" onChange={setMaximumSteps} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Integrate adaptively"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Final y"
          headlineValue={formatEngineeringNumber(result.finalY)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Accepted Steps" value={String(result.acceptedSteps)} unit="steps" />
          <ResultItem label="Rejected Steps" value={String(result.rejectedSteps)} unit="steps" />
          <ResultItem label="Total Attempts" value={String(result.totalAttempts)} unit="attempts" />
          <ResultItem label="Minimum Accepted Step" value={formatEngineeringNumber(result.minimumAcceptedStep)} unit="x" />
          <ResultItem label="Maximum Accepted Step" value={formatEngineeringNumber(result.maximumAcceptedStep)} unit="x" />
          <ResultItem label="Last Error Estimate" value={formatEngineeringNumber(result.lastErrorEstimate)} unit="—" />
          <ResultItem label="Suggested Next Step" value={formatEngineeringNumber(result.finalStepSize)} unit="x" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
