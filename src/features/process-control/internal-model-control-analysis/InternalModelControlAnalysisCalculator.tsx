import { useState } from 'react'
import {
  InternalModelControlAnalysisCalculationError,
  calculateInternalModelControlAnalysis,
} from './engine'
import type { InternalModelControlAnalysisResult } from './types'
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
  actualProcessGain: '2.2',
  actualTimeConstant: '6',
  actualDeadTime: '1.2',
  modelProcessGain: '2',
  modelTimeConstant: '5',
  modelDeadTime: '1',
  filterTimeConstant: '3',
  angularFrequency: '0.2',
}

export function InternalModelControlAnalysisCalculator() {
  const [actualProcessGain, setActualProcessGain] = useState(example.actualProcessGain)
  const [actualTimeConstant, setActualTimeConstant] = useState(example.actualTimeConstant)
  const [actualDeadTime, setActualDeadTime] = useState(example.actualDeadTime)
  const [modelProcessGain, setModelProcessGain] = useState(example.modelProcessGain)
  const [modelTimeConstant, setModelTimeConstant] = useState(example.modelTimeConstant)
  const [modelDeadTime, setModelDeadTime] = useState(example.modelDeadTime)
  const [filterTimeConstant, setFilterTimeConstant] = useState(example.filterTimeConstant)
  const [angularFrequency, setAngularFrequency] = useState(example.angularFrequency)

  const [result, setResult] =
    useState<InternalModelControlAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateInternalModelControlAnalysis({
            actualProcessGain: Number(actualProcessGain),
            actualTimeConstant: Number(actualTimeConstant),
            actualDeadTime: Number(actualDeadTime),
            modelProcessGain: Number(modelProcessGain),
            modelTimeConstant: Number(modelTimeConstant),
            modelDeadTime: Number(modelDeadTime),
            filterTimeConstant: Number(filterTimeConstant),
            angularFrequency: Number(angularFrequency),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof InternalModelControlAnalysisCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setActualProcessGain(example.actualProcessGain)
    setActualTimeConstant(example.actualTimeConstant)
    setActualDeadTime(example.actualDeadTime)
    setModelProcessGain(example.modelProcessGain)
    setModelTimeConstant(example.modelTimeConstant)
    setModelDeadTime(example.modelDeadTime)
    setFilterTimeConstant(example.filterTimeConstant)
    setAngularFrequency(example.angularFrequency)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setActualProcessGain('')
    setActualTimeConstant('')
    setActualDeadTime('')
    setModelProcessGain('')
    setModelTimeConstant('')
    setModelDeadTime('')
    setFilterTimeConstant('')
    setAngularFrequency('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–12"
        icon="IMC"
        title="Internal Model Control"
        subtitle="Frequency-domain robustness analysis with process-model mismatch"
      />

      <ReferenceBasis>
        T = GpQ / [1 + Q(Gp − Gm)]
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Actual Process Gain"
          symbol="Kp"
          value={actualProcessGain}
          unit="output/input"
          onChange={setActualProcessGain}
        />
        <NumericInput
          label="Actual Time Constant"
          symbol="τp"
          value={actualTimeConstant}
          unit="s"
          onChange={setActualTimeConstant}
        />
        <NumericInput
          label="Actual Dead Time"
          symbol="θp"
          value={actualDeadTime}
          unit="s"
          onChange={setActualDeadTime}
        />
        <NumericInput
          label="Model Process Gain"
          symbol="Km"
          value={modelProcessGain}
          unit="output/input"
          onChange={setModelProcessGain}
        />
        <NumericInput
          label="Model Time Constant"
          symbol="τm"
          value={modelTimeConstant}
          unit="s"
          onChange={setModelTimeConstant}
        />
        <NumericInput
          label="Model Dead Time"
          symbol="θm"
          value={modelDeadTime}
          unit="s"
          onChange={setModelDeadTime}
        />
        <NumericInput
          label="IMC Filter Time Constant"
          symbol="λ"
          value={filterTimeConstant}
          unit="s"
          onChange={setFilterTimeConstant}
        />
        <NumericInput
          label="Angular Frequency"
          symbol="ω"
          value={angularFrequency}
          unit="rad/s"
          onChange={setAngularFrequency}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Analyze IMC loop"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Closed-loop magnitude"
          headlineValue={formatEngineeringNumber(result.closedLoopMagnitude)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Closed-Loop Phase"
            value={formatEngineeringNumber(result.closedLoopPhaseDegrees)}
            unit="deg"
          />
          <ResultItem
            label="Controller Magnitude"
            value={formatEngineeringNumber(result.controllerMagnitude)}
            unit="—"
          />
          <ResultItem
            label="Controller Phase"
            value={formatEngineeringNumber(result.controllerPhaseDegrees)}
            unit="deg"
          />
          <ResultItem
            label="Model Mismatch Magnitude"
            value={formatEngineeringNumber(result.modelMismatchMagnitude)}
            unit="—"
          />
          <ResultItem
            label="Robustness Denominator Magnitude"
            value={formatEngineeringNumber(result.robustnessDenominatorMagnitude)}
            unit="—"
          />
          <ResultItem
            label="Nominal Closed-Loop Magnitude"
            value={formatEngineeringNumber(result.nominalClosedLoopMagnitude)}
            unit="—"
          />
          <ResultItem
            label="Low-Frequency Controller Gain"
            value={formatEngineeringNumber(result.lowFrequencyControllerGain)}
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
