import type {
  KremserAbsorptionStagesInput,
  KremserAbsorptionStagesResult,
} from './types.ts'

export type KremserAbsorptionStagesErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveFactor'
  | 'removalOutOfRange'
  | 'numericalFailure'

const messages: Record<
  KremserAbsorptionStagesErrorCode,
  string
> = {
  nonFiniteInput:
    'All absorption stage inputs must be finite.',
  nonPositiveFactor:
    'The absorption factor must be greater than zero.',
  removalOutOfRange:
    'Target removal must satisfy 0 < removal < 1.',
  numericalFailure:
    'The absorption stage calculation did not produce finite physical results.',
}

export class KremserAbsorptionStagesCalculationError extends Error {
  readonly code: KremserAbsorptionStagesErrorCode

  constructor(code: KremserAbsorptionStagesErrorCode) {
    super(messages[code])
    this.name = 'KremserAbsorptionStagesCalculationError'
    this.code = code
  }
}

const unityTolerance = 1e-8

function remainingFraction(
  factor: number,
  stages: number,
): number {
  if (Math.abs(factor - 1) < unityTolerance) {
    return 1 / (stages + 1)
  }

  return (
    (factor - 1) /
    (factor ** (stages + 1) - 1)
  )
}

export function calculateKremserAbsorptionStages(
  input: KremserAbsorptionStagesInput,
): KremserAbsorptionStagesResult {
  const values = [
    input.factor,
    input.targetRemovalFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new KremserAbsorptionStagesCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.factor <= 0) {
    throw new KremserAbsorptionStagesCalculationError(
      'nonPositiveFactor',
    )
  }

  if (
    input.targetRemovalFraction <= 0 ||
    input.targetRemovalFraction >= 1
  ) {
    throw new KremserAbsorptionStagesCalculationError(
      'removalOutOfRange',
    )
  }

  const targetRemainingFraction =
    1 - input.targetRemovalFraction

  const limitingCaseUsed =
    Math.abs(input.factor - 1) <
    unityTolerance

  let theoreticalStageCount: number

  if (limitingCaseUsed) {
    theoreticalStageCount =
      1 / targetRemainingFraction - 1
  } else {
    const powerTerm =
      1 +
      (input.factor - 1) /
      targetRemainingFraction

    theoreticalStageCount =
      Math.log(powerTerm) /
      Math.log(input.factor) -
      1
  }

  const requiredIntegerStages =
    Math.ceil(theoreticalStageCount)

  const achievedRemainingFraction =
    remainingFraction(
      input.factor,
      requiredIntegerStages,
    )

  const achievedRemovalFraction =
    1 - achievedRemainingFraction

  const results = [
    theoreticalStageCount,
    requiredIntegerStages,
    achievedRemainingFraction,
    achievedRemovalFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    theoreticalStageCount <= 0 ||
    requiredIntegerStages < 1 ||
    achievedRemainingFraction <= 0 ||
    achievedRemainingFraction >= 1 ||
    achievedRemovalFraction <= 0 ||
    achievedRemovalFraction >= 1
  ) {
    throw new KremserAbsorptionStagesCalculationError(
      'numericalFailure',
    )
  }

  return {
    factor: input.factor,
    theoreticalStageCount,
    requiredIntegerStages,
    achievedRemainingFraction,
    achievedRemovalFraction,
    limitingCaseUsed,
    modelName:
      'Ideal Kremser absorption stage relation',
    limitationDescription:
      'Assumes dilute solute, constant solute-free flow rates, linear equilibrium and ideal stages.',
  }
}
