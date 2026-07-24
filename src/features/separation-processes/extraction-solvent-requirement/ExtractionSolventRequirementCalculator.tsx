import { useState } from 'react'
import {
  ExtractionSolventRequirementCalculationError,
  calculateExtractionSolventRequirement,
} from './engine'
import type { ExtractionSolventRequirementResult } from './types'
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
  raffinateCarrierFlowRate: '100',
  distributionCoefficient: '3',
  targetSoluteRecoveryFraction: '0.80',
}

export function ExtractionSolventRequirementCalculator() {
  const [raffinateCarrierFlowRate, setRaffinateCarrierFlowRate] =
    useState(example.raffinateCarrierFlowRate)
  const [distributionCoefficient, setDistributionCoefficient] =
    useState(example.distributionCoefficient)
  const [
    targetSoluteRecoveryFraction,
    setTargetSoluteRecoveryFraction,
  ] = useState(example.targetSoluteRecoveryFraction)

  const [result, setResult] =
    useState<ExtractionSolventRequirementResult | null>(
      null,
    )
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateExtractionSolventRequirement({
          raffinateCarrierFlowRate:
            Number(raffinateCarrierFlowRate),
          distributionCoefficient:
            Number(distributionCoefficient),
          targetSoluteRecoveryFraction:
            Number(targetSoluteRecoveryFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ExtractionSolventRequirementCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setRaffinateCarrierFlowRate(
      example.raffinateCarrierFlowRate,
    )
    setDistributionCoefficient(
      example.distributionCoefficient,
    )
    setTargetSoluteRecoveryFraction(
      example.targetSoluteRecoveryFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setRaffinateCarrierFlowRate('')
    setDistributionCoefficient('')
    setTargetSoluteRecoveryFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–20"
        icon="◫"
        title="Extraction Solvent Requirement"
        subtitle="Fresh solvent needed for a target single-stage solute recovery"
      />

      <ReferenceBasis>
        Fresh-solvent equilibrium extraction with Y = DX
      </ReferenceBasis>

      <div className="native-formula">
        S = F R/[D(1 − R)]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Raffinate Carrier Flow" symbol="F" value={raffinateCarrierFlowRate} unit="kg/h" onChange={setRaffinateCarrierFlowRate} />
        <NumericInput label="Distribution Coefficient" symbol="D" value={distributionCoefficient} unit="—" onChange={setDistributionCoefficient} />
        <NumericInput label="Target Solute Recovery" symbol="R" value={targetSoluteRecoveryFraction} unit="fraction" onChange={setTargetSoluteRecoveryFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate solvent requirement"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required solvent flow"
          headlineValue={`${formatEngineeringNumber(
            result.requiredSolventFlowRate,
          )} kg/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Solvent / Raffinate Ratio" value={formatEngineeringNumber(result.solventToRaffinateRatio)} unit="kg/kg" />
          <ResultItem label="Extraction Factor" value={formatEngineeringNumber(result.extractionFactor)} unit="—" />
          <ResultItem label="Raffinate Remaining" value={formatEngineeringNumber(100 * result.raffinateRemainingFraction)} unit="%" />
          <ResultItem label="Verified Recovery" value={formatEngineeringNumber(100 * result.achievedRecoveryFraction)} unit="%" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
