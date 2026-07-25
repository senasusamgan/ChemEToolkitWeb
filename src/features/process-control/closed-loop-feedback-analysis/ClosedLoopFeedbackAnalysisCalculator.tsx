import { useState } from 'react'
import {
  ClosedLoopFeedbackAnalysisCalculationError,
  calculateClosedLoopFeedbackAnalysis,
} from './engine'
import type { ClosedLoopFeedbackAnalysisResult } from './types'
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
  controllerGain: '2',
  processGain: '3',
  measurementGain: '1',
  processTimeConstant: '10',
  setpointStep: '5',
  loadDisturbance: '1',
  evaluationTime: '10',
}

export function ClosedLoopFeedbackAnalysisCalculator() {
  const [controllerGain, setControllerGain] = useState(example.controllerGain)
  const [processGain, setProcessGain] = useState(example.processGain)
  const [measurementGain, setMeasurementGain] = useState(example.measurementGain)
  const [processTimeConstant, setProcessTimeConstant] = useState(example.processTimeConstant)
  const [setpointStep, setSetpointStep] = useState(example.setpointStep)
  const [loadDisturbance, setLoadDisturbance] = useState(example.loadDisturbance)
  const [evaluationTime, setEvaluationTime] = useState(example.evaluationTime)

  const [result, setResult] =
    useState<ClosedLoopFeedbackAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateClosedLoopFeedbackAnalysis({
            controllerGain: Number(controllerGain),
            processGain: Number(processGain),
            measurementGain: Number(measurementGain),
            processTimeConstant: Number(processTimeConstant),
            setpointStep: Number(setpointStep),
            loadDisturbance: Number(loadDisturbance),
            evaluationTime: Number(evaluationTime),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ClosedLoopFeedbackAnalysisCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setControllerGain(example.controllerGain)
    setProcessGain(example.processGain)
    setMeasurementGain(example.measurementGain)
    setProcessTimeConstant(example.processTimeConstant)
    setSetpointStep(example.setpointStep)
    setLoadDisturbance(example.loadDisturbance)
    setEvaluationTime(example.evaluationTime)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setControllerGain('')
    setProcessGain('')
    setMeasurementGain('')
    setProcessTimeConstant('')
    setSetpointStep('')
    setLoadDisturbance('')
    setEvaluationTime('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–03"
        icon="↻"
        title="Closed-Loop Feedback Analysis"
        subtitle="First-order proportional-feedback response and disturbance rejection"
      />

      <ReferenceBasis>
        Y/R = KcKp / (1 + KcKpH)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Controller Gain"
          symbol="Kc"
          value={controllerGain}
          unit="—"
          onChange={setControllerGain}
        />
        <NumericInput
          label="Process Gain"
          symbol="Kp"
          value={processGain}
          unit="—"
          onChange={setProcessGain}
        />
        <NumericInput
          label="Measurement Gain"
          symbol="H"
          value={measurementGain}
          unit="—"
          onChange={setMeasurementGain}
        />
        <NumericInput
          label="Process Time Constant"
          symbol="τp"
          value={processTimeConstant}
          unit="time"
          onChange={setProcessTimeConstant}
        />
        <NumericInput
          label="Setpoint Step"
          symbol="ΔR"
          value={setpointStep}
          unit="signal"
          onChange={setSetpointStep}
        />
        <NumericInput
          label="Load Disturbance"
          symbol="D"
          value={loadDisturbance}
          unit="signal"
          onChange={setLoadDisturbance}
        />
        <NumericInput
          label="Evaluation Time"
          symbol="t"
          value={evaluationTime}
          unit="time"
          onChange={setEvaluationTime}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Analyze feedback loop"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Output at evaluation time"
          headlineValue={formatEngineeringNumber(result.outputAtEvaluationTime)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Loop Gain"
            value={formatEngineeringNumber(result.loopGain)}
            unit="—"
          />
          <ResultItem
            label="Closed-Loop Setpoint Gain"
            value={formatEngineeringNumber(result.closedLoopSetpointGain)}
            unit="—"
          />
          <ResultItem
            label="Closed-Loop Disturbance Gain"
            value={formatEngineeringNumber(result.closedLoopDisturbanceGain)}
            unit="—"
          />
          <ResultItem
            label="Closed-Loop Time Constant"
            value={formatEngineeringNumber(result.closedLoopTimeConstant)}
            unit="time"
          />
          <ResultItem
            label="Steady-State Output"
            value={formatEngineeringNumber(result.steadyStateOutput)}
            unit="signal"
          />
          <ResultItem
            label="Response Fraction"
            value={formatEngineeringNumber(result.responseFraction)}
            unit="—"
          />
          <ResultItem
            label="Steady-State Error"
            value={formatEngineeringNumber(result.steadyStateError)}
            unit="signal"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
