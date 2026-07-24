import type {
  HydrocycloneSeparationNumberInput,
  HydrocycloneSeparationNumberResult,
} from './types.ts'

export type HydrocycloneSeparationNumberErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidDensityOrdering'
  | 'numericalFailure'

const messages: Record<
  HydrocycloneSeparationNumberErrorCode,
  string
> = {
  nonFiniteInput:
    'All hydrocyclone separation-number inputs must be finite.',
  nonPositiveProperty:
    'Densities, particle diameter, inlet velocity, viscosity and cyclone diameter must be greater than zero.',
  invalidDensityOrdering:
    'Particle density must exceed fluid density for outward centrifugal separation.',
  numericalFailure:
    'The hydrocyclone separation-number calculation did not produce finite physical results.',
}

export class HydrocycloneSeparationNumberCalculationError extends Error {
  readonly code: HydrocycloneSeparationNumberErrorCode

  constructor(code: HydrocycloneSeparationNumberErrorCode) {
    super(messages[code])
    this.name =
      'HydrocycloneSeparationNumberCalculationError'
    this.code = code
  }
}

export function calculateHydrocycloneSeparationNumber(
  input: HydrocycloneSeparationNumberInput,
): HydrocycloneSeparationNumberResult {
  const values = [
    input.particleDensity,
    input.fluidDensity,
    input.particleDiameter,
    input.inletVelocity,
    input.fluidViscosity,
    input.cycloneDiameter,
  ]

  if (!values.every(Number.isFinite)) {
    throw new HydrocycloneSeparationNumberCalculationError(
      'nonFiniteInput',
    )
  }

  if (values.some((value) => value <= 0)) {
    throw new HydrocycloneSeparationNumberCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.particleDensity <= input.fluidDensity) {
    throw new HydrocycloneSeparationNumberCalculationError(
      'invalidDensityOrdering',
    )
  }

  const densityDifference =
    input.particleDensity -
    input.fluidDensity

  const separationNumber =
    (
      densityDifference *
      input.particleDiameter ** 2 *
      input.inletVelocity
    ) /
    (
      18 *
      input.fluidViscosity *
      input.cycloneDiameter
    )

  const particleReynoldsEstimate =
    (
      input.fluidDensity *
      input.inletVelocity *
      input.particleDiameter
    ) /
    input.fluidViscosity

  const centrifugalResponseAssessment =
    separationNumber >= 0.1
      ? 'Strong inertial response relative to viscous drag.'
      : separationNumber >= 0.01
        ? 'Moderate inertial response; geometry and residence time remain important.'
        : 'Weak inertial response; fine-particle capture may be limited.'

  const results = [
    densityDifference,
    separationNumber,
    particleReynoldsEstimate,
  ]

  if (
    !results.every(Number.isFinite) ||
    densityDifference <= 0 ||
    separationNumber <= 0 ||
    particleReynoldsEstimate <= 0
  ) {
    throw new HydrocycloneSeparationNumberCalculationError(
      'numericalFailure',
    )
  }

  return {
    densityDifference,
    separationNumber,
    particleReynoldsEstimate,
    centrifugalResponseAssessment,
    modelName:
      'Stokes-type hydrocyclone inertial separation number',
    limitationDescription:
      'This screening number compares particle centrifugal response with viscous drag. It is not a vendor cut-size or efficiency correlation and does not include cyclone geometry details, turbulence or hindered settling.',
  }
}
