import type {
  DryerThermalDutyInput,
  DryerThermalDutyResult,
} from './types.ts'

export type DryerThermalDutyErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'finalMoistureNotLower'
  | 'temperatureNotIncreasing'
  | 'heatLossOutOfRange'
  | 'numericalFailure'

const messages: Record<
  DryerThermalDutyErrorCode,
  string
> = {
  nonFiniteInput:
    'All dryer thermal-duty inputs must be finite.',
  nonPositiveProperty:
    'Wet feed, moisture contents, heat capacities and latent heat must be positive.',
  finalMoistureNotLower:
    'Final dry-basis moisture must be lower than initial dry-basis moisture.',
  temperatureNotIncreasing:
    'Outlet temperature must be higher than inlet temperature for this heating-duty model.',
  heatLossOutOfRange:
    'Heat-loss fraction must satisfy 0 ≤ loss < 1.',
  numericalFailure:
    'The dryer thermal-duty calculation did not produce a finite physical result.',
}

export class DryerThermalDutyCalculationError extends Error {
  readonly code: DryerThermalDutyErrorCode

  constructor(code: DryerThermalDutyErrorCode) {
    super(messages[code])
    this.name =
      'DryerThermalDutyCalculationError'
    this.code = code
  }
}

export function calculateDryerThermalDuty(
  input: DryerThermalDutyInput,
): DryerThermalDutyResult {
  const values = [
    input.wetFeedMassFlowRate,
    input.initialMoistureDryBasis,
    input.finalMoistureDryBasis,
    input.inletTemperature,
    input.outletTemperature,
    input.drySolidHeatCapacity,
    input.liquidWaterHeatCapacity,
    input.latentHeatOfVaporization,
    input.heatLossFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new DryerThermalDutyCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.wetFeedMassFlowRate <= 0 ||
    input.initialMoistureDryBasis <= 0 ||
    input.finalMoistureDryBasis < 0 ||
    input.drySolidHeatCapacity <= 0 ||
    input.liquidWaterHeatCapacity <= 0 ||
    input.latentHeatOfVaporization <= 0
  ) {
    throw new DryerThermalDutyCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.finalMoistureDryBasis >=
    input.initialMoistureDryBasis
  ) {
    throw new DryerThermalDutyCalculationError(
      'finalMoistureNotLower',
    )
  }

  if (
    input.outletTemperature <=
    input.inletTemperature
  ) {
    throw new DryerThermalDutyCalculationError(
      'temperatureNotIncreasing',
    )
  }

  if (
    input.heatLossFraction < 0 ||
    input.heatLossFraction >= 1
  ) {
    throw new DryerThermalDutyCalculationError(
      'heatLossOutOfRange',
    )
  }

  const drySolidFlowRate =
    input.wetFeedMassFlowRate /
    (1 + input.initialMoistureDryBasis)

  const initialWaterFlowRate =
    drySolidFlowRate *
    input.initialMoistureDryBasis

  const finalWaterFlowRate =
    drySolidFlowRate *
    input.finalMoistureDryBasis

  const waterEvaporationRate =
    initialWaterFlowRate -
    finalWaterFlowRate

  const temperatureRise =
    input.outletTemperature -
    input.inletTemperature

  const drySolidSensibleDuty =
    drySolidFlowRate *
    input.drySolidHeatCapacity *
    temperatureRise

  const waterSensibleDuty =
    initialWaterFlowRate *
    input.liquidWaterHeatCapacity *
    temperatureRise

  const latentDuty =
    waterEvaporationRate *
    input.latentHeatOfVaporization

  const processDuty =
    drySolidSensibleDuty +
    waterSensibleDuty +
    latentDuty

  const requiredHeaterDuty =
    processDuty /
    (1 - input.heatLossFraction)

  const specificEnergyPerWaterRemoved =
    requiredHeaterDuty /
    waterEvaporationRate

  const results = [
    drySolidFlowRate,
    initialWaterFlowRate,
    finalWaterFlowRate,
    waterEvaporationRate,
    drySolidSensibleDuty,
    waterSensibleDuty,
    latentDuty,
    processDuty,
    requiredHeaterDuty,
    specificEnergyPerWaterRemoved,
  ]

  if (
    !results.every(Number.isFinite) ||
    drySolidFlowRate <= 0 ||
    initialWaterFlowRate <= 0 ||
    finalWaterFlowRate < 0 ||
    waterEvaporationRate <= 0 ||
    drySolidSensibleDuty <= 0 ||
    waterSensibleDuty <= 0 ||
    latentDuty <= 0 ||
    processDuty <= 0 ||
    requiredHeaterDuty <= 0 ||
    specificEnergyPerWaterRemoved <= 0
  ) {
    throw new DryerThermalDutyCalculationError(
      'numericalFailure',
    )
  }

  return {
    drySolidFlowRate,
    initialWaterFlowRate,
    finalWaterFlowRate,
    waterEvaporationRate,
    drySolidSensibleDuty,
    waterSensibleDuty,
    latentDuty,
    processDuty,
    requiredHeaterDuty,
    specificEnergyPerWaterRemoved,
    modelName:
      'Dry-basis moisture and lumped sensible-plus-latent dryer duty',
    limitationDescription:
      'Assumes constant heat capacities, one representative outlet temperature and no heat of sorption beyond the supplied latent heat.',
  }
}
