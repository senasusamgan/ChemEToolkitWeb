import { useState } from 'react'
import {
  PIControllerCalculationError,
  calculatePIController,
} from './engine'
import type { PIControllerResult } from './types'
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
  controllerBias: '40',
  controllerGain: '2',
  integralTime: '5',
  currentError: '3',
  previousIntegralState: '4',
  sampleTime: '1',
  minimumOutput: '0',
  maximumOutput: '100',
}

export function PIControllerCalculator() {
  const [controllerBias, setControllerBias] = useState(example.controllerBias)
  const [controllerGain, setControllerGain] = useState(example.controllerGain)
  const [integralTime, setIntegralTime] = useState(example.integralTime)
  const [currentError, setCurrentError] = useState(example.currentError)
  const [previousIntegralState, setPreviousIntegralState] = useState(example.previousIntegralState)
  const [sampleTime, setSampleTime] = useState(example.sampleTime)
  const [minimumOutput, setMinimumOutput] = useState(example.minimumOutput)
  const [maximumOutput, setMaximumOutput] = useState(example.maximumOutput)

  const [result, setResult] =
    useState<PIControllerResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculatePIController({
            controllerBias: Number(controllerBias),
            controllerGain: Number(controllerGain),
            integralTime: Number(integralTime),
            currentError: Number(currentError),
            previousIntegralState: Number(previousIntegralState),
            sampleTime: Number(sampleTime),
            minimumOutput: Number(minimumOutput),
            maximumOutput: Number(maximumOutput),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof PIControllerCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setControllerBias(example.controllerBias)
    setControllerGain(example.controllerGain)
    setIntegralTime(example.integralTime)
    setCurrentError(example.currentError)
    setPreviousIntegralState(example.previousIntegralState)
    setSampleTime(example.sampleTime)
    setMinimumOutput(example.minimumOutput)
    setMaximumOutput(example.maximumOutput)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setControllerBias('')
    setControllerGain('')
    setIntegralTime('')
    setCurrentError('')
    setPreviousIntegralState('')
    setSampleTime('')
    setMinimumOutput('')
    setMaximumOutput('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–22"
        icon="PI"
        title="PI Controller"
        subtitle="Discrete proportional–integral output with stored integral state"
      />

      <ReferenceBasis>
        u = ub + Kc[e + (1/Ti)∫e dt]
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
          label="Integral Time"
          symbol="Ti"
          value={integralTime}
          unit="time"
          onChange={setIntegralTime}
        />
        <NumericInput
          label="Current Error"
          symbol="ek"
          value={currentError}
          unit="error"
          onChange={setCurrentError}
        />
        <NumericInput
          label="Previous Integral State"
          symbol="Ik−1"
          value={previousIntegralState}
          unit="error·time"
          onChange={setPreviousIntegralState}
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
        calculateLabel="Calculate PI output"
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
            label="Proportional Contribution"
            value={formatEngineeringNumber(result.proportionalContribution)}
            unit="%"
          />
          <ResultItem
            label="Updated Integral State"
            value={formatEngineeringNumber(result.updatedIntegralState)}
            unit="error·time"
          />
          <ResultItem
            label="Integral Contribution"
            value={formatEngineeringNumber(result.integralContribution)}
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
