import { useState } from 'react'
import {
  CountercurrentExtractionStagesCalculationError,
  calculateCountercurrentExtractionStages,
} from './engine'
import type { CountercurrentExtractionStagesResult } from './types'
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
  distributionCoefficient: '3',
  solventToRaffinateRatio: '0.5',
  targetSoluteRecoveryFraction: '0.95',
}

export function CountercurrentExtractionStagesCalculator() {
  const [distributionCoefficient, setDistributionCoefficient] =
    useState(example.distributionCoefficient)
  const [
    solventToRaffinateRatio,
    setSolventToRaffinateRatio,
  ] = useState(example.solventToRaffinateRatio)
  const [
    targetSoluteRecoveryFraction,
    setTargetSoluteRecoveryFraction,
  ] = useState(example.targetSoluteRecoveryFraction)

  const [result, setResult] =
    useState<CountercurrentExtractionStagesResult | null>(
      null,
    )
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCountercurrentExtractionStages({
          distributionCoefficient:
            Number(distributionCoefficient),
          solventToRaffinateRatio:
            Number(solventToRaffinateRatio),
          targetSoluteRecoveryFraction:
            Number(targetSoluteRecoveryFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          CountercurrentExtractionStagesCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDistributionCoefficient(
      example.distributionCoefficient,
    )
    setSolventToRaffinateRatio(
      example.solventToRaffinateRatio,
    )
    setTargetSoluteRecoveryFraction(
      example.targetSoluteRecoveryFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDistributionCoefficient('')
    setSolventToRaffinateRatio('')
    setTargetSoluteRecoveryFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–22"
        icon="⇆"
        title="Countercurrent Extraction Stages"
        subtitle="Ideal countercurrent stages for a target raffinate recovery"
      />

      <ReferenceBasis>
        Kremser-type extraction relation with extraction factor E = DS/F
      </ReferenceBasis>

      <div className="native-formula">
        XN/X0 = (E − 1)/(Eᴺ⁺¹ − 1)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Distribution Coefficient" symbol="D" value={distributionCoefficient} unit="—" onChange={setDistributionCoefficient} />
        <NumericInput label="Solvent / Raffinate Ratio" symbol="S/F" value={solventToRaffinateRatio} unit="kg/kg" onChange={setSolventToRaffinateRatio} />
        <NumericInput label="Target Solute Recovery" symbol="R" value={targetSoluteRecoveryFraction} unit="fraction" onChange={setTargetSoluteRecoveryFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate countercurrent stages"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required ideal stages"
          headlineValue={String(result.requiredIntegerStages)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Theoretical Stage Count" value={formatEngineeringNumber(result.theoreticalStageCount)} unit="stages" />
          <ResultItem label="Extraction Factor" value={formatEngineeringNumber(result.extractionFactor)} unit="—" />
          <ResultItem label="Achieved Recovery" value={formatEngineeringNumber(100 * result.achievedRecoveryFraction)} unit="%" />
          <ResultItem label="Achieved Remaining Fraction" value={formatEngineeringNumber(100 * result.achievedRemainingFraction)} unit="%" />
          <ResultItem label="E ≈ 1 Limiting Relation" value={result.limitingCaseUsed ? 'Used' : 'Not used'} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
