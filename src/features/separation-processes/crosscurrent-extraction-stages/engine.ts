import type {
  CrosscurrentExtractionStagesInput,
  CrosscurrentExtractionStagesResult,
} from './types.ts'

export type CrosscurrentExtractionStagesErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'recoveryOutOfRange'
  | 'numericalFailure'

const messages: Record<
  CrosscurrentExtractionStagesErrorCode,
  string
> = {
  nonFiniteInput:
    'All crosscurrent extraction inputs must be finite.',
  nonPositiveProperty:
    'Distribution coefficient and solvent-to-raffinate ratio must be greater than zero.',
  recoveryOutOfRange:
    'Target recovery must satisfy 0 < recovery < 1.',
  numericalFailure:
    'The crosscurrent stage calculation did not produce finite physical results.',
}

export class CrosscurrentExtractionStagesCalculationError extends Error {
  readonly code: CrosscurrentExtractionStagesErrorCode

  constructor(code: CrosscurrentExtractionStagesErrorCode) {
    super(messages[code])
    this.name =
      'CrosscurrentExtractionStagesCalculationError'
    this.code = code
  }
}

export function calculateCrosscurrentExtractionStages(
  input: CrosscurrentExtractionStagesInput,
): CrosscurrentExtractionStagesResult {
  const values = [
    input.distributionCoefficient,
    input.solventToRaffinateRatioPerStage,
    input.targetSoluteRecoveryFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CrosscurrentExtractionStagesCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.distributionCoefficient <= 0 ||
    input.solventToRaffinateRatioPerStage <= 0
  ) {
    throw new CrosscurrentExtractionStagesCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.targetSoluteRecoveryFraction <= 0 ||
    input.targetSoluteRecoveryFraction >= 1
  ) {
    throw new CrosscurrentExtractionStagesCalculationError(
      'recoveryOutOfRange',
    )
  }

  const extractionFactorPerStage =
    input.distributionCoefficient *
    input.solventToRaffinateRatioPerStage

  const raffinateFractionPerStage =
    1 /
    (1 + extractionFactorPerStage)

  const targetRemainingFraction =
    1 - input.targetSoluteRecoveryFraction

  const theoreticalStageCount =
    Math.log(targetRemainingFraction) /
    Math.log(raffinateFractionPerStage)

  const requiredIntegerStages =
    Math.ceil(theoreticalStageCount)

  const achievedRemainingFraction =
    raffinateFractionPerStage **
    requiredIntegerStages

  const achievedRecoveryFraction =
    1 - achievedRemainingFraction

  const results = [
    extractionFactorPerStage,
    raffinateFractionPerStage,
    theoreticalStageCount,
    requiredIntegerStages,
    achievedRemainingFraction,
    achievedRecoveryFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    extractionFactorPerStage <= 0 ||
    raffinateFractionPerStage <= 0 ||
    raffinateFractionPerStage >= 1 ||
    theoreticalStageCount <= 0 ||
    requiredIntegerStages < 1 ||
    achievedRemainingFraction <= 0 ||
    achievedRemainingFraction >= 1 ||
    achievedRecoveryFraction <= 0 ||
    achievedRecoveryFraction >= 1
  ) {
    throw new CrosscurrentExtractionStagesCalculationError(
      'numericalFailure',
    )
  }

  return {
    extractionFactorPerStage,
    raffinateFractionPerStage,
    theoreticalStageCount,
    requiredIntegerStages,
    achievedRemainingFraction,
    achievedRecoveryFraction,
    modelName:
      'Equal-solvent crosscurrent extraction with fresh solvent at every stage',
    limitationDescription:
      'Assumes constant carrier flows, constant distribution coefficient and equal fresh-solvent dosage at each ideal stage.',
  }
}
