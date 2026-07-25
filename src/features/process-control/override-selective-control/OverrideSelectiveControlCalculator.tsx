import { useState } from 'react'
import {
  OverrideSelectiveControlCalculationError,
  calculateOverrideSelectiveControl,
} from './engine'
import type { OverrideSelectiveControlResult } from './types'
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
  selectorMode: '1',
  normalControllerDemand: '55',
  firstConstraintDemand: '72',
  secondConstraintDemand: '48',
  minimumOutput: '0',
  maximumOutput: '100',
}

export function OverrideSelectiveControlCalculator() {
  const [selectorMode, setSelectorMode] = useState(example.selectorMode)
  const [normalControllerDemand, setNormalControllerDemand] = useState(example.normalControllerDemand)
  const [firstConstraintDemand, setFirstConstraintDemand] = useState(example.firstConstraintDemand)
  const [secondConstraintDemand, setSecondConstraintDemand] = useState(example.secondConstraintDemand)
  const [minimumOutput, setMinimumOutput] = useState(example.minimumOutput)
  const [maximumOutput, setMaximumOutput] = useState(example.maximumOutput)

  const [result, setResult] =
    useState<OverrideSelectiveControlResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateOverrideSelectiveControl({
            selectorMode: Number(selectorMode),
            normalControllerDemand: Number(normalControllerDemand),
            firstConstraintDemand: Number(firstConstraintDemand),
            secondConstraintDemand: Number(secondConstraintDemand),
            minimumOutput: Number(minimumOutput),
            maximumOutput: Number(maximumOutput),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof OverrideSelectiveControlCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setSelectorMode(example.selectorMode)
    setNormalControllerDemand(example.normalControllerDemand)
    setFirstConstraintDemand(example.firstConstraintDemand)
    setSecondConstraintDemand(example.secondConstraintDemand)
    setMinimumOutput(example.minimumOutput)
    setMaximumOutput(example.maximumOutput)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setSelectorMode('')
    setNormalControllerDemand('')
    setFirstConstraintDemand('')
    setSecondConstraintDemand('')
    setMinimumOutput('')
    setMaximumOutput('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–20"
        icon="SEL"
        title="Override / Selective Control"
        subtitle="Select the most protective controller demand and apply output limits"
      />

      <ReferenceBasis>
        Mode +1 selects the highest demand; mode −1 selects the lowest
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Selector Mode"
          symbol="m"
          value={selectorMode}
          unit="+1 high / −1 low"
          onChange={setSelectorMode}
        />
        <NumericInput
          label="Normal Controller Demand"
          symbol="uN"
          value={normalControllerDemand}
          unit="%"
          onChange={setNormalControllerDemand}
        />
        <NumericInput
          label="Constraint Demand 1"
          symbol="uC1"
          value={firstConstraintDemand}
          unit="%"
          onChange={setFirstConstraintDemand}
        />
        <NumericInput
          label="Constraint Demand 2"
          symbol="uC2"
          value={secondConstraintDemand}
          unit="%"
          onChange={setSecondConstraintDemand}
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
        calculateLabel="Evaluate selector"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Constrained output"
          headlineValue={formatEngineeringNumber(result.constrainedOutput)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Selected Demand"
            value={formatEngineeringNumber(result.selectedDemand)}
            unit="%"
          />
          <ResultItem
            label="Selected Source"
            value={result.selectedSource}
            unit=""
          />
          <ResultItem
            label="Selector Type"
            value={result.selectorDescription}
            unit=""
          />
          <ResultItem
            label="Override Active"
            value={result.overrideActive ? 'Yes' : 'No'}
            unit=""
          />
          <ResultItem
            label="Output Clamped"
            value={result.outputWasClamped ? 'Yes' : 'No'}
            unit=""
          />
          <ResultItem
            label="Deviation from Normal Demand"
            value={formatEngineeringNumber(result.normalDemandDeviation)}
            unit="%"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
