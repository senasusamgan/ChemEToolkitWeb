import type {
  ExtractionSolventRequirementInput,
  ExtractionSolventRequirementResult,
} from './types.ts'

export type ExtractionSolventRequirementErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'recoveryOutOfRange'
  | 'numericalFailure'

const messages: Record<
  ExtractionSolventRequirementErrorCode,
  string
> = {
  nonFiniteInput:
    'All solvent-requirement inputs must be finite.',
  nonPositiveProperty:
    'Raffinate carrier flow and distribution coefficient must be greater than zero.',
  recoveryOutOfRange:
    'Target recovery must satisfy 0 < recovery < 1.',
  numericalFailure:
    'The solvent-requirement calculation did not produce finite physical results.',
}

export class ExtractionSolventRequirementCalculationError extends Error {
  readonly code: ExtractionSolventRequirementErrorCode

  constructor(code: ExtractionSolventRequirementErrorCode) {
    super(messages[code])
    this.name =
      'ExtractionSolventRequirementCalculationError'
    this.code = code
  }
}

export function calculateExtractionSolventRequirement(
  input: ExtractionSolventRequirementInput,
): ExtractionSolventRequirementResult {
  const values = [
    input.raffinateCarrierFlowRate,
    input.distributionCoefficient,
    input.targetSoluteRecoveryFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new ExtractionSolventRequirementCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.raffinateCarrierFlowRate <= 0 ||
    input.distributionCoefficient <= 0
  ) {
    throw new ExtractionSolventRequirementCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.targetSoluteRecoveryFraction <= 0 ||
    input.targetSoluteRecoveryFraction >= 1
  ) {
    throw new ExtractionSolventRequirementCalculationError(
      'recoveryOutOfRange',
    )
  }

  const raffinateRemainingFraction =
    1 - input.targetSoluteRecoveryFraction

  const extractionFactor =
    input.targetSoluteRecoveryFraction /
    raffinateRemainingFraction

  const solventToRaffinateRatio =
    extractionFactor /
    input.distributionCoefficient

  const requiredSolventFlowRate =
    input.raffinateCarrierFlowRate *
    solventToRaffinateRatio

  const achievedRecoveryFraction =
    extractionFactor /
    (1 + extractionFactor)

  const results = [
    raffinateRemainingFraction,
    extractionFactor,
    solventToRaffinateRatio,
    requiredSolventFlowRate,
    achievedRecoveryFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    raffinateRemainingFraction <= 0 ||
    extractionFactor <= 0 ||
    solventToRaffinateRatio <= 0 ||
    requiredSolventFlowRate <= 0 ||
    achievedRecoveryFraction <= 0 ||
    achievedRecoveryFraction >= 1
  ) {
    throw new ExtractionSolventRequirementCalculationError(
      'numericalFailure',
    )
  }

  return {
    requiredSolventFlowRate,
    solventToRaffinateRatio,
    extractionFactor,
    raffinateRemainingFraction,
    achievedRecoveryFraction,
    modelName:
      'Single equilibrium extraction with fresh solute-free solvent',
    limitationDescription:
      'Assumes immiscible carrier phases, constant distribution coefficient and negligible carrier mutual solubility.',
  }
}
