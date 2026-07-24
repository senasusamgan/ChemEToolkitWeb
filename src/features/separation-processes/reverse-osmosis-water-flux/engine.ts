import type {
  ReverseOsmosisWaterFluxInput,
  ReverseOsmosisWaterFluxResult,
} from './types.ts'

export type ReverseOsmosisWaterFluxErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeOsmoticPressure'
  | 'insufficientDrivingPressure'
  | 'numericalFailure'

const messages: Record<
  ReverseOsmosisWaterFluxErrorCode,
  string
> = {
  nonFiniteInput:
    'All reverse-osmosis inputs must be finite.',
  nonPositiveProperty:
    'Water permeability, applied pressure difference and membrane area must be greater than zero.',
  negativeOsmoticPressure:
    'Feed and permeate osmotic pressures cannot be negative.',
  insufficientDrivingPressure:
    'Applied pressure difference must exceed the osmotic pressure difference.',
  numericalFailure:
    'The reverse-osmosis calculation did not produce finite physical results.',
}

export class ReverseOsmosisWaterFluxCalculationError extends Error {
  readonly code: ReverseOsmosisWaterFluxErrorCode

  constructor(code: ReverseOsmosisWaterFluxErrorCode) {
    super(messages[code])
    this.name =
      'ReverseOsmosisWaterFluxCalculationError'
    this.code = code
  }
}

export function calculateReverseOsmosisWaterFlux(
  input: ReverseOsmosisWaterFluxInput,
): ReverseOsmosisWaterFluxResult {
  const values = [
    input.waterPermeability,
    input.appliedPressureDifference,
    input.feedOsmoticPressure,
    input.permeateOsmoticPressure,
    input.membraneArea,
  ]

  if (!values.every(Number.isFinite)) {
    throw new ReverseOsmosisWaterFluxCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.waterPermeability <= 0 ||
    input.appliedPressureDifference <= 0 ||
    input.membraneArea <= 0
  ) {
    throw new ReverseOsmosisWaterFluxCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.feedOsmoticPressure < 0 ||
    input.permeateOsmoticPressure < 0
  ) {
    throw new ReverseOsmosisWaterFluxCalculationError(
      'negativeOsmoticPressure',
    )
  }

  const osmoticPressureDifference =
    input.feedOsmoticPressure -
    input.permeateOsmoticPressure

  const netDrivingPressure =
    input.appliedPressureDifference -
    osmoticPressureDifference

  if (netDrivingPressure <= 0) {
    throw new ReverseOsmosisWaterFluxCalculationError(
      'insufficientDrivingPressure',
    )
  }

  const waterFlux =
    input.waterPermeability *
    netDrivingPressure

  const permeateFlowRate =
    waterFlux *
    input.membraneArea

  const permeateFlowCubicMetresPerHour =
    permeateFlowRate /
    1000

  const specificProductivity =
    permeateFlowCubicMetresPerHour /
    input.membraneArea

  const results = [
    osmoticPressureDifference,
    netDrivingPressure,
    waterFlux,
    permeateFlowRate,
    permeateFlowCubicMetresPerHour,
    specificProductivity,
  ]

  if (
    !results.every(Number.isFinite) ||
    netDrivingPressure <= 0 ||
    waterFlux <= 0 ||
    permeateFlowRate <= 0 ||
    permeateFlowCubicMetresPerHour <= 0 ||
    specificProductivity <= 0
  ) {
    throw new ReverseOsmosisWaterFluxCalculationError(
      'numericalFailure',
    )
  }

  return {
    osmoticPressureDifference,
    netDrivingPressure,
    waterFlux,
    permeateFlowRate,
    permeateFlowCubicMetresPerHour,
    specificProductivity,
    modelName:
      'Solution-diffusion water-flux relation',
    limitationDescription:
      'Uses constant permeability and bulk osmotic pressures. Concentration polarization, pressure drop, fouling and spatial recovery effects are excluded.',
  }
}
