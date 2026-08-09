import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
  calculateMultipleEffectEvaporatorSteamEconomy,
} from '../multiple-effect-evaporator-steam-economy/engine.ts'

import type {
  EvaporatorTargetSteamEconomyEffectCountInput,
  EvaporatorTargetSteamEconomyEffectCountResult,
} from './types.ts'

export {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
}

export const EVAPORATOR_TARGET_STEAM_ECONOMY_EFFECT_COUNT_ENGINE_VERSION =
  'evaporator-target-steam-economy-effect-count-v1'

export type EvaporatorTargetSteamEconomyEffectCountErrorCode =
  | 'INVALID_TARGET_STEAM_ECONOMY'
  | 'TARGET_NOT_ACHIEVABLE'
  | 'NUMERICAL_FAILURE'

export class EvaporatorTargetSteamEconomyEffectCountError
  extends Error {
  readonly code:
    EvaporatorTargetSteamEconomyEffectCountErrorCode

  constructor(
    code:
      EvaporatorTargetSteamEconomyEffectCountErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'EvaporatorTargetSteamEconomyEffectCountError'

    this.code =
      code
  }
}

const MINIMUM_EFFECT_COUNT =
  2

const MAXIMUM_EFFECT_COUNT =
  10

export function calculateEvaporatorTargetSteamEconomyEffectCount(
  input:
    EvaporatorTargetSteamEconomyEffectCountInput,
): EvaporatorTargetSteamEconomyEffectCountResult {
  if (
    !Number.isFinite(
      input.targetSteamEconomy,
    ) ||
    input.targetSteamEconomy <= 0
  ) {
    throw new EvaporatorTargetSteamEconomyEffectCountError(
      'INVALID_TARGET_STEAM_ECONOMY',
      'Target steam economy must be a positive finite value.',
    )
  }

  let previousEffectSteamEconomy:
    number | null =
      null

  let highestEconomy =
    Number.NaN

  for (
    let effectCount =
      MINIMUM_EFFECT_COUNT;
    effectCount <=
      MAXIMUM_EFFECT_COUNT;
    effectCount += 1
  ) {
    const candidate =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,
        effectCount,
      })

    highestEconomy =
      candidate.steamEconomy

    if (
      candidate.steamEconomy >=
      input.targetSteamEconomy
    ) {
      const economyMargin =
        candidate.steamEconomy -
        input.targetSteamEconomy

      if (
        !Number.isFinite(
          economyMargin,
        )
      ) {
        throw new EvaporatorTargetSteamEconomyEffectCountError(
          'NUMERICAL_FAILURE',
          'The effect-count search produced a non-finite economy margin.',
        )
      }

      return {
        ...candidate,

        targetSteamEconomy:
          input.targetSteamEconomy,

        requiredEffectCount:
          effectCount,

        previousEffectSteamEconomy,

        economyMargin,

        searchLowerEffectCount:
          MINIMUM_EFFECT_COUNT,

        searchUpperEffectCount:
          MAXIMUM_EFFECT_COUNT,
      }
    }

    previousEffectSteamEconomy =
      candidate.steamEconomy
  }

  throw new EvaporatorTargetSteamEconomyEffectCountError(
    'TARGET_NOT_ACHIEVABLE',
    `The target steam economy of ${input.targetSteamEconomy} cannot be reached within 2 to 10 effects. Maximum calculated economy is ${highestEconomy}.`,
  )
}

export function createEvaporatorTargetSteamEconomyEffectCountCsv(
  input:
    EvaporatorTargetSteamEconomyEffectCountInput,
  result:
    EvaporatorTargetSteamEconomyEffectCountResult,
): string {
  const rows = [
    [
      'Evaporator Effect Count for Target Steam Economy',
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
      'Target steam economy',
      input.targetSteamEconomy,
      'kg water/kg steam',
    ],
    [
      'Vapor reuse efficiency',
      input.vaporReuseEfficiency,
      'fraction',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Required number of effects',
      result.requiredEffectCount,
      '-',
    ],
    [
      'Achieved steam economy',
      result.steamEconomy,
      'kg water/kg steam',
    ],
    [
      'Economy margin above target',
      result.economyMargin,
      'kg water/kg steam',
    ],
    [
      'Previous-effect steam economy',
      result.previousEffectSteamEconomy ?? '',
      'kg water/kg steam',
    ],
    [
      'Required heating steam',
      result.requiredSteamMassFlowRate,
      'kg/h',
    ],
    [
      'Steam savings',
      result.steamSavingsMassFlowRate,
      'kg/h',
    ],
    [
      'Steam reduction',
      result.steamReductionPercent,
      '%',
    ],
    [
      'Latent-heat amplification factor',
      result.latentHeatAmplificationFactor,
      '-',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
