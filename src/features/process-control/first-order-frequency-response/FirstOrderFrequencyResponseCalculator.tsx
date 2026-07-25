import { useState } from 'react'
import {
  FirstOrderFrequencyResponseCalculationError,
  calculateFirstOrderFrequencyResponse,
} from './engine'
import type { FirstOrderFrequencyResponseResult } from './types'
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
  timeConstant: '5',
  angularFrequency: '0.2',
}

export function FirstOrderFrequencyResponseCalculator() {
  const [processGain, setProcessGain] = useState(example.processGain)
  const [timeConstant, setTimeConstant] = useState(example.timeConstant)
  const [angularFrequency, setAngularFrequency] = useState(example.angularFrequency)

  const [result, setResult] =
    useState<FirstOrderFrequencyResponseResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateFirstOrderFrequencyResponse({
            processGain: Number(processGain),
            timeConstant: Number(timeConstant),
            angularFrequency: Number(angularFrequency),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof FirstOrderFrequencyResponseCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setProcessGain(example.processGain)
    setTimeConstant(example.timeConstant)
    setAngularFrequency(example.angularFrequency)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setProcessGain('')
    setTimeConstant('')
    setAngularFrequency('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–08"
        icon="ω"
        title="First-Order Frequency Response"
        subtitle="Magnitude, phase and complex response of a first-order process"
      />

      <ReferenceBasis>
        G(jω) = K / (1 + jωτ)
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
          unit="s"
          onChange={setTimeConstant}
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
        calculateLabel="Calculate frequency response"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Magnitude ratio"
          headlineValue={formatEngineeringNumber(result.magnitudeRatio)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Magnitude"
            value={formatEngineeringNumber(result.magnitudeDecibels)}
            unit="dB"
          />
          <ResultItem
            label="Phase"
            value={formatEngineeringNumber(result.phaseDegrees)}
            unit="deg"
          />
          <ResultItem
            label="Real Part"
            value={formatEngineeringNumber(result.realPart)}
            unit="—"
          />
          <ResultItem
            label="Imaginary Part"
            value={formatEngineeringNumber(result.imaginaryPart)}
            unit="—"
          />
          <ResultItem
            label="Corner Angular Frequency"
            value={formatEngineeringNumber(result.cornerAngularFrequency)}
            unit="rad/s"
          />
          <ResultItem
            label="Corner Frequency"
            value={formatEngineeringNumber(result.cornerFrequencyHertz)}
            unit="Hz"
          />
          <ResultItem
            label="Normalized Frequency"
            value={formatEngineeringNumber(result.normalizedFrequency)}
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
