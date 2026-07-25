import { useState } from 'react'
import {
  IntegratingProcessResponseCalculationError,
  calculateIntegratingProcessResponse,
} from './engine'
import type { IntegratingProcessResponseResult } from './types'
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
  integratingGain: '0.4',
  initialOutput: '10',
  inputStepChange: '2',
  deadTime: '3',
  evaluationTime: '13',
}

export function IntegratingProcessResponseCalculator() {
  const [integratingGain, setIntegratingGain] = useState(example.integratingGain)
  const [initialOutput, setInitialOutput] = useState(example.initialOutput)
  const [inputStepChange, setInputStepChange] = useState(example.inputStepChange)
  const [deadTime, setDeadTime] = useState(example.deadTime)
  const [evaluationTime, setEvaluationTime] = useState(example.evaluationTime)

  const [result, setResult] =
    useState<IntegratingProcessResponseResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateIntegratingProcessResponse({
            integratingGain: Number(integratingGain),
            initialOutput: Number(initialOutput),
            inputStepChange: Number(inputStepChange),
            deadTime: Number(deadTime),
            evaluationTime: Number(evaluationTime),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof IntegratingProcessResponseCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setIntegratingGain(example.integratingGain)
    setInitialOutput(example.initialOutput)
    setInputStepChange(example.inputStepChange)
    setDeadTime(example.deadTime)
    setEvaluationTime(example.evaluationTime)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setIntegratingGain('')
    setInitialOutput('')
    setInputStepChange('')
    setDeadTime('')
    setEvaluationTime('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–10"
        icon="∫"
        title="Integrating Process"
        subtitle="Ramp response of an integrating process with dead time"
      />

      <ReferenceBasis>
        y(t) = y₀ + KiΔu(t − θ) for t after θ
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Integrating Gain"
          symbol="Ki"
          value={integratingGain}
          unit="output/(input·time)"
          onChange={setIntegratingGain}
        />
        <NumericInput
          label="Initial Output"
          symbol="y₀"
          value={initialOutput}
          unit="output"
          onChange={setInitialOutput}
        />
        <NumericInput
          label="Input Step Change"
          symbol="Δu"
          value={inputStepChange}
          unit="input"
          onChange={setInputStepChange}
        />
        <NumericInput
          label="Dead Time"
          symbol="θ"
          value={deadTime}
          unit="time"
          onChange={setDeadTime}
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
        calculateLabel="Calculate integrating response"
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
            label="Active Integration Time"
            value={formatEngineeringNumber(result.activeIntegrationTime)}
            unit="time"
          />
          <ResultItem
            label="Output Change"
            value={formatEngineeringNumber(result.outputChange)}
            unit="output"
          />
          <ResultItem
            label="Ramp Slope"
            value={formatEngineeringNumber(result.rampSlope)}
            unit="output/time"
          />
          <ResultItem
            label="Dead Time Completed"
            value={result.deadTimeCompleted ? 'Yes' : 'No'}
            unit=""
          />
          <ResultItem
            label="Reference Target Change"
            value={formatEngineeringNumber(result.targetOutputChange)}
            unit="output"
          />
          <ResultItem
            label="Time to Reference Target"
            value={formatEngineeringNumber(result.timeToReachTargetChange)}
            unit="time"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
