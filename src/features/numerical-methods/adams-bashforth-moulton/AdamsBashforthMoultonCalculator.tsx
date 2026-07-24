import { useState } from 'react'
import {
  AdamsBashforthMoultonCalculationError,
  calculateAdamsBashforthMoulton,
} from './engine'
import type { AdamsBashforthMoultonResult } from './types'
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
  finalX: '2',
  initialY: '1',
  coefficientA: '-1',
  forcingB: '2',
  stepSize: '0.1',
}

export function AdamsBashforthMoultonCalculator() {
  const [initialX, setInitialX] =
    useState(example.initialX)
  const [finalX, setFinalX] =
    useState(example.finalX)
  const [initialY, setInitialY] =
    useState(example.initialY)
  const [coefficientA, setCoefficientA] =
    useState(example.coefficientA)
  const [forcingB, setForcingB] =
    useState(example.forcingB)
  const [stepSize, setStepSize] =
    useState(example.stepSize)

  const [result, setResult] =
    useState<AdamsBashforthMoultonResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateAdamsBashforthMoulton({
          initialX: Number(initialX),
          finalX: Number(finalX),
          initialY: Number(initialY),
          coefficientA: Number(coefficientA),
          forcingB: Number(forcingB),
          stepSize: Number(stepSize),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          AdamsBashforthMoultonCalculationError
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
    setStepSize(example.stepSize)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInitialX('')
    setFinalX('')
    setInitialY('')
    setCoefficientA('')
    setForcingB('')
    setStepSize('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–11"
        icon="∿"
        title="Adams–Bashforth–Moulton ODE"
        subtitle="Fourth-order predictor–corrector integration with RK4 startup"
      />

      <ReferenceBasis>
        Linear ODE model y′ = ay + b
      </ReferenceBasis>

      <div className="native-formula">
        AB4 predictor · AM4 corrector
      </div>

      <div className="native-input-grid">
        <NumericInput label="Initial x" symbol="x₀" value={initialX} unit="—" onChange={setInitialX} />
        <NumericInput label="Final x" symbol="xf" value={finalX} unit="—" onChange={setFinalX} />
        <NumericInput label="Initial y" symbol="y₀" value={initialY} unit="—" onChange={setInitialY} />
        <NumericInput label="Linear Coefficient" symbol="a" value={coefficientA} unit="1/x" onChange={setCoefficientA} />
        <NumericInput label="Constant Forcing" symbol="b" value={forcingB} unit="y/x" onChange={setForcingB} />
        <NumericInput label="Uniform Step Size" symbol="h" value={stepSize} unit="x" onChange={setStepSize} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Integrate with ABM4"
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
          <ResultItem label="Final x" value={formatEngineeringNumber(result.finalX)} unit="—" />
          <ResultItem label="Step Count" value={String(result.stepCount)} unit="steps" />
          <ResultItem label="Last Predictor" value={formatEngineeringNumber(result.lastPredictor)} unit="—" />
          <ResultItem label="Last Corrector" value={formatEngineeringNumber(result.lastCorrector)} unit="—" />
          <ResultItem label="Last Correction Magnitude" value={formatEngineeringNumber(result.lastCorrectionMagnitude)} unit="—" />
          <ResultItem label="Maximum Correction Magnitude" value={formatEngineeringNumber(result.maximumCorrectionMagnitude)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
