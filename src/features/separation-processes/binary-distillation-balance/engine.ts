import type {
  BinaryDistillationBalanceInput,
  BinaryDistillationBalanceResult,
} from './types.ts'

export type BinaryDistillationBalanceErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveFeed'
  | 'fractionOutOfRange'
  | 'invalidCompositionOrdering'
  | 'numericalFailure'

const messages: Record<
  BinaryDistillationBalanceErrorCode,
  string
> = {
  nonFiniteInput:
    'All binary-distillation inputs must be finite.',
  nonPositiveFeed:
    'Feed flow rate must be greater than zero.',
  fractionOutOfRange:
    'All mole or mass fractions must satisfy 0 ≤ x ≤ 1.',
  invalidCompositionOrdering:
    'For light-key separation, compositions must satisfy xB < zF < xD.',
  numericalFailure:
    'The binary distillation balance did not produce a finite physical result.',
}

export class BinaryDistillationBalanceCalculationError extends Error {
  readonly code: BinaryDistillationBalanceErrorCode

  constructor(code: BinaryDistillationBalanceErrorCode) {
    super(messages[code])
    this.name =
      'BinaryDistillationBalanceCalculationError'
    this.code = code
  }
}

export function calculateBinaryDistillationBalance(
  input: BinaryDistillationBalanceInput,
): BinaryDistillationBalanceResult {
  const values = [
    input.feedFlowRate,
    input.feedLightKeyFraction,
    input.distillateLightKeyFraction,
    input.bottomsLightKeyFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new BinaryDistillationBalanceCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.feedFlowRate <= 0) {
    throw new BinaryDistillationBalanceCalculationError(
      'nonPositiveFeed',
    )
  }

  if (
    input.feedLightKeyFraction < 0 ||
    input.feedLightKeyFraction > 1 ||
    input.distillateLightKeyFraction < 0 ||
    input.distillateLightKeyFraction > 1 ||
    input.bottomsLightKeyFraction < 0 ||
    input.bottomsLightKeyFraction > 1
  ) {
    throw new BinaryDistillationBalanceCalculationError(
      'fractionOutOfRange',
    )
  }

  if (
    !(
      input.bottomsLightKeyFraction <
        input.feedLightKeyFraction &&
      input.feedLightKeyFraction <
        input.distillateLightKeyFraction
    )
  ) {
    throw new BinaryDistillationBalanceCalculationError(
      'invalidCompositionOrdering',
    )
  }

  const denominator =
    input.distillateLightKeyFraction -
    input.bottomsLightKeyFraction

  const distillateFlowRate =
    input.feedFlowRate *
    (
      input.feedLightKeyFraction -
      input.bottomsLightKeyFraction
    ) /
    denominator

  const bottomsFlowRate =
    input.feedFlowRate -
    distillateFlowRate

  const distillateRecoveryFraction =
    distillateFlowRate /
    input.feedFlowRate

  const bottomsRecoveryFraction =
    bottomsFlowRate /
    input.feedFlowRate

  const feedLightKeyRate =
    input.feedFlowRate *
    input.feedLightKeyFraction

  const feedHeavyKeyRate =
    input.feedFlowRate *
    (1 - input.feedLightKeyFraction)

  const lightKeyRecoveryToDistillate =
    (
      distillateFlowRate *
      input.distillateLightKeyFraction
    ) /
    feedLightKeyRate

  const heavyKeyRecoveryToBottoms =
    (
      bottomsFlowRate *
      (1 - input.bottomsLightKeyFraction)
    ) /
    feedHeavyKeyRate

  const totalBalanceResidual =
    input.feedFlowRate -
    distillateFlowRate -
    bottomsFlowRate

  const lightKeyBalanceResidual =
    feedLightKeyRate -
    distillateFlowRate *
      input.distillateLightKeyFraction -
    bottomsFlowRate *
      input.bottomsLightKeyFraction

  const results = [
    distillateFlowRate,
    bottomsFlowRate,
    distillateRecoveryFraction,
    bottomsRecoveryFraction,
    lightKeyRecoveryToDistillate,
    heavyKeyRecoveryToBottoms,
    totalBalanceResidual,
    lightKeyBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    distillateFlowRate <= 0 ||
    bottomsFlowRate <= 0 ||
    distillateRecoveryFraction <= 0 ||
    distillateRecoveryFraction >= 1 ||
    bottomsRecoveryFraction <= 0 ||
    bottomsRecoveryFraction >= 1 ||
    lightKeyRecoveryToDistillate <= 0 ||
    lightKeyRecoveryToDistillate > 1 ||
    heavyKeyRecoveryToBottoms <= 0 ||
    heavyKeyRecoveryToBottoms > 1
  ) {
    throw new BinaryDistillationBalanceCalculationError(
      'numericalFailure',
    )
  }

  return {
    distillateFlowRate,
    bottomsFlowRate,
    distillateRecoveryFraction,
    bottomsRecoveryFraction,
    lightKeyRecoveryToDistillate,
    heavyKeyRecoveryToBottoms,
    totalBalanceResidual,
    lightKeyBalanceResidual,
    modelName:
      'Binary total and light-key component balances',
    limitationDescription:
      'Uses specified product compositions and neglects heat balance, reflux, stage efficiency and multicomponent effects.',
  }
}
