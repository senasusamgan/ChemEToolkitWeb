import type {
  CentrifugalSettlingInput,
  CentrifugalSettlingResult,
} from './types.ts'

export type CentrifugalSettlingErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'particleNotDenserThanFluid'
  | 'invalidRadiusOrdering'
  | 'stokesRegimeExceeded'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  CentrifugalSettlingErrorCode,
  string
> = {
  nonFiniteInput: 'All centrifugation inputs must be finite.',
  nonPositiveProperty:
    'Particle diameter, particle density, fluid density, viscosity, rotational speed and both radii must be greater than zero.',
  particleNotDenserThanFluid:
    'The outward-settling model requires particle density greater than fluid density.',
  invalidRadiusOrdering:
    'Final radius must be greater than initial radius.',
  stokesRegimeExceeded:
    'Outer-radius particle Reynolds number exceeds 0.20. The implemented Stokes centrifugal-settling model is not valid.',
  numericalFailure:
    'The centrifugal-settling calculation did not produce finite physical results.',
}

export class CentrifugalSettlingCalculationError extends Error {
  readonly code: CentrifugalSettlingErrorCode

  constructor(code: CentrifugalSettlingErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'CentrifugalSettlingCalculationError'
    this.code = code
  }
}

const MAXIMUM_PARTICLE_REYNOLDS = 0.2
const COMPARISON_TOLERANCE = 1e-10
const STANDARD_GRAVITY = 9.80665

export function calculateCentrifugalSettling(
  input: CentrifugalSettlingInput,
): CentrifugalSettlingResult {
  const values = [
    input.particleDiameter,
    input.particleDensity,
    input.fluidDensity,
    input.fluidViscosity,
    input.rotationalSpeedRPM,
    input.initialRadius,
    input.finalRadius,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CentrifugalSettlingCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.particleDiameter <= 0 ||
    input.particleDensity <= 0 ||
    input.fluidDensity <= 0 ||
    input.fluidViscosity <= 0 ||
    input.rotationalSpeedRPM <= 0 ||
    input.initialRadius <= 0 ||
    input.finalRadius <= 0
  ) {
    throw new CentrifugalSettlingCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.particleDensity <= input.fluidDensity) {
    throw new CentrifugalSettlingCalculationError(
      'particleNotDenserThanFluid',
    )
  }

  if (input.finalRadius <= input.initialRadius) {
    throw new CentrifugalSettlingCalculationError(
      'invalidRadiusOrdering',
    )
  }

  const angularVelocity =
    (2 * Math.PI * input.rotationalSpeedRPM) / 60

  const densityDifference =
    input.particleDensity - input.fluidDensity

  const radialResponseCoefficient =
    (input.particleDiameter ** 2 *
      densityDifference *
      angularVelocity ** 2) /
    (18 * input.fluidViscosity)

  const innerRadialVelocity =
    radialResponseCoefficient * input.initialRadius

  const outerRadialVelocity =
    radialResponseCoefficient * input.finalRadius

  const outerParticleReynoldsNumber =
    (input.fluidDensity *
      outerRadialVelocity *
      input.particleDiameter) /
    input.fluidViscosity

  const reynoldsTolerance =
    Math.max(1, MAXIMUM_PARTICLE_REYNOLDS) *
    COMPARISON_TOLERANCE

  if (
    outerParticleReynoldsNumber >
    MAXIMUM_PARTICLE_REYNOLDS + reynoldsTolerance
  ) {
    throw new CentrifugalSettlingCalculationError(
      'stokesRegimeExceeded',
    )
  }

  const migrationTime =
    Math.log(input.finalRadius / input.initialRadius) /
    radialResponseCoefficient

  const migrationDistance =
    input.finalRadius - input.initialRadius

  const outerCentrifugalAcceleration =
    angularVelocity ** 2 * input.finalRadius

  const outerRelativeCentrifugalForce =
    outerCentrifugalAcceleration / STANDARD_GRAVITY

  const resultValues = [
    angularVelocity,
    radialResponseCoefficient,
    innerRadialVelocity,
    outerRadialVelocity,
    migrationDistance,
    migrationTime,
    outerCentrifugalAcceleration,
    outerRelativeCentrifugalForce,
    outerParticleReynoldsNumber,
    densityDifference,
  ]

  if (
    !resultValues.every(Number.isFinite) ||
    angularVelocity <= 0 ||
    radialResponseCoefficient <= 0 ||
    innerRadialVelocity <= 0 ||
    outerRadialVelocity <= innerRadialVelocity ||
    migrationDistance <= 0 ||
    migrationTime <= 0 ||
    outerCentrifugalAcceleration <= 0 ||
    outerRelativeCentrifugalForce <= 0 ||
    outerParticleReynoldsNumber <= 0 ||
    densityDifference <= 0
  ) {
    throw new CentrifugalSettlingCalculationError(
      'numericalFailure',
    )
  }

  return {
    angularVelocity,
    radialResponseCoefficient,
    innerRadialVelocity,
    outerRadialVelocity,
    migrationDistance,
    migrationTime,
    outerCentrifugalAcceleration,
    outerRelativeCentrifugalForce,
    outerParticleReynoldsNumber,
    densityDifference,
    modelName:
      'Integrated Stokes radial-settling model in a rigid-body centrifugal field',
    limitationDescription:
      'Assumes isolated spherical particles, creeping flow, no hindered settling, no Brownian diffusion, constant fluid properties and outward motion of particles denser than the liquid.',
  }
}
