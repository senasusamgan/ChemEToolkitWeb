import {
  EvaporatorMassCoreError,
  calculateEvaporatorMassCore,
} from '../evaporator/shared/evaporatorMassCore.ts'

import type {
  EvaporatorSteamRequirementInput,
  EvaporatorSteamRequirementResult,
} from './types.ts'

export {
  EvaporatorMassCoreError,
}

export const EVAPORATOR_STEAM_REQUIREMENT_ECONOMY_ENGINE_VERSION =
  'evaporator-steam-requirement-economy-v1'

export type EvaporatorSteamRequirementErrorCode =
  | 'INVALID_TEMPERATURE'
  | 'INVALID_TEMPERATURE_WINDOW'
  | 'INVALID_HEAT_CAPACITY'
  | 'INVALID_VAPORIZATION_LATENT_HEAT'
  | 'INVALID_STEAM_LATENT_HEAT'
  | 'INVALID_HEAT_LOSS'
  | 'NUMERICAL_FAILURE'

export class EvaporatorSteamRequirementError
  extends Error {
  readonly code:
    EvaporatorSteamRequirementErrorCode

  constructor(
    code:
      EvaporatorSteamRequirementErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'EvaporatorSteamRequirementError'

    this.code =
      code
  }
}

function requireFiniteTemperature(
  value: number,
  label: string,
): void {
  if (
    !Number.isFinite(value)
  ) {
    throw new EvaporatorSteamRequirementError(
      'INVALID_TEMPERATURE',
      `${label} must be finite.`,
    )
  }
}

function requirePositive(
  value: number,
  code:
    EvaporatorSteamRequirementErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new EvaporatorSteamRequirementError(
      code,
      `${label} must be a positive finite value.`,
    )
  }
}

export function calculateEvaporatorSteamRequirementEconomy(
  input:
    EvaporatorSteamRequirementInput,
): EvaporatorSteamRequirementResult {
  const mass =
    calculateEvaporatorMassCore(
      input,
    )

  requireFiniteTemperature(
    input.feedTemperature,
    'Feed temperature',
  )

  requireFiniteTemperature(
    input.boilingTemperature,
    'Boiling temperature',
  )

  if (
    input.boilingTemperature <
    input.feedTemperature
  ) {
    throw new EvaporatorSteamRequirementError(
      'INVALID_TEMPERATURE_WINDOW',
      'Boiling temperature must be greater than or equal to feed temperature for this sensible-heating model.',
    )
  }

  requirePositive(
    input.feedHeatCapacity,
    'INVALID_HEAT_CAPACITY',
    'Feed heat capacity',
  )

  requirePositive(
    input.vaporizationLatentHeat,
    'INVALID_VAPORIZATION_LATENT_HEAT',
    'Vaporization latent heat',
  )

  requirePositive(
    input.steamLatentHeat,
    'INVALID_STEAM_LATENT_HEAT',
    'Steam latent heat',
  )

  if (
    !Number.isFinite(
      input.heatLossFraction,
    ) ||
    input.heatLossFraction < 0 ||
    input.heatLossFraction >= 1
  ) {
    throw new EvaporatorSteamRequirementError(
      'INVALID_HEAT_LOSS',
      'Heat-loss fraction must satisfy 0 ≤ f < 1.',
    )
  }

  const temperatureRise =
    input.boilingTemperature -
    input.feedTemperature

  const sensibleHeatDuty =
    input.feedMassFlowRate *
    input.feedHeatCapacity *
    temperatureRise

  const evaporationHeatDuty =
    mass.evaporatedWaterMassFlowRate *
    input.vaporizationLatentHeat

  const usefulProcessHeatDuty =
    sensibleHeatDuty +
    evaporationHeatDuty

  const requiredSteamHeatRate =
    usefulProcessHeatDuty /
    (
      1 -
      input.heatLossFraction
    )

  const heatLossDuty =
    requiredSteamHeatRate -
    usefulProcessHeatDuty

  const requiredSteamMassFlowRate =
    requiredSteamHeatRate /
    input.steamLatentHeat

  const steamEconomy =
    mass.evaporatedWaterMassFlowRate /
    requiredSteamMassFlowRate

  const specificSteamConsumption =
    requiredSteamMassFlowRate /
    mass.evaporatedWaterMassFlowRate

  const energyBalanceClosureError =
    requiredSteamHeatRate -
    heatLossDuty -
    usefulProcessHeatDuty

  const energyBalanceClosurePercent =
    Math.abs(
      energyBalanceClosureError,
    ) /
    Math.max(
      Math.abs(
        requiredSteamHeatRate,
      ),
      1,
    ) *
    100

  const values = [
    sensibleHeatDuty,
    evaporationHeatDuty,
    usefulProcessHeatDuty,
    requiredSteamHeatRate,
    heatLossDuty,
    requiredSteamMassFlowRate,
    steamEconomy,
    specificSteamConsumption,
    energyBalanceClosureError,
    energyBalanceClosurePercent,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    requiredSteamMassFlowRate <= 0 ||
    steamEconomy <= 0
  ) {
    throw new EvaporatorSteamRequirementError(
      'NUMERICAL_FAILURE',
      'The evaporator steam requirement calculation did not produce finite physical results.',
    )
  }

  return {
    modelName:
      'Single-Effect Evaporator Steam Requirement & Economy',

    limitationDescription:
      'Steady-state single-effect evaporator model with conserved nonvolatile solids, constant feed heat capacity, specified boiling temperature, latent heats and heat loss referenced to supplied steam duty.',

    ...mass,

    sensibleHeatDuty,
    evaporationHeatDuty,
    usefulProcessHeatDuty,

    requiredSteamHeatRate,
    heatLossDuty,

    requiredSteamMassFlowRate,

    steamEconomy,
    specificSteamConsumption,

    energyBalanceClosureError,
    energyBalanceClosurePercent,
  }
}

export function createEvaporatorSteamRequirementEconomyCsv(
  input:
    EvaporatorSteamRequirementInput,
  result:
    EvaporatorSteamRequirementResult,
): string {
  const rows = [
    [
      'Evaporator Steam Requirement & Economy',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Feed mass flow',
      input.feedMassFlowRate,
      'kg/h',
    ],
    [
      'Feed solids fraction',
      input.feedSolidsMassFraction,
      'mass fraction',
    ],
    [
      'Product solids fraction',
      input.productSolidsMassFraction,
      'mass fraction',
    ],
    [
      'Feed temperature',
      input.feedTemperature,
      '°C',
    ],
    [
      'Boiling temperature',
      input.boilingTemperature,
      '°C',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Product mass flow',
      result.productMassFlowRate,
      'kg/h',
    ],
    [
      'Evaporated water',
      result.evaporatedWaterMassFlowRate,
      'kg/h',
    ],
    [
      'Required steam',
      result.requiredSteamMassFlowRate,
      'kg/h',
    ],
    [
      'Steam economy',
      result.steamEconomy,
      'kg evaporated/kg steam',
    ],
    [
      'Specific steam consumption',
      result.specificSteamConsumption,
      'kg steam/kg evaporated',
    ],
    [
      'Useful heat duty',
      result.usefulProcessHeatDuty,
      'kJ/h',
    ],
    [
      'Heat loss',
      result.heatLossDuty,
      'kJ/h',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
