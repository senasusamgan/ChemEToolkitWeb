export const FLUIDIZED_BED_PRESSURE_DROP_ENGINE_VERSION =
  '1.0.0'

export interface FluidizedBedPressureDropInputs {
  particleDiameter: number
  particleSphericity: number
  bedVoidage: number
  bedHeight: number
  particleDensity: number
  fluidDensity: number
  dynamicViscosity: number
  superficialVelocity: number
  gravity: number
}

export type FluidizationPressureState =
  | 'below-threshold'
  | 'at-or-above-threshold'

export interface FluidizedBedPressureDropResult {
  viscousPressureGradient: number
  inertialPressureGradient: number
  totalPressureGradient: number
  pressureDrop: number
  bedWeightPressureGradient: number
  bedWeightPressureDrop: number
  fluidizationRatio: number
  state: FluidizationPressureState
}

export function calculateFluidizedBedPressureDrop(
  inputs:
    FluidizedBedPressureDropInputs,
): FluidizedBedPressureDropResult {
  const {
    particleDiameter,
    particleSphericity,
    bedVoidage,
    bedHeight,
    particleDensity,
    fluidDensity,
    dynamicViscosity,
    superficialVelocity,
    gravity,
  } = inputs

  for (
    const value
    of [
      particleDiameter,
      bedHeight,
      particleDensity,
      fluidDensity,
      dynamicViscosity,
      gravity,
    ]
  ) {
    if (
      !Number.isFinite(value)
      || value <= 0
    ) {
      throw new Error(
        'All physical properties and dimensions must be finite and greater than zero.',
      )
    }
  }

  if (
    !Number.isFinite(
      superficialVelocity,
    )
    || superficialVelocity < 0
  ) {
    throw new Error(
      'Superficial velocity must be finite and non-negative.',
    )
  }

  if (
    !Number.isFinite(
      particleSphericity,
    )
    || particleSphericity <= 0
    || particleSphericity > 1
  ) {
    throw new Error(
      'Particle sphericity must be greater than zero and no greater than one.',
    )
  }

  if (
    !Number.isFinite(
      bedVoidage,
    )
    || bedVoidage <= 0
    || bedVoidage >= 1
  ) {
    throw new Error(
      'Bed voidage must lie strictly between zero and one.',
    )
  }

  if (
    particleDensity <=
    fluidDensity
  ) {
    throw new Error(
      'Particle density must exceed fluid density.',
    )
  }

  const solidsFraction =
    1
    - bedVoidage

  const voidageCubed =
    bedVoidage ** 3

  const viscousPressureGradient =
    (
      150
      * dynamicViscosity
      * superficialVelocity
      * solidsFraction ** 2
    )
    / (
      particleSphericity ** 2
      * particleDiameter ** 2
      * voidageCubed
    )

  const inertialPressureGradient =
    (
      1.75
      * fluidDensity
      * superficialVelocity ** 2
      * solidsFraction
    )
    / (
      particleSphericity
      * particleDiameter
      * voidageCubed
    )

  const totalPressureGradient =
    viscousPressureGradient
    + inertialPressureGradient

  const pressureDrop =
    totalPressureGradient
    * bedHeight

  const bedWeightPressureGradient =
    (
      particleDensity
      - fluidDensity
    )
    * solidsFraction
    * gravity

  const bedWeightPressureDrop =
    bedWeightPressureGradient
    * bedHeight

  const fluidizationRatio =
    pressureDrop
    / bedWeightPressureDrop

  return {
    viscousPressureGradient,
    inertialPressureGradient,
    totalPressureGradient,
    pressureDrop,
    bedWeightPressureGradient,
    bedWeightPressureDrop,
    fluidizationRatio,
    state:
      fluidizationRatio >= 1
        ? 'at-or-above-threshold'
        : 'below-threshold',
  }
}
