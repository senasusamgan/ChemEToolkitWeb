import { useState } from 'react'
import {
  ProcessControlStrategyComparisonCalculationError,
  calculateProcessControlStrategyComparison,
} from './engine'
import type { ProcessControlStrategyComparisonResult } from './types'
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
  feedbackControllerGain: '3',
  measurementGain: '1',
  disturbanceGain: '4',
  disturbanceMagnitude: '2',
  feedforwardModelGain: '2',
  secondaryControllerGain: '3',
  secondaryProcessGain: '2',
}

export function ProcessControlStrategyComparisonCalculator() {
  const [processGain, setProcessGain] = useState(example.processGain)
  const [feedbackControllerGain, setFeedbackControllerGain] = useState(example.feedbackControllerGain)
  const [measurementGain, setMeasurementGain] = useState(example.measurementGain)
  const [disturbanceGain, setDisturbanceGain] = useState(example.disturbanceGain)
  const [disturbanceMagnitude, setDisturbanceMagnitude] = useState(example.disturbanceMagnitude)
  const [feedforwardModelGain, setFeedforwardModelGain] = useState(example.feedforwardModelGain)
  const [secondaryControllerGain, setSecondaryControllerGain] = useState(example.secondaryControllerGain)
  const [secondaryProcessGain, setSecondaryProcessGain] = useState(example.secondaryProcessGain)

  const [result, setResult] =
    useState<ProcessControlStrategyComparisonResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateProcessControlStrategyComparison({
            processGain: Number(processGain),
            feedbackControllerGain: Number(feedbackControllerGain),
            measurementGain: Number(measurementGain),
            disturbanceGain: Number(disturbanceGain),
            disturbanceMagnitude: Number(disturbanceMagnitude),
            feedforwardModelGain: Number(feedforwardModelGain),
            secondaryControllerGain: Number(secondaryControllerGain),
            secondaryProcessGain: Number(secondaryProcessGain),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ProcessControlStrategyComparisonCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setProcessGain(example.processGain)
    setFeedbackControllerGain(example.feedbackControllerGain)
    setMeasurementGain(example.measurementGain)
    setDisturbanceGain(example.disturbanceGain)
    setDisturbanceMagnitude(example.disturbanceMagnitude)
    setFeedforwardModelGain(example.feedforwardModelGain)
    setSecondaryControllerGain(example.secondaryControllerGain)
    setSecondaryProcessGain(example.secondaryProcessGain)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setProcessGain('')
    setFeedbackControllerGain('')
    setMeasurementGain('')
    setDisturbanceGain('')
    setDisturbanceMagnitude('')
    setFeedforwardModelGain('')
    setSecondaryControllerGain('')
    setSecondaryProcessGain('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–05"
        icon="≍"
        title="Control Strategy Comparison"
        subtitle="Compare feedback, feedforward-plus-feedback and cascade disturbance rejection"
      />

      <ReferenceBasis>
        Residual deviation is compared on a common steady-state gain basis
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Process Gain"
          symbol="Kp"
          value={processGain}
          unit="—"
          onChange={setProcessGain}
        />
        <NumericInput
          label="Feedback Controller Gain"
          symbol="Kc"
          value={feedbackControllerGain}
          unit="—"
          onChange={setFeedbackControllerGain}
        />
        <NumericInput
          label="Measurement Gain"
          symbol="H"
          value={measurementGain}
          unit="—"
          onChange={setMeasurementGain}
        />
        <NumericInput
          label="Disturbance Gain"
          symbol="Kd"
          value={disturbanceGain}
          unit="—"
          onChange={setDisturbanceGain}
        />
        <NumericInput
          label="Disturbance Magnitude"
          symbol="D"
          value={disturbanceMagnitude}
          unit="signal"
          onChange={setDisturbanceMagnitude}
        />
        <NumericInput
          label="Feedforward Model Gain"
          symbol="Kff"
          value={feedforwardModelGain}
          unit="—"
          onChange={setFeedforwardModelGain}
        />
        <NumericInput
          label="Secondary Controller Gain"
          symbol="Kc₂"
          value={secondaryControllerGain}
          unit="—"
          onChange={setSecondaryControllerGain}
        />
        <NumericInput
          label="Secondary Process Gain"
          symbol="Kp₂"
          value={secondaryProcessGain}
          unit="—"
          onChange={setSecondaryProcessGain}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Compare strategies"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Best screening strategy"
          headlineValue={result.bestStrategy}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Uncontrolled Deviation"
            value={formatEngineeringNumber(result.uncontrolledDeviation)}
            unit="signal"
          />
          <ResultItem
            label="Feedback Residual"
            value={formatEngineeringNumber(result.feedbackResidual)}
            unit="signal"
          />
          <ResultItem
            label="Feedforward + Feedback Residual"
            value={formatEngineeringNumber(result.feedforwardFeedbackResidual)}
            unit="signal"
          />
          <ResultItem
            label="Cascade Residual"
            value={formatEngineeringNumber(result.cascadeResidual)}
            unit="signal"
          />
          <ResultItem
            label="Feedback Reduction"
            value={formatEngineeringNumber(result.feedbackReductionPercent)}
            unit="%"
          />
          <ResultItem
            label="Feedforward Reduction"
            value={formatEngineeringNumber(result.feedforwardReductionPercent)}
            unit="%"
          />
          <ResultItem
            label="Cascade Reduction"
            value={formatEngineeringNumber(result.cascadeReductionPercent)}
            unit="%"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
