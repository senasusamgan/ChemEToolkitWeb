import type {
  KremserStrippingStagesInput,
  KremserStrippingStagesResult,
} from './types.ts'

export type KremserStrippingStagesErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveFactor'
  | 'removalOutOfRange'
  | 'numericalFailure'

const messages: Record<
  KremserStrippingStagesErrorCode,
  string
> = {
  nonFiniteInput:
    'All stripping stage inputs must be finite.',
  nonPositiveFactor:
    'The stripping factor must be greater than zero.',
  removalOutOfRange:
    'Target removal must satisfy 0 < removal < 1.',
  numericalFailure:
    'The stripping stage calculation did not produce finite physical results.',
}

export class KremserStrippingStagesCalculationError extends Error {
  readonly code: KremserStrippingStagesErrorCode

  constructor(code: KremserStrippingStagesErrorCode) {
    super(messages[code])
    this.name = 'KremserStrippingStagesCalculationError'
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

export function calculateKremserStrippingStages(
  input: KremserStrippingStagesInput,
): KremserStrippingStagesResult {
  const values = [
    input.factor,
    input.targetRemovalFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new KremserStrippingStagesCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.factor <= 0) {
    throw new KremserStrippingStagesCalculationError(
      'nonPositiveFactor',
    )
  }

  if (
    input.targetRemovalFraction <= 0 ||
    input.targetRemovalFraction >= 1
  ) {
    throw new KremserStrippingStagesCalculationError(
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
    throw new KremserStrippingStagesCalculationError(
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
      'Ideal Kremser stripping stage relation',
    limitationDescription:
      'Assumes dilute solute, constant solute-free flow rates, linear equilibrium and ideal stages.',
  }
}
