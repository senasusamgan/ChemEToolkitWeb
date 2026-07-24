import type {
  EvaporativeCrystallizerBalanceInput,
  EvaporativeCrystallizerBalanceResult,
} from './types.ts'

export type EvaporativeCrystallizerBalanceErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'massFractionOutOfRange'
  | 'evaporationTooHigh'
  | 'noCrystallization'
  | 'numericalFailure'

const messages: Record<
  EvaporativeCrystallizerBalanceErrorCode,
  string
> = {
  nonFiniteInput:
    'All evaporative-crystallizer inputs must be finite.',
  nonPositiveProperty:
    'Feed mass flow must be greater than zero and evaporation rate cannot be negative.',
  massFractionOutOfRange:
    'Feed composition, mother-liquor composition and crystal purity must lie between zero and one.',
  evaporationTooHigh:
    'Solvent evaporation rate must be lower than the feed mass flow rate.',
  noCrystallization:
    'The specified evaporation and saturation state do not produce a positive crystal flow.',
  numericalFailure:
    'The evaporative-crystallizer balance did not produce a finite physical result.',
}

export class EvaporativeCrystallizerBalanceCalculationError extends Error {
  readonly code: EvaporativeCrystallizerBalanceErrorCode

  constructor(code: EvaporativeCrystallizerBalanceErrorCode) {
    super(messages[code])
    this.name =
      'EvaporativeCrystallizerBalanceCalculationError'
    this.code = code
  }
}

export function calculateEvaporativeCrystallizerBalance(
  input: EvaporativeCrystallizerBalanceInput,
): EvaporativeCrystallizerBalanceResult {
  const values = [
    input.feedMassFlowRate,
    input.feedSoluteMassFraction,
    input.motherLiquorSoluteMassFraction,
    input.solventEvaporationRate,
    input.crystalPurity,
  ]

  if (!values.every(Number.isFinite)) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.feedMassFlowRate <= 0 ||
    input.solventEvaporationRate < 0
  ) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.feedSoluteMassFraction <= 0 ||
    input.feedSoluteMassFraction >= 1 ||
    input.motherLiquorSoluteMassFraction <= 0 ||
    input.motherLiquorSoluteMassFraction >= 1 ||
    input.crystalPurity <= 0 ||
    input.crystalPurity > 1
  ) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'massFractionOutOfRange',
    )
  }

  if (
    input.solventEvaporationRate >=
    input.feedMassFlowRate
  ) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'evaporationTooHigh',
    )
  }

  const remainingMassAfterEvaporation =
    input.feedMassFlowRate -
    input.solventEvaporationRate

  const denominator =
    input.crystalPurity -
    input.motherLiquorSoluteMassFraction

  if (denominator <= 0) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'noCrystallization',
    )
  }

  const productCrystalRate =
    (
      input.feedMassFlowRate *
      input.feedSoluteMassFraction -
      input.motherLiquorSoluteMassFraction *
      remainingMassAfterEvaporation
    ) / denominator

  const motherLiquorRate =
    remainingMassAfterEvaporation -
    productCrystalRate

  if (
    productCrystalRate <= 0 ||
    motherLiquorRate <= 0
  ) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'noCrystallization',
    )
  }

  const pureCrystalSoluteRate =
    input.crystalPurity *
    productCrystalRate

  const motherLiquorSoluteRate =
    input.motherLiquorSoluteMassFraction *
    motherLiquorRate

  const feedSoluteRate =
    input.feedMassFlowRate *
    input.feedSoluteMassFraction

  const soluteRecoveryFraction =
    pureCrystalSoluteRate /
    feedSoluteRate

  const feedSolventRate =
    input.feedMassFlowRate *
    (1 - input.feedSoluteMassFraction)

  const solventRecoveryFraction =
    input.solventEvaporationRate /
    feedSolventRate

  const totalBalanceResidual =
    input.feedMassFlowRate -
    input.solventEvaporationRate -
    productCrystalRate -
    motherLiquorRate

  const soluteBalanceResidual =
    feedSoluteRate -
    pureCrystalSoluteRate -
    motherLiquorSoluteRate

  const results = [
    pureCrystalSoluteRate,
    productCrystalRate,
    motherLiquorRate,
    motherLiquorSoluteRate,
    solventRecoveryFraction,
    soluteRecoveryFraction,
    totalBalanceResidual,
    soluteBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    pureCrystalSoluteRate <= 0 ||
    productCrystalRate <= 0 ||
    motherLiquorRate <= 0 ||
    motherLiquorSoluteRate <= 0 ||
    solventRecoveryFraction < 0 ||
    soluteRecoveryFraction <= 0 ||
    soluteRecoveryFraction > 1
  ) {
    throw new EvaporativeCrystallizerBalanceCalculationError(
      'numericalFailure',
    )
  }

  return {
    pureCrystalSoluteRate,
    productCrystalRate,
    motherLiquorRate,
    motherLiquorSoluteRate,
    solventRecoveryFraction,
    soluteRecoveryFraction,
    totalBalanceResidual,
    soluteBalanceResidual,
    modelName:
      'Steady evaporative crystallizer total and solute balances',
    limitationDescription:
      'Assumes solvent-only vapor, specified saturated mother-liquor composition and a fixed crystal purity.',
  }
}
