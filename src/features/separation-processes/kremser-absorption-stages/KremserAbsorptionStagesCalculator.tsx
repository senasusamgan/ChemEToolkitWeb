import { useState } from 'react'
import {
  KremserAbsorptionStagesCalculationError,
  calculateKremserAbsorptionStages,
} from './engine'
import type { KremserAbsorptionStagesResult } from './types'
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
  factor: '1.5',
  targetRemovalFraction: '0.95',
}

export function KremserAbsorptionStagesCalculator() {
  const [factor, setFactor] = useState(example.factor)
  const [
    targetRemovalFraction,
    setTargetRemovalFraction,
  ] = useState(example.targetRemovalFraction)

  const [result, setResult] =
    useState<KremserAbsorptionStagesResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateKremserAbsorptionStages({
          factor: Number(factor),
          targetRemovalFraction:
            Number(targetRemovalFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          KremserAbsorptionStagesCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFactor(example.factor)
    setTargetRemovalFraction(
      example.targetRemovalFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFactor('')
    setTargetRemovalFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–27"
        icon="⇣"
        title="Kremser Absorption Stages"
        subtitle="Ideal stages required for a target gas-phase solute removal"
      />

      <ReferenceBasis>
        Fresh lean solvent and absorption factor A = L/(mV)
      </ReferenceBasis>

      <div className="native-formula">
        Yout/Yin = (A − 1)/(Aᴺ⁺¹ − 1)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Absorption Factor" symbol="A" value={factor} unit="—" onChange={setFactor} />
        <NumericInput label="Target Solute Removal" symbol="R" value={targetRemovalFraction} unit="fraction" onChange={setTargetRemovalFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate absorption stages"
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
          <ResultItem label="Achieved Removal" value={formatEngineeringNumber(100 * result.achievedRemovalFraction)} unit="%" />
          <ResultItem label="Remaining Gas Solute" value={formatEngineeringNumber(100 * result.achievedRemainingFraction)} unit="%" />
          <ResultItem label="A ≈ 1 Limiting Relation" value={result.limitingCaseUsed ? 'Used' : 'Not used'} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
