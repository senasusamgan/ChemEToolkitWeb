import { useState } from 'react'
import {
  KremserStrippingStagesCalculationError,
  calculateKremserStrippingStages,
} from './engine'
import type { KremserStrippingStagesResult } from './types'
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
  factor: '1.8',
  targetRemovalFraction: '0.90',
}

export function KremserStrippingStagesCalculator() {
  const [factor, setFactor] = useState(example.factor)
  const [
    targetRemovalFraction,
    setTargetRemovalFraction,
  ] = useState(example.targetRemovalFraction)

  const [result, setResult] =
    useState<KremserStrippingStagesResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateKremserStrippingStages({
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
          KremserStrippingStagesCalculationError
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
        code="SP–28"
        icon="⇡"
        title="Kremser Stripping Stages"
        subtitle="Ideal stages required for a target liquid-phase solute removal"
      />

      <ReferenceBasis>
        Fresh stripping gas and stripping factor S = mV/L
      </ReferenceBasis>

      <div className="native-formula">
        Xout/Xin = (S − 1)/(Sᴺ⁺¹ − 1)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Stripping Factor" symbol="S" value={factor} unit="—" onChange={setFactor} />
        <NumericInput label="Target Solute Removal" symbol="R" value={targetRemovalFraction} unit="fraction" onChange={setTargetRemovalFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate stripping stages"
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
          <ResultItem label="Remaining Liquid Solute" value={formatEngineeringNumber(100 * result.achievedRemainingFraction)} unit="%" />
          <ResultItem label="S ≈ 1 Limiting Relation" value={result.limitingCaseUsed ? 'Used' : 'Not used'} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
