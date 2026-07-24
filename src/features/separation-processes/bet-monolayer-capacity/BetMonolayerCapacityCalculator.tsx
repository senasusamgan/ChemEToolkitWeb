import { useState } from 'react'
import {
  BetMonolayerCapacityCalculationError,
  calculateBetMonolayerCapacity,
} from './engine'
import type { BetMonolayerCapacityResult } from './types'
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
  betSlope: '0.018',
  betIntercept: '0.002',
  molecularCrossSectionArea: '0.162',
}

export function BetMonolayerCapacityCalculator() {
  const [betSlope, setBetSlope] =
    useState(example.betSlope)
  const [betIntercept, setBetIntercept] =
    useState(example.betIntercept)
  const [
    molecularCrossSectionArea,
    setMolecularCrossSectionArea,
  ] = useState(example.molecularCrossSectionArea)

  const [result, setResult] =
    useState<BetMonolayerCapacityResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateBetMonolayerCapacity({
          betSlope: Number(betSlope),
          betIntercept: Number(betIntercept),
          molecularCrossSectionArea:
            Number(molecularCrossSectionArea),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          BetMonolayerCapacityCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setBetSlope(example.betSlope)
    setBetIntercept(example.betIntercept)
    setMolecularCrossSectionArea(
      example.molecularCrossSectionArea,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setBetSlope('')
    setBetIntercept('')
    setMolecularCrossSectionArea('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–26"
        icon="◌"
        title="BET Monolayer Capacity"
        subtitle="Monolayer uptake, BET constant and specific surface area from a linear fit"
      />

      <ReferenceBasis>
        BET line slope s and intercept i
      </ReferenceBasis>

      <div className="native-formula">
        qm = 1/(s + i) · C = 1 + s/i
      </div>

      <div className="native-input-grid">
        <NumericInput label="BET Slope" symbol="s" value={betSlope} unit="kg/mol" onChange={setBetSlope} />
        <NumericInput label="BET Intercept" symbol="i" value={betIntercept} unit="kg/mol" onChange={setBetIntercept} />
        <NumericInput label="Molecular Cross-Section" symbol="am" value={molecularCrossSectionArea} unit="nm²/molecule" onChange={setMolecularCrossSectionArea} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Evaluate BET fit"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Monolayer capacity"
          headlineValue={`${formatEngineeringNumber(
            result.monolayerCapacity,
          )} mol/kg`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="BET Constant" value={formatEngineeringNumber(result.betConstant)} unit="—" />
          <ResultItem label="Specific Surface Area" value={formatEngineeringNumber(result.specificSurfaceArea)} unit="m²/kg" />
          <ResultItem label="Slope / Intercept Ratio" value={formatEngineeringNumber(result.consistencyRatio)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
