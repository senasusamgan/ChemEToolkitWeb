import { useState } from 'react'
import {
  ProportionalControllerCalculationError,
  calculateProportionalController,
} from './engine'
import type { ProportionalControllerResult } from './types'
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
  controllerBias: '50',
  controllerGain: '2.5',
  setpoint: '80',
  measuredValue: '72',
  minimumOutput: '0',
  maximumOutput: '100',
}

export function ProportionalControllerCalculator() {
  const [controllerBias, setControllerBias] = useState(example.controllerBias)
  const [controllerGain, setControllerGain] = useState(example.controllerGain)
  const [setpoint, setSetpoint] = useState(example.setpoint)
  const [measuredValue, setMeasuredValue] = useState(example.measuredValue)
  const [minimumOutput, setMinimumOutput] = useState(example.minimumOutput)
  const [maximumOutput, setMaximumOutput] = useState(example.maximumOutput)

  const [result, setResult] =
    useState<ProportionalControllerResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateProportionalController({
            controllerBias: Number(controllerBias),
            controllerGain: Number(controllerGain),
            setpoint: Number(setpoint),
            measuredValue: Number(measuredValue),
            minimumOutput: Number(minimumOutput),
            maximumOutput: Number(maximumOutput),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ProportionalControllerCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setControllerBias(example.controllerBias)
    setControllerGain(example.controllerGain)
    setSetpoint(example.setpoint)
    setMeasuredValue(example.measuredValue)
    setMinimumOutput(example.minimumOutput)
    setMaximumOutput(example.maximumOutput)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setControllerBias('')
    setControllerGain('')
    setSetpoint('')
    setMeasuredValue('')
    setMinimumOutput('')
    setMaximumOutput('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–24"
        icon="P"
        title="Proportional Controller"
        subtitle="Bias-plus-gain controller output with saturation limits"
      />

      <ReferenceBasis>
        u = ub + Kc(r − y)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Controller Bias"
          symbol="ub"
          value={controllerBias}
          unit="%"
          onChange={setControllerBias}
        />
        <NumericInput
          label="Controller Gain"
          symbol="Kc"
          value={controllerGain}
          unit="%/error"
          onChange={setControllerGain}
        />
        <NumericInput
          label="Setpoint"
          symbol="r"
          value={setpoint}
          unit="process units"
          onChange={setSetpoint}
        />
        <NumericInput
          label="Measured Value"
          symbol="y"
          value={measuredValue}
          unit="process units"
          onChange={setMeasuredValue}
        />
        <NumericInput
          label="Minimum Output"
          symbol="umin"
          value={minimumOutput}
          unit="%"
          onChange={setMinimumOutput}
        />
        <NumericInput
          label="Maximum Output"
          symbol="umax"
          value={maximumOutput}
          unit="%"
          onChange={setMaximumOutput}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate proportional output"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Controller output"
          headlineValue={formatEngineeringNumber(result.controllerOutput)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Control Error"
            value={formatEngineeringNumber(result.controlError)}
            unit="process units"
          />
          <ResultItem
            label="Proportional Correction"
            value={formatEngineeringNumber(result.proportionalCorrection)}
            unit="%"
          />
          <ResultItem
            label="Raw Output"
            value={formatEngineeringNumber(result.rawOutput)}
            unit="%"
          />
          <ResultItem
            label="Output Position"
            value={formatEngineeringNumber(result.outputPositionPercent)}
            unit="% of span"
          />
          <ResultItem
            label="Output Limited"
            value={result.outputWasLimited ? 'Yes' : 'No'}
            unit=""
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
