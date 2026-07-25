import { useState } from 'react'
import {
  CascadeControlCalculationError,
  calculateCascadeControl,
} from './engine'
import type { CascadeControlResult } from './types'
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
  primaryControllerGain: '2',
  secondaryControllerGain: '3',
  primaryProcessGain: '1.5',
  secondaryProcessGain: '2',
  primaryMeasurementGain: '1',
  secondaryMeasurementGain: '1',
  primarySetpoint: '10',
  secondaryDisturbance: '2',
}

export function CascadeControlCalculator() {
  const [primaryControllerGain, setPrimaryControllerGain] = useState(example.primaryControllerGain)
  const [secondaryControllerGain, setSecondaryControllerGain] = useState(example.secondaryControllerGain)
  const [primaryProcessGain, setPrimaryProcessGain] = useState(example.primaryProcessGain)
  const [secondaryProcessGain, setSecondaryProcessGain] = useState(example.secondaryProcessGain)
  const [primaryMeasurementGain, setPrimaryMeasurementGain] = useState(example.primaryMeasurementGain)
  const [secondaryMeasurementGain, setSecondaryMeasurementGain] = useState(example.secondaryMeasurementGain)
  const [primarySetpoint, setPrimarySetpoint] = useState(example.primarySetpoint)
  const [secondaryDisturbance, setSecondaryDisturbance] = useState(example.secondaryDisturbance)

  const [result, setResult] =
    useState<CascadeControlResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCascadeControl({
            primaryControllerGain: Number(primaryControllerGain),
            secondaryControllerGain: Number(secondaryControllerGain),
            primaryProcessGain: Number(primaryProcessGain),
            secondaryProcessGain: Number(secondaryProcessGain),
            primaryMeasurementGain: Number(primaryMeasurementGain),
            secondaryMeasurementGain: Number(secondaryMeasurementGain),
            primarySetpoint: Number(primarySetpoint),
            secondaryDisturbance: Number(secondaryDisturbance),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CascadeControlCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setPrimaryControllerGain(example.primaryControllerGain)
    setSecondaryControllerGain(example.secondaryControllerGain)
    setPrimaryProcessGain(example.primaryProcessGain)
    setSecondaryProcessGain(example.secondaryProcessGain)
    setPrimaryMeasurementGain(example.primaryMeasurementGain)
    setSecondaryMeasurementGain(example.secondaryMeasurementGain)
    setPrimarySetpoint(example.primarySetpoint)
    setSecondaryDisturbance(example.secondaryDisturbance)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setPrimaryControllerGain('')
    setSecondaryControllerGain('')
    setPrimaryProcessGain('')
    setSecondaryProcessGain('')
    setPrimaryMeasurementGain('')
    setSecondaryMeasurementGain('')
    setPrimarySetpoint('')
    setSecondaryDisturbance('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–02"
        icon="⇉"
        title="Cascade Control"
        subtitle="Screen nested primary and secondary feedback loops"
      />

      <ReferenceBasis>
        G₂,cl = Kc₂Kp₂ / (1 + Kc₂Kp₂H₂)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Primary Controller Gain"
          symbol="Kc₁"
          value={primaryControllerGain}
          unit="—"
          onChange={setPrimaryControllerGain}
        />
        <NumericInput
          label="Secondary Controller Gain"
          symbol="Kc₂"
          value={secondaryControllerGain}
          unit="—"
          onChange={setSecondaryControllerGain}
        />
        <NumericInput
          label="Primary Process Gain"
          symbol="Kp₁"
          value={primaryProcessGain}
          unit="—"
          onChange={setPrimaryProcessGain}
        />
        <NumericInput
          label="Secondary Process Gain"
          symbol="Kp₂"
          value={secondaryProcessGain}
          unit="—"
          onChange={setSecondaryProcessGain}
        />
        <NumericInput
          label="Primary Measurement Gain"
          symbol="H₁"
          value={primaryMeasurementGain}
          unit="—"
          onChange={setPrimaryMeasurementGain}
        />
        <NumericInput
          label="Secondary Measurement Gain"
          symbol="H₂"
          value={secondaryMeasurementGain}
          unit="—"
          onChange={setSecondaryMeasurementGain}
        />
        <NumericInput
          label="Primary Setpoint"
          symbol="R₁"
          value={primarySetpoint}
          unit="signal"
          onChange={setPrimarySetpoint}
        />
        <NumericInput
          label="Secondary Disturbance"
          symbol="D₂"
          value={secondaryDisturbance}
          unit="signal"
          onChange={setSecondaryDisturbance}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Analyze cascade loops"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Primary output"
          headlineValue={formatEngineeringNumber(result.primaryOutput)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Secondary Loop Gain"
            value={formatEngineeringNumber(result.secondaryLoopGain)}
            unit="—"
          />
          <ResultItem
            label="Secondary Closed-Loop Gain"
            value={formatEngineeringNumber(result.secondaryClosedLoopGain)}
            unit="—"
          />
          <ResultItem
            label="Secondary Disturbance Attenuation"
            value={formatEngineeringNumber(result.secondaryDisturbanceAttenuation)}
            unit="—"
          />
          <ResultItem
            label="Primary Loop Gain"
            value={formatEngineeringNumber(result.primaryLoopGain)}
            unit="—"
          />
          <ResultItem
            label="Primary Closed-Loop Gain"
            value={formatEngineeringNumber(result.primaryClosedLoopGain)}
            unit="—"
          />
          <ResultItem
            label="Setpoint Contribution"
            value={formatEngineeringNumber(result.setpointContribution)}
            unit="signal"
          />
          <ResultItem
            label="Disturbance Contribution"
            value={formatEngineeringNumber(result.disturbanceContribution)}
            unit="signal"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
