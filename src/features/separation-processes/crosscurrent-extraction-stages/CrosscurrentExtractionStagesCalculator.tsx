import { useState } from 'react'
import {
  CrosscurrentExtractionStagesCalculationError,
  calculateCrosscurrentExtractionStages,
} from './engine'
import type { CrosscurrentExtractionStagesResult } from './types'
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
  distributionCoefficient: '2.5',
  solventToRaffinateRatioPerStage: '0.4',
  targetSoluteRecoveryFraction: '0.95',
}

export function CrosscurrentExtractionStagesCalculator() {
  const [distributionCoefficient, setDistributionCoefficient] =
    useState(example.distributionCoefficient)
  const [
    solventToRaffinateRatioPerStage,
    setSolventToRaffinateRatioPerStage,
  ] = useState(example.solventToRaffinateRatioPerStage)
  const [
    targetSoluteRecoveryFraction,
    setTargetSoluteRecoveryFraction,
  ] = useState(example.targetSoluteRecoveryFraction)

  const [result, setResult] =
    useState<CrosscurrentExtractionStagesResult | null>(
      null,
    )
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCrosscurrentExtractionStages({
          distributionCoefficient:
            Number(distributionCoefficient),
          solventToRaffinateRatioPerStage:
            Number(solventToRaffinateRatioPerStage),
          targetSoluteRecoveryFraction:
            Number(targetSoluteRecoveryFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          CrosscurrentExtractionStagesCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDistributionCoefficient(
      example.distributionCoefficient,
    )
    setSolventToRaffinateRatioPerStage(
      example.solventToRaffinateRatioPerStage,
    )
    setTargetSoluteRecoveryFraction(
      example.targetSoluteRecoveryFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDistributionCoefficient('')
    setSolventToRaffinateRatioPerStage('')
    setTargetSoluteRecoveryFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–21"
        icon="↠"
        title="Crosscurrent Extraction Stages"
        subtitle="Ideal stages with equal fresh-solvent addition at every contact"
      />

      <ReferenceBasis>
        Remaining fraction after N stages: [1/(1 + E)]ᴺ
      </ReferenceBasis>

      <div className="native-formula">
        N = ln(1 − Rtarget) / ln[1/(1 + D S/F)]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Distribution Coefficient" symbol="D" value={distributionCoefficient} unit="—" onChange={setDistributionCoefficient} />
        <NumericInput label="Solvent / Raffinate per Stage" symbol="S/F" value={solventToRaffinateRatioPerStage} unit="kg/kg" onChange={setSolventToRaffinateRatioPerStage} />
        <NumericInput label="Target Solute Recovery" symbol="R" value={targetSoluteRecoveryFraction} unit="fraction" onChange={setTargetSoluteRecoveryFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate crosscurrent stages"
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
          <ResultItem label="Extraction Factor per Stage" value={formatEngineeringNumber(result.extractionFactorPerStage)} unit="—" />
          <ResultItem label="Raffinate Fraction per Stage" value={formatEngineeringNumber(result.raffinateFractionPerStage)} unit="—" />
          <ResultItem label="Achieved Recovery" value={formatEngineeringNumber(100 * result.achievedRecoveryFraction)} unit="%" />
          <ResultItem label="Achieved Remaining Fraction" value={formatEngineeringNumber(100 * result.achievedRemainingFraction)} unit="%" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
