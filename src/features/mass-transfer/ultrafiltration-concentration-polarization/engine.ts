import type {
  UltrafiltrationConcentrationPolarizationInput,
  UltrafiltrationConcentrationPolarizationResult,
} from './types.ts'

export type UltrafiltrationConcentrationPolarizationErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'gelConcentrationNotAboveBulk'
  | 'sievingCoefficientOutOfRange'
  | 'recoveryOutsideLowRecoveryModel'
  | 'numericalFailure'

const messages: Record<
  UltrafiltrationConcentrationPolarizationErrorCode,
  string
> = {
  nonFiniteInput:
    'All ultrafiltration inputs must be finite.',
  nonPositiveProperty:
    'Feed flow, membrane area, mass-transfer coefficient and bulk concentration must be greater than zero.',
  gelConcentrationNotAboveBulk:
    'Gel concentration must be greater than the bulk solute concentration.',
  sievingCoefficientOutOfRange:
    'Observed sieving coefficient must satisfy 0 ≤ S ≤ 1.',
  recoveryOutsideLowRecoveryModel:
    'Calculated volumetric recovery exceeds 0.30. Reduce membrane area or increase feed flow.',
  numericalFailure:
    'The ultrafiltration calculation did not produce finite physical results.',
}

export class UltrafiltrationConcentrationPolarizationCalculationError extends Error {
  readonly code:
    UltrafiltrationConcentrationPolarizationErrorCode

  constructor(
    code: UltrafiltrationConcentrationPolarizationErrorCode,
  ) {
    super(messages[code])
    this.name =
      'UltrafiltrationConcentrationPolarizationCalculationError'
    this.code = code
  }
}

const maximumRecovery = 0.3
const tolerance = 1e-12

export function calculateUltrafiltrationConcentrationPolarization(
  input: UltrafiltrationConcentrationPolarizationInput,
): UltrafiltrationConcentrationPolarizationResult {
  const values = [
    input.feedVolumetricFlowRate,
    input.membraneArea,
    input.liquidSideMassTransferCoefficient,
    input.bulkSoluteConcentration,
    input.gelConcentration,
    input.observedSievingCoefficient,
  ]

  if (!values.every(Number.isFinite)) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.feedVolumetricFlowRate <= 0 ||
    input.membraneArea <= 0 ||
    input.liquidSideMassTransferCoefficient <= 0 ||
    input.bulkSoluteConcentration <= 0
  ) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.gelConcentration <=
    input.bulkSoluteConcentration
  ) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'gelConcentrationNotAboveBulk',
    )
  }

  if (
    input.observedSievingCoefficient < 0 ||
    input.observedSievingCoefficient > 1
  ) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'sievingCoefficientOutOfRange',
    )
  }

  const polarizationModulus =
    input.gelConcentration /
    input.bulkSoluteConcentration

  const limitingFluxMetersPerHour =
    input.liquidSideMassTransferCoefficient *
    Math.log(polarizationModulus)

  const limitingFluxLMH =
    1000 * limitingFluxMetersPerHour

  const permeateFlowRate =
    limitingFluxMetersPerHour *
    input.membraneArea

  const volumetricRecoveryFraction =
    permeateFlowRate /
    input.feedVolumetricFlowRate

  if (
    volumetricRecoveryFraction >
    maximumRecovery + tolerance
  ) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'recoveryOutsideLowRecoveryModel',
    )
  }

  const retentateFlowRate =
    input.feedVolumetricFlowRate -
    permeateFlowRate

  if (retentateFlowRate <= 0) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'numericalFailure',
    )
  }

  const permeateSoluteConcentration =
    input.observedSievingCoefficient *
    input.bulkSoluteConcentration

  const retentateSoluteConcentration =
    (
      input.feedVolumetricFlowRate *
        input.bulkSoluteConcentration -
      permeateFlowRate *
        permeateSoluteConcentration
    ) / retentateFlowRate

  const observedRejection =
    1 - input.observedSievingCoefficient

  const concentrationFactor =
    retentateSoluteConcentration /
    input.bulkSoluteConcentration

  const retainedSoluteRate =
    input.feedVolumetricFlowRate *
      input.bulkSoluteConcentration -
    permeateFlowRate *
      permeateSoluteConcentration

  const soluteBalanceResidual =
    input.feedVolumetricFlowRate *
      input.bulkSoluteConcentration -
    permeateFlowRate *
      permeateSoluteConcentration -
    retentateFlowRate *
      retentateSoluteConcentration

  const results = [
    limitingFluxMetersPerHour,
    limitingFluxLMH,
    polarizationModulus,
    permeateFlowRate,
    retentateFlowRate,
    volumetricRecoveryFraction,
    permeateSoluteConcentration,
    retentateSoluteConcentration,
    observedRejection,
    concentrationFactor,
    retainedSoluteRate,
    soluteBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    limitingFluxMetersPerHour <= 0 ||
    polarizationModulus <= 1 ||
    permeateFlowRate <= 0 ||
    volumetricRecoveryFraction <= 0 ||
    permeateSoluteConcentration < 0 ||
    retentateSoluteConcentration <= 0 ||
    observedRejection < 0 ||
    observedRejection > 1 ||
    concentrationFactor < 1 ||
    retainedSoluteRate <= 0
  ) {
    throw new UltrafiltrationConcentrationPolarizationCalculationError(
      'numericalFailure',
    )
  }

  return {
    limitingFluxMetersPerHour,
    limitingFluxLMH,
    polarizationModulus,
    permeateFlowRate,
    retentateFlowRate,
    volumetricRecoveryFraction,
    permeateSoluteConcentration,
    retentateSoluteConcentration,
    observedRejection,
    concentrationFactor,
    retainedSoluteRate,
    soluteBalanceResidual,
    modelName:
      'Gel-polarization limiting-flux ultrafiltration model',
    limitationDescription:
      'Assumes a specified gel concentration, constant liquid-side mass-transfer coefficient, observed sieving coefficient, no osmotic-pressure coupling and low module recovery.',
  }
}
