import { useState } from 'react'
import {
  GillilandStageEstimateCalculationError,
  calculateGillilandStageEstimate,
} from './engine'
import type { GillilandStageEstimateResult } from './types'
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
  minimumStages: '8',
  minimumRefluxRatio: '1.2',
  operatingRefluxRatio: '2',
  overallStageEfficiency: '0.7',
}

export function GillilandStageEstimateCalculator() {
  const [minimumStages, setMinimumStages] =
    useState(example.minimumStages)
  const [minimumRefluxRatio, setMinimumRefluxRatio] =
    useState(example.minimumRefluxRatio)
  const [
    operatingRefluxRatio,
    setOperatingRefluxRatio,
  ] = useState(example.operatingRefluxRatio)
  const [
    overallStageEfficiency,
    setOverallStageEfficiency,
  ] = useState(example.overallStageEfficiency)

  const [result, setResult] =
    useState<GillilandStageEstimateResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateGillilandStageEstimate({
          minimumStages:
            Number(minimumStages),
          minimumRefluxRatio:
            Number(minimumRefluxRatio),
          operatingRefluxRatio:
            Number(operatingRefluxRatio),
          overallStageEfficiency:
            Number(overallStageEfficiency),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          GillilandStageEstimateCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setMinimumStages(example.minimumStages)
    setMinimumRefluxRatio(
      example.minimumRefluxRatio,
    )
    setOperatingRefluxRatio(
      example.operatingRefluxRatio,
    )
    setOverallStageEfficiency(
      example.overallStageEfficiency,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setMinimumStages('')
    setMinimumRefluxRatio('')
    setOperatingRefluxRatio('')
    setOverallStageEfficiency('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–23"
        icon="⋮"
        title="Gilliland Stage Estimate"
        subtitle="Shortcut theoretical and actual stage count from reflux selection"
      />

      <ReferenceBasis>
        Eduljee equation for the Gilliland reduced-variable correlation
      </ReferenceBasis>

      <div className="native-formula">
        X = (R − Rmin)/(R + 1) · Y = (N − Nmin)/(N + 1)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Minimum Theoretical Stages" symbol="Nmin" value={minimumStages} unit="stages" onChange={setMinimumStages} />
        <NumericInput label="Minimum Reflux Ratio" symbol="Rmin" value={minimumRefluxRatio} unit="—" onChange={setMinimumRefluxRatio} />
        <NumericInput label="Operating Reflux Ratio" symbol="R" value={operatingRefluxRatio} unit="—" onChange={setOperatingRefluxRatio} />
        <NumericInput label="Overall Stage Efficiency" symbol="η" value={overallStageEfficiency} unit="fraction" onChange={setOverallStageEfficiency} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate distillation stages"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required actual stages"
          headlineValue={String(
            result.requiredIntegerActualStages,
          )}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Reduced Reflux X" value={formatEngineeringNumber(result.reducedReflux)} unit="—" />
          <ResultItem label="Gilliland Reduced Stages Y" value={formatEngineeringNumber(result.gillilandReducedStages)} unit="—" />
          <ResultItem label="Theoretical Stage Count" value={formatEngineeringNumber(result.theoreticalStageCount)} unit="stages" />
          <ResultItem label="Rounded Theoretical Stages" value={String(result.requiredIntegerTheoreticalStages)} unit="stages" />
          <ResultItem label="Unrounded Actual Stages" value={formatEngineeringNumber(result.actualStageCount)} unit="stages" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
