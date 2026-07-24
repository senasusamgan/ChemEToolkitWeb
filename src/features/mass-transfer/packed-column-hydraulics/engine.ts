import type {
  PackedColumnHydraulicsInput,
  PackedColumnHydraulicsResult,
} from './types.ts'

export type PackedColumnHydraulicsErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeLiquidFlow'
  | 'invalidDesignFraction'
  | 'invalidVoidFraction'
  | 'modifiedReynoldsOutOfRange'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  PackedColumnHydraulicsErrorCode,
  string
> = {
  nonFiniteInput:
    'All packed-column hydraulic inputs must be finite.',
  nonPositiveProperty:
    'Gas flow, flooding velocity, packed height, gas properties and equivalent packing diameter must be greater than zero.',
  negativeLiquidFlow:
    'Liquid volumetric flow rate cannot be negative.',
  invalidDesignFraction:
    'Design fraction of flooding must be greater than zero and lower than one.',
  invalidVoidFraction:
    'Bed void fraction must lie strictly between zero and one.',
  modifiedReynoldsOutOfRange:
    'Modified particle Reynolds number exceeds 500, outside the conservative validity limit used for this dry Ergun estimate.',
  numericalFailure:
    'The packed-column hydraulic calculation did not produce finite physical results.',
}

export class PackedColumnHydraulicsCalculationError extends Error {
  readonly code: PackedColumnHydraulicsErrorCode

  constructor(code: PackedColumnHydraulicsErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'PackedColumnHydraulicsCalculationError'
    this.code = code
  }
}

const MAXIMUM_MODIFIED_REYNOLDS = 500
const REYNOLDS_BOUNDARY_TOLERANCE = 1e-9

export function calculatePackedColumnHydraulics(
  input: PackedColumnHydraulicsInput,
): PackedColumnHydraulicsResult {
  const values = [
    input.gasVolumetricFlowRate,
    input.liquidVolumetricFlowRate,
    input.floodingGasVelocity,
    input.designFractionOfFlooding,
    input.packedHeight,
    input.gasDensity,
    input.gasViscosity,
    input.bedVoidFraction,
    input.equivalentPackingDiameter,
  ]

  if (!values.every(Number.isFinite)) {
    throw new PackedColumnHydraulicsCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.gasVolumetricFlowRate <= 0 ||
    input.floodingGasVelocity <= 0 ||
    input.packedHeight <= 0 ||
    input.gasDensity <= 0 ||
    input.gasViscosity <= 0 ||
    input.equivalentPackingDiameter <= 0
  ) {
    throw new PackedColumnHydraulicsCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.liquidVolumetricFlowRate < 0) {
    throw new PackedColumnHydraulicsCalculationError(
      'negativeLiquidFlow',
    )
  }

  if (
    input.designFractionOfFlooding <= 0 ||
    input.designFractionOfFlooding >= 1
  ) {
    throw new PackedColumnHydraulicsCalculationError(
      'invalidDesignFraction',
    )
  }

  if (
    input.bedVoidFraction <= 0 ||
    input.bedVoidFraction >= 1
  ) {
    throw new PackedColumnHydraulicsCalculationError(
      'invalidVoidFraction',
    )
  }

  const designGasVelocity =
    input.floodingGasVelocity *
    input.designFractionOfFlooding

  const columnCrossSectionalArea =
    input.gasVolumetricFlowRate /
    designGasVelocity

  const columnDiameter =
    Math.sqrt(
      4 *
      columnCrossSectionalArea /
      Math.PI,
    )

  const superficialLiquidVelocity =
    input.liquidVolumetricFlowRate /
    columnCrossSectionalArea

  const modifiedParticleReynoldsNumber =
    (
      input.gasDensity *
      designGasVelocity *
      input.equivalentPackingDiameter
    ) /
    (
      input.gasViscosity *
      (1 - input.bedVoidFraction)
    )

  const withinReynoldsRange =
    modifiedParticleReynoldsNumber <
      MAXIMUM_MODIFIED_REYNOLDS ||
    Math.abs(
      modifiedParticleReynoldsNumber -
      MAXIMUM_MODIFIED_REYNOLDS,
    ) <= REYNOLDS_BOUNDARY_TOLERANCE

  if (!withinReynoldsRange) {
    throw new PackedColumnHydraulicsCalculationError(
      'modifiedReynoldsOutOfRange',
    )
  }

  const viscousGradient =
    (
      150 *
      input.gasViscosity *
      (1 - input.bedVoidFraction) ** 2 *
      designGasVelocity
    ) /
    (
      input.bedVoidFraction ** 3 *
      input.equivalentPackingDiameter ** 2
    )

  const inertialGradient =
    (
      1.75 *
      input.gasDensity *
      (1 - input.bedVoidFraction) *
      designGasVelocity ** 2
    ) /
    (
      input.bedVoidFraction ** 3 *
      input.equivalentPackingDiameter
    )

  const dryPressureDropPerLength =
    viscousGradient + inertialGradient

  const totalDryPressureDrop =
    dryPressureDropPerLength *
    input.packedHeight

  const gasCapacityFactor =
    designGasVelocity *
    Math.sqrt(input.gasDensity)

  const numericResults = [
    designGasVelocity,
    columnCrossSectionalArea,
    columnDiameter,
    superficialLiquidVelocity,
    gasCapacityFactor,
    modifiedParticleReynoldsNumber,
    dryPressureDropPerLength,
    totalDryPressureDrop,
  ]

  if (
    !numericResults.every(Number.isFinite) ||
    designGasVelocity <= 0 ||
    columnCrossSectionalArea <= 0 ||
    columnDiameter <= 0 ||
    superficialLiquidVelocity < 0 ||
    dryPressureDropPerLength <= 0 ||
    totalDryPressureDrop <= 0
  ) {
    throw new PackedColumnHydraulicsCalculationError(
      'numericalFailure',
    )
  }

  const designAssessment =
    input.designFractionOfFlooding >= 0.5 &&
    input.designFractionOfFlooding <= 0.8
      ? 'The selected design fraction lies within a common preliminary range.'
      : 'The selected fraction is outside the common 50–80% preliminary range; review the design basis.'

  return {
    designGasVelocity,
    columnCrossSectionalArea,
    columnDiameter,
    superficialLiquidVelocity,
    fractionOfFlooding:
      input.designFractionOfFlooding,
    gasCapacityFactor,
    modifiedParticleReynoldsNumber,
    dryPressureDropPerLength,
    totalDryPressureDrop,
    designAssessment,
    modelName:
      'Preliminary diameter sizing plus dry packed-bed Ergun estimate',
    limitationDescription:
      'The Ergun pressure drop is a dry single-gas-phase estimate. Liquid irrigation, loading and flooding corrections are not included.',
  }
}
