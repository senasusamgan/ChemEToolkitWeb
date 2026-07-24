import type {
  FixedBedAdsorberBreakthroughInput,
  FixedBedAdsorberBreakthroughResult,
} from './types.ts'

export type FixedBedAdsorberBreakthroughErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'fractionOutOfRange'
  | 'numericalFailure'

const messages: Record<
  FixedBedAdsorberBreakthroughErrorCode,
  string
> = {
  nonFiniteInput:
    'All fixed-bed breakthrough inputs must be finite.',
  nonPositiveProperty:
    'Adsorbent mass, capacity, feed flow and inlet concentration must be greater than zero.',
  fractionOutOfRange:
    'Capacity utilization must satisfy 0 < η ≤ 1 and breakthrough concentration fraction must satisfy 0 ≤ Cb/C0 < 1.',
  numericalFailure:
    'The breakthrough calculation did not produce finite physical results.',
}

export class FixedBedAdsorberBreakthroughCalculationError extends Error {
  readonly code: FixedBedAdsorberBreakthroughErrorCode

  constructor(code: FixedBedAdsorberBreakthroughErrorCode) {
    super(messages[code])
    this.name =
      'FixedBedAdsorberBreakthroughCalculationError'
    this.code = code
  }
}

export function calculateFixedBedAdsorberBreakthrough(
  input: FixedBedAdsorberBreakthroughInput,
): FixedBedAdsorberBreakthroughResult {
  const values = [
    input.adsorbentMass,
    input.workingAdsorptionCapacity,
    input.capacityUtilizationFraction,
    input.feedVolumetricFlowRate,
    input.inletSoluteConcentration,
    input.breakthroughConcentrationFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new FixedBedAdsorberBreakthroughCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.adsorbentMass <= 0 ||
    input.workingAdsorptionCapacity <= 0 ||
    input.feedVolumetricFlowRate <= 0 ||
    input.inletSoluteConcentration <= 0
  ) {
    throw new FixedBedAdsorberBreakthroughCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.capacityUtilizationFraction <= 0 ||
    input.capacityUtilizationFraction > 1 ||
    input.breakthroughConcentrationFraction < 0 ||
    input.breakthroughConcentrationFraction >= 1
  ) {
    throw new FixedBedAdsorberBreakthroughCalculationError(
      'fractionOutOfRange',
    )
  }

  const usableSoluteCapacity =
    input.adsorbentMass *
    input.workingAdsorptionCapacity *
    input.capacityUtilizationFraction

  const inletSoluteLoadingRate =
    input.feedVolumetricFlowRate *
    input.inletSoluteConcentration

  const averageRemovalFraction =
    1 -
    input.breakthroughConcentrationFraction

  const removedSoluteLoadingRate =
    inletSoluteLoadingRate *
    averageRemovalFraction

  const breakthroughTime =
    usableSoluteCapacity /
    removedSoluteLoadingRate

  const treatedVolumeAtBreakthrough =
    input.feedVolumetricFlowRate *
    breakthroughTime

  const bedVolumesTreated =
    treatedVolumeAtBreakthrough /
    input.adsorbentMass

  const results = [
    usableSoluteCapacity,
    inletSoluteLoadingRate,
    removedSoluteLoadingRate,
    breakthroughTime,
    treatedVolumeAtBreakthrough,
    bedVolumesTreated,
    averageRemovalFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    usableSoluteCapacity <= 0 ||
    inletSoluteLoadingRate <= 0 ||
    removedSoluteLoadingRate <= 0 ||
    breakthroughTime <= 0 ||
    treatedVolumeAtBreakthrough <= 0 ||
    bedVolumesTreated <= 0 ||
    averageRemovalFraction <= 0 ||
    averageRemovalFraction > 1
  ) {
    throw new FixedBedAdsorberBreakthroughCalculationError(
      'numericalFailure',
    )
  }

  return {
    usableSoluteCapacity,
    inletSoluteLoadingRate,
    removedSoluteLoadingRate,
    breakthroughTime,
    treatedVolumeAtBreakthrough,
    bedVolumesTreated,
    averageRemovalFraction,
    modelName:
      'Usable-capacity fixed-bed breakthrough estimate',
    limitationDescription:
      'Uses an average removal fraction up to breakthrough. Detailed breakthrough-curve shape, mass-transfer-zone length, axial dispersion and competitive adsorption are not resolved.',
  }
}
