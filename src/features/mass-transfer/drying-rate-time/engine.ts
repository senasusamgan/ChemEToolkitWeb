import type { DryingRateTimeInput, DryingRateTimeResult } from './types.ts'

export type DryingRateTimeErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeMoistureContent'
  | 'invalidMoistureOrdering'
  | 'finalAtOrBelowEquilibrium'
  | 'numericalFailure'

const messages: Record<DryingRateTimeErrorCode, string> = {
  nonFiniteInput: 'All drying inputs must be finite.',
  nonPositiveProperty:
    'Dry-solid mass, drying area and constant drying flux must be greater than zero.',
  negativeMoistureContent: 'Moisture contents cannot be negative.',
  invalidMoistureOrdering:
    'Initial moisture must exceed final moisture, and critical moisture must exceed equilibrium moisture.',
  finalAtOrBelowEquilibrium:
    'Final moisture must remain above equilibrium moisture; reaching equilibrium requires infinite time in the linear falling-rate model.',
  numericalFailure:
    'The drying-time calculation did not produce finite physical results.',
}

export class DryingRateTimeCalculationError extends Error {
  readonly code: DryingRateTimeErrorCode

  constructor(code: DryingRateTimeErrorCode) {
    super(messages[code])
    this.name = 'DryingRateTimeCalculationError'
    this.code = code
  }
}

const TOLERANCE = 1e-12

export function calculateDryingRateTime(
  input: DryingRateTimeInput,
): DryingRateTimeResult {
  const values = [
    input.drySolidMass,
    input.dryingArea,
    input.constantDryingFlux,
    input.initialMoistureContent,
    input.criticalMoistureContent,
    input.equilibriumMoistureContent,
    input.finalMoistureContent,
  ]

  if (!values.every(Number.isFinite)) {
    throw new DryingRateTimeCalculationError('nonFiniteInput')
  }
  if (
    input.drySolidMass <= 0 ||
    input.dryingArea <= 0 ||
    input.constantDryingFlux <= 0
  ) {
    throw new DryingRateTimeCalculationError('nonPositiveProperty')
  }
  if (
    input.initialMoistureContent < 0 ||
    input.criticalMoistureContent < 0 ||
    input.equilibriumMoistureContent < 0 ||
    input.finalMoistureContent < 0
  ) {
    throw new DryingRateTimeCalculationError('negativeMoistureContent')
  }
  if (
    input.initialMoistureContent <= input.finalMoistureContent ||
    input.criticalMoistureContent <= input.equilibriumMoistureContent
  ) {
    throw new DryingRateTimeCalculationError('invalidMoistureOrdering')
  }
  if (
    input.finalMoistureContent <=
    input.equilibriumMoistureContent + TOLERANCE
  ) {
    throw new DryingRateTimeCalculationError('finalAtOrBelowEquilibrium')
  }

  const timeFactor =
    input.drySolidMass /
    (input.dryingArea * input.constantDryingFlux)
  const constantStart = Math.max(
    input.initialMoistureContent,
    input.criticalMoistureContent,
  )
  const constantEnd = Math.max(
    input.finalMoistureContent,
    input.criticalMoistureContent,
  )
  const constantRateMoistureRemoved = Math.max(
    0,
    constantStart - constantEnd,
  )
  const constantRateTime =
    timeFactor * constantRateMoistureRemoved

  const fallingStart = Math.min(
    input.initialMoistureContent,
    input.criticalMoistureContent,
  )
  const fallingEnd = Math.min(
    input.finalMoistureContent,
    input.criticalMoistureContent,
  )
  const fallingRateMoistureRemoved = Math.max(
    0,
    fallingStart - fallingEnd,
  )

  let fallingRateTime = 0
  if (fallingRateMoistureRemoved > TOLERANCE) {
    const numerator =
      fallingStart - input.equilibriumMoistureContent
    const denominator =
      fallingEnd - input.equilibriumMoistureContent
    fallingRateTime =
      timeFactor *
      (input.criticalMoistureContent -
        input.equilibriumMoistureContent) *
      Math.log(numerator / denominator)
  }

  const totalDryingTime = constantRateTime + fallingRateTime
  const removedMoistureMass =
    input.drySolidMass *
    (input.initialMoistureContent - input.finalMoistureContent)
  const averageDryingFlux =
    removedMoistureMass / (input.dryingArea * totalDryingTime)
  const finalDryingFlux =
    input.finalMoistureContent >= input.criticalMoistureContent
      ? input.constantDryingFlux
      : input.constantDryingFlux *
        ((input.finalMoistureContent - input.equilibriumMoistureContent) /
          (input.criticalMoistureContent -
            input.equilibriumMoistureContent))

  let periodDescription: string
  if (constantRateTime > TOLERANCE && fallingRateTime > TOLERANCE) {
    periodDescription =
      'Drying includes both a constant-rate period and a linear falling-rate period.'
  } else if (constantRateTime > TOLERANCE) {
    periodDescription =
      'The specified moisture range remains entirely in the constant-rate period.'
  } else {
    periodDescription =
      'Drying starts below the critical moisture content and occurs entirely in the falling-rate period.'
  }

  const results = [
    constantRateTime,
    fallingRateTime,
    totalDryingTime,
    removedMoistureMass,
    averageDryingFlux,
    finalDryingFlux,
    constantRateMoistureRemoved,
    fallingRateMoistureRemoved,
  ]

  if (
    !results.every(Number.isFinite) ||
    totalDryingTime <= 0 ||
    removedMoistureMass <= 0 ||
    averageDryingFlux <= 0 ||
    finalDryingFlux < 0
  ) {
    throw new DryingRateTimeCalculationError('numericalFailure')
  }

  return {
    constantRateTime,
    fallingRateTime,
    totalDryingTime,
    removedMoistureMass,
    averageDryingFlux,
    finalDryingFlux,
    constantRateMoistureRemoved,
    fallingRateMoistureRemoved,
    periodDescription,
    modelName:
      'Constant-rate plus linear falling-rate drying on a dry-solid moisture basis',
  }
}
