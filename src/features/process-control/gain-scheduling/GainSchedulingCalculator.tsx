import { useState } from 'react'
import {
  GainSchedulingCalculationError,
  calculateGainScheduling,
} from './engine'
import type { GainSchedulingResult } from './types'
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
  operatingPoint: '60',
  lowOperatingPoint: '20',
  highOperatingPoint: '100',
  lowControllerGain: '1',
  highControllerGain: '3',
  lowIntegralTime: '12',
  highIntegralTime: '6',
  lowDerivativeTime: '0',
  highDerivativeTime: '1.5',
}

export function GainSchedulingCalculator() {
  const [operatingPoint, setOperatingPoint] = useState(example.operatingPoint)
  const [lowOperatingPoint, setLowOperatingPoint] = useState(example.lowOperatingPoint)
  const [highOperatingPoint, setHighOperatingPoint] = useState(example.highOperatingPoint)
  const [lowControllerGain, setLowControllerGain] = useState(example.lowControllerGain)
  const [highControllerGain, setHighControllerGain] = useState(example.highControllerGain)
  const [lowIntegralTime, setLowIntegralTime] = useState(example.lowIntegralTime)
  const [highIntegralTime, setHighIntegralTime] = useState(example.highIntegralTime)
  const [lowDerivativeTime, setLowDerivativeTime] = useState(example.lowDerivativeTime)
  const [highDerivativeTime, setHighDerivativeTime] = useState(example.highDerivativeTime)

  const [result, setResult] =
    useState<GainSchedulingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateGainScheduling({
            operatingPoint: Number(operatingPoint),
            lowOperatingPoint: Number(lowOperatingPoint),
            highOperatingPoint: Number(highOperatingPoint),
            lowControllerGain: Number(lowControllerGain),
            highControllerGain: Number(highControllerGain),
            lowIntegralTime: Number(lowIntegralTime),
            highIntegralTime: Number(highIntegralTime),
            lowDerivativeTime: Number(lowDerivativeTime),
            highDerivativeTime: Number(highDerivativeTime),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof GainSchedulingCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setOperatingPoint(example.operatingPoint)
    setLowOperatingPoint(example.lowOperatingPoint)
    setHighOperatingPoint(example.highOperatingPoint)
    setLowControllerGain(example.lowControllerGain)
    setHighControllerGain(example.highControllerGain)
    setLowIntegralTime(example.lowIntegralTime)
    setHighIntegralTime(example.highIntegralTime)
    setLowDerivativeTime(example.lowDerivativeTime)
    setHighDerivativeTime(example.highDerivativeTime)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setOperatingPoint('')
    setLowOperatingPoint('')
    setHighOperatingPoint('')
    setLowControllerGain('')
    setHighControllerGain('')
    setLowIntegralTime('')
    setHighIntegralTime('')
    setLowDerivativeTime('')
    setHighDerivativeTime('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–09"
        icon="↔"
        title="Gain Scheduling"
        subtitle="Interpolate PID settings across an operating range"
      />

      <ReferenceBasis>
        K(ρ) = Klow + α(Khigh − Klow)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Current Operating Point"
          symbol="ρ"
          value={operatingPoint}
          unit="process units"
          onChange={setOperatingPoint}
        />
        <NumericInput
          label="Low Schedule Point"
          symbol="ρL"
          value={lowOperatingPoint}
          unit="process units"
          onChange={setLowOperatingPoint}
        />
        <NumericInput
          label="High Schedule Point"
          symbol="ρH"
          value={highOperatingPoint}
          unit="process units"
          onChange={setHighOperatingPoint}
        />
        <NumericInput
          label="Low Controller Gain"
          symbol="Kc,L"
          value={lowControllerGain}
          unit="—"
          onChange={setLowControllerGain}
        />
        <NumericInput
          label="High Controller Gain"
          symbol="Kc,H"
          value={highControllerGain}
          unit="—"
          onChange={setHighControllerGain}
        />
        <NumericInput
          label="Low Integral Time"
          symbol="Ti,L"
          value={lowIntegralTime}
          unit="time"
          onChange={setLowIntegralTime}
        />
        <NumericInput
          label="High Integral Time"
          symbol="Ti,H"
          value={highIntegralTime}
          unit="time"
          onChange={setHighIntegralTime}
        />
        <NumericInput
          label="Low Derivative Time"
          symbol="Td,L"
          value={lowDerivativeTime}
          unit="time"
          onChange={setLowDerivativeTime}
        />
        <NumericInput
          label="High Derivative Time"
          symbol="Td,H"
          value={highDerivativeTime}
          unit="time"
          onChange={setHighDerivativeTime}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Schedule controller settings"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Scheduled controller gain"
          headlineValue={formatEngineeringNumber(result.scheduledControllerGain)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Effective Operating Point"
            value={formatEngineeringNumber(result.effectiveOperatingPoint)}
            unit="process units"
          />
          <ResultItem
            label="Interpolation Fraction"
            value={formatEngineeringNumber(result.interpolationFraction)}
            unit="—"
          />
          <ResultItem
            label="Scheduled Integral Time"
            value={formatEngineeringNumber(result.scheduledIntegralTime)}
            unit="time"
          />
          <ResultItem
            label="Scheduled Derivative Time"
            value={formatEngineeringNumber(result.scheduledDerivativeTime)}
            unit="time"
          />
          <ResultItem
            label="Scheduled Integral Gain"
            value={formatEngineeringNumber(result.scheduledIntegralGain)}
            unit="1/time"
          />
          <ResultItem
            label="Scheduled Derivative Gain"
            value={formatEngineeringNumber(result.scheduledDerivativeGain)}
            unit="time"
          />
          <ResultItem
            label="Operating Point Clamped"
            value={result.wasClamped ? 'Yes' : 'No'}
            unit=""
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
