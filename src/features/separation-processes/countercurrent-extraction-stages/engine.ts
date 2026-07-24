import type {
  CountercurrentExtractionStagesInput,
  CountercurrentExtractionStagesResult,
} from './types.ts'

export type CountercurrentExtractionStagesErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'recoveryOutOfRange'
  | 'numericalFailure'

const messages: Record<
  CountercurrentExtractionStagesErrorCode,
  string
> = {
  nonFiniteInput:
    'All countercurrent extraction inputs must be finite.',
  nonPositiveProperty:
    'Distribution coefficient and solvent-to-raffinate ratio must be greater than zero.',
  recoveryOutOfRange:
    'Target recovery must satisfy 0 < recovery < 1.',
  numericalFailure:
    'The countercurrent stage calculation did not produce finite physical results.',
}

export class CountercurrentExtractionStagesCalculationError extends Error {
  readonly code: CountercurrentExtractionStagesErrorCode

  constructor(code: CountercurrentExtractionStagesErrorCode) {
    super(messages[code])
    this.name =
      'CountercurrentExtractionStagesCalculationError'
    this.code = code
  }
}

const unityTolerance = 1e-8

function remainingFraction(
  extractionFactor: number,
  stages: number,
): number {
  if (
    Math.abs(extractionFactor - 1) <
    unityTolerance
  ) {
    return 1 / (stages + 1)
  }

  return (
    (extractionFactor - 1) /
    (
      extractionFactor **
        (stages + 1) -
      1
    )
  )
}

export function calculateCountercurrentExtractionStages(
  input: CountercurrentExtractionStagesInput,
): CountercurrentExtractionStagesResult {
  const values = [
    input.distributionCoefficient,
    input.solventToRaffinateRatio,
    input.targetSoluteRecoveryFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CountercurrentExtractionStagesCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.distributionCoefficient <= 0 ||
    input.solventToRaffinateRatio <= 0
  ) {
    throw new CountercurrentExtractionStagesCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.targetSoluteRecoveryFraction <= 0 ||
    input.targetSoluteRecoveryFraction >= 1
  ) {
    throw new CountercurrentExtractionStagesCalculationError(
      'recoveryOutOfRange',
    )
  }

  const extractionFactor =
    input.distributionCoefficient *
    input.solventToRaffinateRatio

  const targetRemainingFraction =
    1 - input.targetSoluteRecoveryFraction

  const limitingCaseUsed =
    Math.abs(extractionFactor - 1) <
    unityTolerance

  let theoreticalStageCount: number

  if (limitingCaseUsed) {
    theoreticalStageCount =
      1 / targetRemainingFraction - 1
  } else {
    const powerTerm =
      1 +
      (
        extractionFactor - 1
      ) /
      targetRemainingFraction

    theoreticalStageCount =
      Math.log(powerTerm) /
      Math.log(extractionFactor) -
      1
  }

  const requiredIntegerStages =
    Math.ceil(theoreticalStageCount)

  const achievedRemainingFraction =
    remainingFraction(
      extractionFactor,
      requiredIntegerStages,
    )

  const achievedRecoveryFraction =
    1 - achievedRemainingFraction

  const results = [
    extractionFactor,
    theoreticalStageCount,
    requiredIntegerStages,
    achievedRemainingFraction,
    achievedRecoveryFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    extractionFactor <= 0 ||
    theoreticalStageCount <= 0 ||
    requiredIntegerStages < 1 ||
    achievedRemainingFraction <= 0 ||
    achievedRemainingFraction >= 1 ||
    achievedRecoveryFraction <= 0 ||
    achievedRecoveryFraction >= 1
  ) {
    throw new CountercurrentExtractionStagesCalculationError(
      'numericalFailure',
    )
  }

  return {
    extractionFactor,
    theoreticalStageCount,
    requiredIntegerStages,
    achievedRemainingFraction,
    achievedRecoveryFraction,
    limitingCaseUsed,
    modelName:
      'Ideal countercurrent extraction stage relation with fresh solvent',
    limitationDescription:
      'Assumes constant carrier flows, constant distribution coefficient, ideal stages and solute-free entering solvent.',
  }
}
