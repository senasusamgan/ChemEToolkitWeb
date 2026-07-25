import type {
  BetMonolayerCapacityInput,
  BetMonolayerCapacityResult,
} from './types.ts'

export type BetMonolayerCapacityErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidBetFit'
  | 'numericalFailure'

const messages: Record<
  BetMonolayerCapacityErrorCode,
  string
> = {
  nonFiniteInput:
    'All BET inputs must be finite.',
  nonPositiveProperty:
    'BET slope, intercept and molecular cross-sectional area must be greater than zero.',
  invalidBetFit:
    'The fitted BET slope and intercept must produce C > 1.',
  numericalFailure:
    'The BET calculation did not produce finite physical results.',
}

export class BetMonolayerCapacityCalculationError extends Error {
  readonly code: BetMonolayerCapacityErrorCode

  constructor(code: BetMonolayerCapacityErrorCode) {
    super(messages[code])
    this.name =
      'BetMonolayerCapacityCalculationError'
    this.code = code
  }
}

const avogadroConstant = 6.02214076e23

export function calculateBetMonolayerCapacity(
  input: BetMonolayerCapacityInput,
): BetMonolayerCapacityResult {
  const values = [
    input.betSlope,
    input.betIntercept,
    input.molecularCrossSectionArea,
  ]

  if (!values.every(Number.isFinite)) {
    throw new BetMonolayerCapacityCalculationError(
      'nonFiniteInput',
    )
  }

  if (values.some((value) => value <= 0)) {
    throw new BetMonolayerCapacityCalculationError(
      'nonPositiveProperty',
    )
  }

  const monolayerCapacity =
    1 /
    (
      input.betSlope +
      input.betIntercept
    )

  const betConstant =
    1 +
    input.betSlope /
    input.betIntercept

  if (betConstant <= 1) {
    throw new BetMonolayerCapacityCalculationError(
      'invalidBetFit',
    )
  }

  const molecularAreaSquareMetres =
    input.molecularCrossSectionArea / 10 ** 18

  const specificSurfaceArea =
    monolayerCapacity *
    avogadroConstant *
    molecularAreaSquareMetres

  const consistencyRatio =
    input.betSlope /
    input.betIntercept

  const results = [
    monolayerCapacity,
    betConstant,
    specificSurfaceArea,
    consistencyRatio,
  ]

  if (
    !results.every(Number.isFinite) ||
    results.some((value) => value <= 0)
  ) {
    throw new BetMonolayerCapacityCalculationError(
      'numericalFailure',
    )
  }

  return {
    monolayerCapacity,
    betConstant,
    specificSurfaceArea,
    consistencyRatio,
    modelName:
      'Linearized BET slope–intercept evaluation',
    limitationDescription:
      'Assumes slope and intercept use a BET ordinate consistent with monolayer capacity in mol/kg. Surface area uses the supplied molecular cross-section.',
  }
}
