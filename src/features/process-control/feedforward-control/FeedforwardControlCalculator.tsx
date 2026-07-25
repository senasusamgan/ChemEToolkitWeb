import { useState } from 'react'
import {
  FeedforwardControlCalculationError,
  calculateFeedforwardControl,
} from './engine'
import type { FeedforwardControlResult } from './types'
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
  actualDisturbanceGain: '4',
  actualProcessGain: '2',
  modelDisturbanceGain: '3.8',
  modelProcessGain: '2.1',
  disturbanceChange: '5',
  feedbackLoopGain: '4',
}

export function FeedforwardControlCalculator() {
  const [actualDisturbanceGain, setActualDisturbanceGain] = useState(example.actualDisturbanceGain)
  const [actualProcessGain, setActualProcessGain] = useState(example.actualProcessGain)
  const [modelDisturbanceGain, setModelDisturbanceGain] = useState(example.modelDisturbanceGain)
  const [modelProcessGain, setModelProcessGain] = useState(example.modelProcessGain)
  const [disturbanceChange, setDisturbanceChange] = useState(example.disturbanceChange)
  const [feedbackLoopGain, setFeedbackLoopGain] = useState(example.feedbackLoopGain)

  const [result, setResult] =
    useState<FeedforwardControlResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateFeedforwardControl({
            actualDisturbanceGain: Number(actualDisturbanceGain),
            actualProcessGain: Number(actualProcessGain),
            modelDisturbanceGain: Number(modelDisturbanceGain),
            modelProcessGain: Number(modelProcessGain),
            disturbanceChange: Number(disturbanceChange),
            feedbackLoopGain: Number(feedbackLoopGain),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof FeedforwardControlCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setActualDisturbanceGain(example.actualDisturbanceGain)
    setActualProcessGain(example.actualProcessGain)
    setModelDisturbanceGain(example.modelDisturbanceGain)
    setModelProcessGain(example.modelProcessGain)
    setDisturbanceChange(example.disturbanceChange)
    setFeedbackLoopGain(example.feedbackLoopGain)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setActualDisturbanceGain('')
    setActualProcessGain('')
    setModelDisturbanceGain('')
    setModelProcessGain('')
    setDisturbanceChange('')
    setFeedbackLoopGain('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–07"
        icon="→"
        title="Feedforward Control"
        subtitle="Estimate disturbance compensation with model mismatch and feedback"
      />

      <ReferenceBasis>
        Kff = −Kd / Kp
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Actual Disturbance Gain"
          symbol="Kd"
          value={actualDisturbanceGain}
          unit="output/disturbance"
          onChange={setActualDisturbanceGain}
        />
        <NumericInput
          label="Actual Process Gain"
          symbol="Kp"
          value={actualProcessGain}
          unit="output/input"
          onChange={setActualProcessGain}
        />
        <NumericInput
          label="Model Disturbance Gain"
          symbol="K̂d"
          value={modelDisturbanceGain}
          unit="output/disturbance"
          onChange={setModelDisturbanceGain}
        />
        <NumericInput
          label="Model Process Gain"
          symbol="K̂p"
          value={modelProcessGain}
          unit="output/input"
          onChange={setModelProcessGain}
        />
        <NumericInput
          label="Disturbance Change"
          symbol="ΔD"
          value={disturbanceChange}
          unit="disturbance"
          onChange={setDisturbanceChange}
        />
        <NumericInput
          label="Feedback Loop Gain"
          symbol="L"
          value={feedbackLoopGain}
          unit="—"
          onChange={setFeedbackLoopGain}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Analyze feedforward compensation"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Final residual"
          headlineValue={formatEngineeringNumber(result.finalResidualWithFeedback)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Ideal Feedforward Gain"
            value={formatEngineeringNumber(result.idealFeedforwardGain)}
            unit="input/disturbance"
          />
          <ResultItem
            label="Implemented Feedforward Gain"
            value={formatEngineeringNumber(result.implementedFeedforwardGain)}
            unit="input/disturbance"
          />
          <ResultItem
            label="Uncompensated Deviation"
            value={formatEngineeringNumber(result.uncompensatedDeviation)}
            unit="output"
          />
          <ResultItem
            label="Feedforward Residual"
            value={formatEngineeringNumber(result.feedforwardResidual)}
            unit="output"
          />
          <ResultItem
            label="Compensation"
            value={formatEngineeringNumber(result.compensationPercent)}
            unit="%"
          />
          <ResultItem
            label="Model Gain Mismatch"
            value={formatEngineeringNumber(result.modelGainMismatchPercent)}
            unit="%"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
