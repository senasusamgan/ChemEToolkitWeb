import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  calculateEvaporatorSteamRequirementEconomy,
} from '../evaporator-steam-requirement-economy/engine.ts'

import type {
  MultipleEffectEvaporatorSteamEconomyInput,
  MultipleEffectEvaporatorSteamEconomyResult,
} from './types.ts'

export {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
}

export const MULTIPLE_EFFECT_EVAPORATOR_STEAM_ECONOMY_ENGINE_VERSION =
  'multiple-effect-evaporator-steam-economy-v1'

export type MultipleEffectEvaporatorSteamEconomyErrorCode =
  | 'INVALID_EFFECT_COUNT'
  | 'INVALID_VAPOR_REUSE_EFFICIENCY'
  | 'INVALID_AMPLIFICATION_FACTOR'
  | 'NUMERICAL_FAILURE'

export class MultipleEffectEvaporatorSteamEconomyError
  extends Error {
  readonly code:
    MultipleEffectEvaporatorSteamEconomyErrorCode

  constructor(
    code:
      MultipleEffectEvaporatorSteamEconomyErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MultipleEffectEvaporatorSteamEconomyError'

    this.code =
      code
  }
}

function calculateAmplificationFactor(
  effectCount: number,
  vaporReuseEfficiency: number,
): number {
  let factor =
    0

  for (
    let effectIndex = 0;
    effectIndex < effectCount;
    effectIndex += 1
  ) {
    factor +=
      vaporReuseEfficiency **
      effectIndex
  }

  return factor
}

export function calculateMultipleEffectEvaporatorSteamEconomy(
  input:
    MultipleEffectEvaporatorSteamEconomyInput,
): MultipleEffectEvaporatorSteamEconomyResult {
  if (
    !Number.isInteger(
      input.effectCount,
    ) ||
    input.effectCount < 2 ||
    input.effectCount > 10
  ) {
    throw new MultipleEffectEvaporatorSteamEconomyError(
      'INVALID_EFFECT_COUNT',
      'Effect count must be an integer between 2 and 10.',
    )
  }

  if (
    !Number.isFinite(
      input.vaporReuseEfficiency,
    ) ||
    input.vaporReuseEfficiency <= 0 ||
    input.vaporReuseEfficiency > 1
  ) {
    throw new MultipleEffectEvaporatorSteamEconomyError(
      'INVALID_VAPOR_REUSE_EFFICIENCY',
      'Vapor-reuse efficiency must satisfy 0 < eta <= 1.',
    )
  }

  const latentHeatAmplificationFactor =
    calculateAmplificationFactor(
      input.effectCount,
      input.vaporReuseEfficiency,
    )

  if (
    !Number.isFinite(
      latentHeatAmplificationFactor,
    ) ||
    latentHeatAmplificationFactor <= 1
  ) {
    throw new MultipleEffectEvaporatorSteamEconomyError(
      'INVALID_AMPLIFICATION_FACTOR',
      'The multiple-effect latent-heat amplification factor is not physically usable.',
    )
  }

  /*
   Calculator 397 remains the source of truth.

   Single-effect reference:
   normal water vaporization latent heat.

   Multiple-effect equivalent:
   the total evaporation latent requirement is divided
   by the geometric vapor-reuse amplification factor.

   A = 1 + eta + eta^2 + ... + eta^(N-1)
  */

  const singleEffect =
    calculateEvaporatorSteamRequirementEconomy(
      input,
    )

  const equivalentVaporizationLatentHeat =
    input.vaporizationLatentHeat /
    latentHeatAmplificationFactor

  const multipleEffectEquivalent =
    calculateEvaporatorSteamRequirementEconomy({
      ...input,

      vaporizationLatentHeat:
        equivalentVaporizationLatentHeat,
    })

  const actualEvaporationHeatDuty =
    singleEffect.evaporationHeatDuty

  const effectiveEvaporationHeatDuty =
    multipleEffectEquivalent.evaporationHeatDuty

  const singleEffectRequiredSteamMassFlowRate =
    singleEffect.requiredSteamMassFlowRate

  const steamSavingsMassFlowRate =
    singleEffectRequiredSteamMassFlowRate -
    multipleEffectEquivalent.requiredSteamMassFlowRate

  const steamReductionPercent =
    steamSavingsMassFlowRate /
    singleEffectRequiredSteamMassFlowRate *
    100

  const idealizedEffectUtilizationPercent =
    latentHeatAmplificationFactor /
    input.effectCount *
    100

  const values = [
    latentHeatAmplificationFactor,
    equivalentVaporizationLatentHeat,

    actualEvaporationHeatDuty,
    effectiveEvaporationHeatDuty,

    singleEffectRequiredSteamMassFlowRate,

    steamSavingsMassFlowRate,
    steamReductionPercent,

    idealizedEffectUtilizationPercent,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    multipleEffectEquivalent.requiredSteamMassFlowRate <= 0 ||
    multipleEffectEquivalent.steamEconomy <= 0 ||
    steamSavingsMassFlowRate <= 0
  ) {
    throw new MultipleEffectEvaporatorSteamEconomyError(
      'NUMERICAL_FAILURE',
      'The multiple-effect evaporator calculation did not produce finite physical results.',
    )
  }

  return {
    ...multipleEffectEquivalent,

    modelName:
      'Multiple-Effect Evaporator Steam Economy',

    limitationDescription:
      'Equivalent multiple-effect model built on Calculator 397. Vapor generated in one effect is reused by downstream effects with a specified constant reuse efficiency. The geometric latent-heat amplification factor approximates the reduction in external steam demand. Feed sensible heating remains an external first-effect load. Detailed effect-by-effect boiling-point elevation, pressure levels, area distribution and condensate flashing are not included.',

    effectCount:
      input.effectCount,

    vaporReuseEfficiency:
      input.vaporReuseEfficiency,

    latentHeatAmplificationFactor,
    equivalentVaporizationLatentHeat,

    actualEvaporationHeatDuty,
    effectiveEvaporationHeatDuty,

    singleEffectRequiredSteamMassFlowRate,

    steamSavingsMassFlowRate,
    steamReductionPercent,

    idealizedEffectUtilizationPercent,
  }
}

export function createMultipleEffectEvaporatorSteamEconomyCsv(
  input:
    MultipleEffectEvaporatorSteamEconomyInput,
  result:
    MultipleEffectEvaporatorSteamEconomyResult,
): string {
  const rows = [
    [
      'Multiple-Effect Evaporator Steam Economy',
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
      'Number of effects',
      input.effectCount,
      '-',
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
      'Evaporated water',
      result.evaporatedWaterMassFlowRate,
      'kg/h',
    ],
    [
      'Multiple-effect steam requirement',
      result.requiredSteamMassFlowRate,
      'kg/h',
    ],
    [
      'Single-effect steam requirement',
      result.singleEffectRequiredSteamMassFlowRate,
      'kg/h',
    ],
    [
      'Steam economy',
      result.steamEconomy,
      'kg water/kg steam',
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
    [
      'Idealized effect utilization',
      result.idealizedEffectUtilizationPercent,
      '%',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
