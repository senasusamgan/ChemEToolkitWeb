export const MINIMUM_FLUIDIZATION_VELOCITY_ENGINE_VERSION =
  '1.0.0'

export interface MinimumFluidizationVelocityInputs {
  particleDiameter: number
  particleDensity: number
  fluidDensity: number
  dynamicViscosity: number
  gravity: number
}

export interface MinimumFluidizationVelocityResult {
  archimedesNumber: number
  minimumFluidizationReynoldsNumber: number
  minimumFluidizationVelocity: number
}

export function calculateMinimumFluidizationVelocity(
  inputs:
    MinimumFluidizationVelocityInputs,
): MinimumFluidizationVelocityResult {
  const {
    particleDiameter,
    particleDensity,
    fluidDensity,
    dynamicViscosity,
    gravity,
  } = inputs

  for (
    const value
    of [
      particleDiameter,
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
        'All physical inputs must be finite and greater than zero.',
      )
    }
  }

  if (
    particleDensity <=
    fluidDensity
  ) {
    throw new Error(
      'Particle density must exceed fluid density for this fluidization estimate.',
    )
  }

  const archimedesNumber =
    (
      gravity
      * particleDiameter ** 3
      * fluidDensity
      * (
        particleDensity
        - fluidDensity
      )
    )
    / dynamicViscosity ** 2

  const minimumFluidizationReynoldsNumber =
    Math.sqrt(
      33.7 ** 2
      + 0.0408
        * archimedesNumber,
    )
    - 33.7

  const minimumFluidizationVelocity =
    (
      minimumFluidizationReynoldsNumber
      * dynamicViscosity
    )
    / (
      fluidDensity
      * particleDiameter
    )

  if (
    !Number.isFinite(
      minimumFluidizationVelocity,
    )
    || minimumFluidizationVelocity <= 0
  ) {
    throw new Error(
      'The supplied values do not produce a valid minimum fluidization velocity.',
    )
  }

  return {
    archimedesNumber,
    minimumFluidizationReynoldsNumber,
    minimumFluidizationVelocity,
  }
}
