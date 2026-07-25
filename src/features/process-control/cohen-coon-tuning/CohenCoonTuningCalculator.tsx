import { useState } from 'react'
import {
  CohenCoonTuningCalculationError,
  calculateCohenCoonTuning,
} from './engine'
import type { CohenCoonTuningResult } from './types'
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
  processGain: '2',
  processTimeConstant: '10',
  processDeadTime: '2',
}

export function CohenCoonTuningCalculator() {
  const [processGain, setProcessGain] = useState(example.processGain)
  const [processTimeConstant, setProcessTimeConstant] = useState(example.processTimeConstant)
  const [processDeadTime, setProcessDeadTime] = useState(example.processDeadTime)

  const [result, setResult] =
    useState<CohenCoonTuningResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCohenCoonTuning({
            processGain: Number(processGain),
            processTimeConstant: Number(processTimeConstant),
            processDeadTime: Number(processDeadTime),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CohenCoonTuningCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setProcessGain(example.processGain)
    setProcessTimeConstant(example.processTimeConstant)
    setProcessDeadTime(example.processDeadTime)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setProcessGain('')
    setProcessTimeConstant('')
    setProcessDeadTime('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–04"
        icon="PID"
        title="Cohen–Coon Tuning"
        subtitle="PID settings from a first-order-plus-dead-time process model"
      />

      <ReferenceBasis>
        Kc = (τ / Kθ)(4/3 + θ/4τ)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Process Gain"
          symbol="K"
          value={processGain}
          unit="output/input"
          onChange={setProcessGain}
        />
        <NumericInput
          label="Process Time Constant"
          symbol="τ"
          value={processTimeConstant}
          unit="time"
          onChange={setProcessTimeConstant}
        />
        <NumericInput
          label="Process Dead Time"
          symbol="θ"
          value={processDeadTime}
          unit="time"
          onChange={setProcessDeadTime}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate PID settings"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Controller gain"
          headlineValue={formatEngineeringNumber(result.controllerGain)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Dead-Time Ratio"
            value={formatEngineeringNumber(result.deadTimeRatio)}
            unit="—"
          />
          <ResultItem
            label="Integral Time"
            value={formatEngineeringNumber(result.integralTime)}
            unit="time"
          />
          <ResultItem
            label="Derivative Time"
            value={formatEngineeringNumber(result.derivativeTime)}
            unit="time"
          />
          <ResultItem
            label="Integral Gain"
            value={formatEngineeringNumber(result.integralGain)}
            unit="1/time"
          />
          <ResultItem
            label="Derivative Gain"
            value={formatEngineeringNumber(result.derivativeGain)}
            unit="time"
          />
          <ResultItem
            label="Recommended Sample Time"
            value={formatEngineeringNumber(result.recommendedSampleTime)}
            unit="time"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
