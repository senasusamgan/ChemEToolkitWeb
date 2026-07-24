import type {
  CombinedDryerTimeInput,
  CombinedDryerTimeResult,
} from './types.ts'

export type CombinedDryerTimeErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidMoistureOrdering'
  | 'numericalFailure'

const messages: Record<
  CombinedDryerTimeErrorCode,
  string
> = {
  nonFiniteInput:
    'All combined-dryer inputs must be finite.',
  nonPositiveProperty:
    'Dry-solid mass, drying area and constant drying rate must be greater than zero.',
  invalidMoistureOrdering:
    'Moisture contents must satisfy Xi > Xc > Xf > Xe ≥ 0.',
  numericalFailure:
    'The combined drying-time calculation did not produce finite physical results.',
}

export class CombinedDryerTimeCalculationError extends Error {
  readonly code: CombinedDryerTimeErrorCode

  constructor(code: CombinedDryerTimeErrorCode) {
    super(messages[code])
    this.name =
      'CombinedDryerTimeCalculationError'
    this.code = code
  }
}

export function calculateCombinedDryerTime(
  input: CombinedDryerTimeInput,
): CombinedDryerTimeResult {
  const values = [
    input.drySolidMass,
    input.dryingArea,
    input.constantDryingRate,
    input.initialMoistureContent,
    input.criticalMoistureContent,
    input.finalMoistureContent,
    input.equilibriumMoistureContent,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CombinedDryerTimeCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.drySolidMass <= 0 ||
    input.dryingArea <= 0 ||
    input.constantDryingRate <= 0
  ) {
    throw new CombinedDryerTimeCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    !(
      input.initialMoistureContent >
        input.criticalMoistureContent &&
      input.criticalMoistureContent >
        input.finalMoistureContent &&
      input.finalMoistureContent >
        input.equilibriumMoistureContent &&
      input.equilibriumMoistureContent >= 0
    )
  ) {
    throw new CombinedDryerTimeCalculationError(
      'invalidMoistureOrdering',
    )
  }

  const scale =
    input.drySolidMass /
    (
      input.dryingArea *
      input.constantDryingRate
    )

  const constantRateTime =
    scale *
    (
      input.initialMoistureContent -
      input.criticalMoistureContent
    )

  const fallingRateTime =
    scale *
    (
      input.criticalMoistureContent -
      input.equilibriumMoistureContent
    ) *
    Math.log(
      (
        input.criticalMoistureContent -
        input.equilibriumMoistureContent
      ) /
      (
        input.finalMoistureContent -
        input.equilibriumMoistureContent
      ),
    )

  const totalDryingTime =
    constantRateTime +
    fallingRateTime

  const constantRateMoistureRemoved =
    input.drySolidMass *
    (
      input.initialMoistureContent -
      input.criticalMoistureContent
    )

  const fallingRateMoistureRemoved =
    input.drySolidMass *
    (
      input.criticalMoistureContent -
      input.finalMoistureContent
    )

  const totalMoistureRemoved =
    constantRateMoistureRemoved +
    fallingRateMoistureRemoved

  const fallingRateTimeFraction =
    fallingRateTime /
    totalDryingTime

  const results = [
    constantRateTime,
    fallingRateTime,
    totalDryingTime,
    constantRateMoistureRemoved,
    fallingRateMoistureRemoved,
    totalMoistureRemoved,
    fallingRateTimeFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    constantRateTime <= 0 ||
    fallingRateTime <= 0 ||
    totalDryingTime <= 0 ||
    constantRateMoistureRemoved <= 0 ||
    fallingRateMoistureRemoved <= 0 ||
    totalMoistureRemoved <= 0 ||
    fallingRateTimeFraction <= 0 ||
    fallingRateTimeFraction >= 1
  ) {
    throw new CombinedDryerTimeCalculationError(
      'numericalFailure',
    )
  }

  return {
    constantRateTime,
    fallingRateTime,
    totalDryingTime,
    constantRateMoistureRemoved,
    fallingRateMoistureRemoved,
    totalMoistureRemoved,
    fallingRateTimeFraction,
    modelName:
      'Constant-rate plus linear falling-rate drying model',
    limitationDescription:
      'Moisture contents are on a dry-solid basis. The falling-rate relation assumes drying rate decreases linearly with free moisture content.',
  }
}
