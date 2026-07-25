import { useState } from 'react'
import {
  PDControllerCalculationError,
  calculatePDController,
} from './engine'
import type { PDControllerResult } from './types'
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
  controllerBias: '50',
  controllerGain: '2',
  derivativeTime: '1.5',
  currentError: '4',
  previousError: '3',
  sampleTime: '0.5',
  minimumOutput: '0',
  maximumOutput: '100',
}

export function PDControllerCalculator() {
  const [controllerBias, setControllerBias] = useState(example.controllerBias)
  const [controllerGain, setControllerGain] = useState(example.controllerGain)
  const [derivativeTime, setDerivativeTime] = useState(example.derivativeTime)
  const [currentError, setCurrentError] = useState(example.currentError)
  const [previousError, setPreviousError] = useState(example.previousError)
  const [sampleTime, setSampleTime] = useState(example.sampleTime)
  const [minimumOutput, setMinimumOutput] = useState(example.minimumOutput)
  const [maximumOutput, setMaximumOutput] = useState(example.maximumOutput)

  const [result, setResult] =
    useState<PDControllerResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculatePDController({
            controllerBias: Number(controllerBias),
            controllerGain: Number(controllerGain),
            derivativeTime: Number(derivativeTime),
            currentError: Number(currentError),
            previousError: Number(previousError),
            sampleTime: Number(sampleTime),
            minimumOutput: Number(minimumOutput),
            maximumOutput: Number(maximumOutput),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof PDControllerCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setControllerBias(example.controllerBias)
    setControllerGain(example.controllerGain)
    setDerivativeTime(example.derivativeTime)
    setCurrentError(example.currentError)
    setPreviousError(example.previousError)
    setSampleTime(example.sampleTime)
    setMinimumOutput(example.minimumOutput)
    setMaximumOutput(example.maximumOutput)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setControllerBias('')
    setControllerGain('')
    setDerivativeTime('')
    setCurrentError('')
    setPreviousError('')
    setSampleTime('')
    setMinimumOutput('')
    setMaximumOutput('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–21"
        icon="PD"
        title="PD Controller"
        subtitle="Discrete proportional–derivative output with saturation"
      />

      <ReferenceBasis>
        u = ub + Kc[e + Td(de/dt)]
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Controller Bias"
          symbol="ub"
          value={controllerBias}
          unit="%"
          onChange={setControllerBias}
        />
        <NumericInput
          label="Controller Gain"
          symbol="Kc"
          value={controllerGain}
          unit="%/error"
          onChange={setControllerGain}
        />
        <NumericInput
          label="Derivative Time"
          symbol="Td"
          value={derivativeTime}
          unit="time"
          onChange={setDerivativeTime}
        />
        <NumericInput
          label="Current Error"
          symbol="ek"
          value={currentError}
          unit="error"
          onChange={setCurrentError}
        />
        <NumericInput
          label="Previous Error"
          symbol="ek−1"
          value={previousError}
          unit="error"
          onChange={setPreviousError}
        />
        <NumericInput
          label="Sample Time"
          symbol="Δt"
          value={sampleTime}
          unit="time"
          onChange={setSampleTime}
        />
        <NumericInput
          label="Minimum Output"
          symbol="umin"
          value={minimumOutput}
          unit="%"
          onChange={setMinimumOutput}
        />
        <NumericInput
          label="Maximum Output"
          symbol="umax"
          value={maximumOutput}
          unit="%"
          onChange={setMaximumOutput}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate PD output"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Controller output"
          headlineValue={formatEngineeringNumber(result.controllerOutput)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Error Derivative"
            value={formatEngineeringNumber(result.errorDerivative)}
            unit="error/time"
          />
          <ResultItem
            label="Proportional Contribution"
            value={formatEngineeringNumber(result.proportionalContribution)}
            unit="%"
          />
          <ResultItem
            label="Derivative Contribution"
            value={formatEngineeringNumber(result.derivativeContribution)}
            unit="%"
          />
          <ResultItem
            label="Raw Output"
            value={formatEngineeringNumber(result.rawOutput)}
            unit="%"
          />
          <ResultItem
            label="Output Limited"
            value={result.outputWasLimited ? 'Yes' : 'No'}
            unit=""
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
