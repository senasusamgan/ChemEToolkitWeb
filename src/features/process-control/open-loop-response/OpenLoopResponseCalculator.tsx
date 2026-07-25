import { useState } from 'react'
import {
  OpenLoopResponseCalculationError,
  calculateOpenLoopResponse,
} from './engine'
import type { OpenLoopResponseResult } from './types'
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
  timeConstant: '8',
  deadTime: '2',
  inputStepChange: '3',
  initialOutput: '10',
  evaluationTime: '12',
}

export function OpenLoopResponseCalculator() {
  const [processGain, setProcessGain] = useState(example.processGain)
  const [timeConstant, setTimeConstant] = useState(example.timeConstant)
  const [deadTime, setDeadTime] = useState(example.deadTime)
  const [inputStepChange, setInputStepChange] = useState(example.inputStepChange)
  const [initialOutput, setInitialOutput] = useState(example.initialOutput)
  const [evaluationTime, setEvaluationTime] = useState(example.evaluationTime)

  const [result, setResult] =
    useState<OpenLoopResponseResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateOpenLoopResponse({
            processGain: Number(processGain),
            timeConstant: Number(timeConstant),
            deadTime: Number(deadTime),
            inputStepChange: Number(inputStepChange),
            initialOutput: Number(initialOutput),
            evaluationTime: Number(evaluationTime),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof OpenLoopResponseCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setProcessGain(example.processGain)
    setTimeConstant(example.timeConstant)
    setDeadTime(example.deadTime)
    setInputStepChange(example.inputStepChange)
    setInitialOutput(example.initialOutput)
    setEvaluationTime(example.evaluationTime)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setProcessGain('')
    setTimeConstant('')
    setDeadTime('')
    setInputStepChange('')
    setInitialOutput('')
    setEvaluationTime('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–19"
        icon="↗"
        title="Open-Loop Response"
        subtitle="First-order-plus-dead-time response without feedback"
      />

      <ReferenceBasis>
        Δy = KΔu[1 − exp(−(t−θ)/τ)]
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
          label="Time Constant"
          symbol="τ"
          value={timeConstant}
          unit="time"
          onChange={setTimeConstant}
        />
        <NumericInput
          label="Dead Time"
          symbol="θ"
          value={deadTime}
          unit="time"
          onChange={setDeadTime}
        />
        <NumericInput
          label="Input Step Change"
          symbol="Δu"
          value={inputStepChange}
          unit="input"
          onChange={setInputStepChange}
        />
        <NumericInput
          label="Initial Output"
          symbol="y₀"
          value={initialOutput}
          unit="output"
          onChange={setInitialOutput}
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
        calculateLabel="Calculate open-loop response"
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
            label="Active Response Time"
            value={formatEngineeringNumber(result.activeResponseTime)}
            unit="time"
          />
          <ResultItem
            label="Response Fraction"
            value={formatEngineeringNumber(result.responseFraction)}
            unit="—"
          />
          <ResultItem
            label="Output Change"
            value={formatEngineeringNumber(result.outputChange)}
            unit="output"
          />
          <ResultItem
            label="Steady-State Output"
            value={formatEngineeringNumber(result.steadyStateOutput)}
            unit="output"
          />
          <ResultItem
            label="Initial Slope After Dead Time"
            value={formatEngineeringNumber(result.initialSlopeAfterDeadTime)}
            unit="output/time"
          />
          <ResultItem
            label="Time to 90% Response"
            value={formatEngineeringNumber(result.timeToNinetyPercent)}
            unit="time"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
