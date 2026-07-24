import type {
  CoolingCrystallizerYieldInput,
  CoolingCrystallizerYieldResult,
} from './types.ts'

export type CoolingCrystallizerYieldErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'coldSolubilityNotLower'
  | 'purityOutOfRange'
  | 'numericalFailure'

const messages: Record<
  CoolingCrystallizerYieldErrorCode,
  string
> = {
  nonFiniteInput:
    'All cooling-crystallizer inputs must be finite.',
  nonPositiveProperty:
    'Feed mass and both solubilities must be greater than zero.',
  coldSolubilityNotLower:
    'Cold solubility must be lower than hot solubility.',
  purityOutOfRange:
    'Crystal purity must satisfy 0 < purity ≤ 1.',
  numericalFailure:
    'The cooling-crystallizer calculation did not produce a finite physical result.',
}

export class CoolingCrystallizerYieldCalculationError extends Error {
  readonly code: CoolingCrystallizerYieldErrorCode

  constructor(code: CoolingCrystallizerYieldErrorCode) {
    super(messages[code])
    this.name =
      'CoolingCrystallizerYieldCalculationError'
    this.code = code
  }
}

export function calculateCoolingCrystallizerYield(
  input: CoolingCrystallizerYieldInput,
): CoolingCrystallizerYieldResult {
  const values = [
    input.feedSolutionMass,
    input.hotSolubility,
    input.coldSolubility,
    input.crystalPurity,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CoolingCrystallizerYieldCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.feedSolutionMass <= 0 ||
    input.hotSolubility <= 0 ||
    input.coldSolubility <= 0
  ) {
    throw new CoolingCrystallizerYieldCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.coldSolubility >= input.hotSolubility) {
    throw new CoolingCrystallizerYieldCalculationError(
      'coldSolubilityNotLower',
    )
  }

  if (
    input.crystalPurity <= 0 ||
    input.crystalPurity > 1
  ) {
    throw new CoolingCrystallizerYieldCalculationError(
      'purityOutOfRange',
    )
  }

  const solventMass =
    input.feedSolutionMass /
    (1 + input.hotSolubility)

  const initialDissolvedSoluteMass =
    solventMass * input.hotSolubility

  const finalDissolvedSoluteMass =
    solventMass * input.coldSolubility

  const pureCrystalMass =
    initialDissolvedSoluteMass -
    finalDissolvedSoluteMass

  const productCrystalMass =
    pureCrystalMass / input.crystalPurity

  const soluteRecoveryFraction =
    pureCrystalMass /
    initialDissolvedSoluteMass

  const motherLiquorMass =
    solventMass +
    finalDissolvedSoluteMass

  const results = [
    solventMass,
    initialDissolvedSoluteMass,
    finalDissolvedSoluteMass,
    pureCrystalMass,
    productCrystalMass,
    soluteRecoveryFraction,
    motherLiquorMass,
  ]

  if (
    !results.every(Number.isFinite) ||
    solventMass <= 0 ||
    initialDissolvedSoluteMass <= 0 ||
    finalDissolvedSoluteMass <= 0 ||
    pureCrystalMass <= 0 ||
    productCrystalMass <= 0 ||
    soluteRecoveryFraction <= 0 ||
    soluteRecoveryFraction >= 1 ||
    motherLiquorMass <= 0
  ) {
    throw new CoolingCrystallizerYieldCalculationError(
      'numericalFailure',
    )
  }

  return {
    solventMass,
    initialDissolvedSoluteMass,
    finalDissolvedSoluteMass,
    pureCrystalMass,
    productCrystalMass,
    soluteRecoveryFraction,
    motherLiquorMass,
    modelName:
      'Cooling crystallization from solubility data on a solvent basis',
    limitationDescription:
      'Assumes no solvent evaporation, equilibrium saturation at both temperatures and specified crystal purity.',
  }
}
