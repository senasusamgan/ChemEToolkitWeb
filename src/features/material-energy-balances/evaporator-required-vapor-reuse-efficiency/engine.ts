import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
  calculateMultipleEffectEvaporatorSteamEconomy,
} from '../multiple-effect-evaporator-steam-economy/engine.ts'

import type {
  EvaporatorRequiredVaporReuseEfficiencyInput,
  EvaporatorRequiredVaporReuseEfficiencyResult,
} from './types.ts'

export {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
}

export const EVAPORATOR_REQUIRED_VAPOR_REUSE_EFFICIENCY_ENGINE_VERSION =
  'evaporator-required-vapor-reuse-efficiency-v1'

export type EvaporatorRequiredVaporReuseEfficiencyErrorCode =
  | 'INVALID_TARGET_STEAM_ECONOMY'
  | 'TARGET_ALREADY_MET_AT_MINIMUM_REUSE'
  | 'TARGET_NOT_ACHIEVABLE'
  | 'NUMERICAL_FAILURE'

export class EvaporatorRequiredVaporReuseEfficiencyError
  extends Error {
  readonly code:
    EvaporatorRequiredVaporReuseEfficiencyErrorCode

  constructor(
    code:
      EvaporatorRequiredVaporReuseEfficiencyErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'EvaporatorRequiredVaporReuseEfficiencyError'

    this.code =
      code
  }
}

const MINIMUM_SEARCH_EFFICIENCY =
  1e-9

const MAXIMUM_SEARCH_EFFICIENCY =
  1

const BISECTION_ITERATIONS =
  80

export function calculateEvaporatorRequiredVaporReuseEfficiency(
  input:
    EvaporatorRequiredVaporReuseEfficiencyInput,
): EvaporatorRequiredVaporReuseEfficiencyResult {
  if (
    !Number.isFinite(
      input.targetSteamEconomy,
    ) ||
    input.targetSteamEconomy <= 0
  ) {
    throw new EvaporatorRequiredVaporReuseEfficiencyError(
      'INVALID_TARGET_STEAM_ECONOMY',
      'Target steam economy must be a positive finite value.',
    )
  }

  /*
   Calculator 398 remains the process model.

   Only vapor-reuse efficiency is changed.

   eta is solved using a bounded bisection
   search between approximately zero and one.
  */

  const minimumReuse =
    calculateMultipleEffectEvaporatorSteamEconomy({
      ...input,

      vaporReuseEfficiency:
        MINIMUM_SEARCH_EFFICIENCY,
    })

  const perfectReuse =
    calculateMultipleEffectEvaporatorSteamEconomy({
      ...input,

      vaporReuseEfficiency:
        MAXIMUM_SEARCH_EFFICIENCY,
    })

  if (
    input.targetSteamEconomy <=
    minimumReuse.steamEconomy
  ) {
    throw new EvaporatorRequiredVaporReuseEfficiencyError(
      'TARGET_ALREADY_MET_AT_MINIMUM_REUSE',
      `The target steam economy of ${input.targetSteamEconomy} is already met at the model search floor. Required reuse efficiency is effectively zero for this target.`,
    )
  }

  if (
    input.targetSteamEconomy >
    perfectReuse.steamEconomy
  ) {
    throw new EvaporatorRequiredVaporReuseEfficiencyError(
      'TARGET_NOT_ACHIEVABLE',
      `The target steam economy of ${input.targetSteamEconomy} cannot be reached with ${input.effectCount} effects even at perfect vapor reuse. Maximum calculated economy is ${perfectReuse.steamEconomy}.`,
    )
  }

  let lower =
    MINIMUM_SEARCH_EFFICIENCY

  let upper =
    MAXIMUM_SEARCH_EFFICIENCY

  for (
    let iteration = 0;
    iteration < BISECTION_ITERATIONS;
    iteration += 1
  ) {
    const midpoint =
      (
        lower +
        upper
      ) /
      2

    const candidate =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,

        vaporReuseEfficiency:
          midpoint,
      })

    if (
      candidate.steamEconomy >=
      input.targetSteamEconomy
    ) {
      upper =
        midpoint
    } else {
      lower =
        midpoint
    }
  }

  const solved =
    calculateMultipleEffectEvaporatorSteamEconomy({
      ...input,

      vaporReuseEfficiency:
        upper,
    })

  const requiredVaporReuseEfficiency =
    upper

  const requiredVaporReuseEfficiencyPercent =
    requiredVaporReuseEfficiency *
    100

  const economyMargin =
    solved.steamEconomy -
    input.targetSteamEconomy

  const values = [
    requiredVaporReuseEfficiency,
    requiredVaporReuseEfficiencyPercent,
    economyMargin,

    lower,
    upper,

    minimumReuse.steamEconomy,
    perfectReuse.steamEconomy,

    solved.steamEconomy,
    solved.requiredSteamMassFlowRate,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    requiredVaporReuseEfficiency <= 0 ||
    requiredVaporReuseEfficiency > 1 ||
    solved.steamEconomy <
      input.targetSteamEconomy
  ) {
    throw new EvaporatorRequiredVaporReuseEfficiencyError(
      'NUMERICAL_FAILURE',
      'The vapor-reuse efficiency search did not converge to a valid design point.',
    )
  }

  return {
    ...solved,

    modelName:
      'Required Vapor-Reuse Efficiency for Target Steam Economy',

    limitationDescription:
      'Inverse-design wrapper around Calculator 398. A bounded bisection search varies only vapor-reuse efficiency while the selected effect count and all evaporator operating inputs remain fixed. The underlying equivalent multiple-effect assumptions of Calculator 398 remain unchanged.',

    targetSteamEconomy:
      input.targetSteamEconomy,

    requiredVaporReuseEfficiency,
    requiredVaporReuseEfficiencyPercent,

    economyMargin,

    lowerBracketEfficiency:
      lower,

    upperBracketEfficiency:
      upper,

    minimumModeledSteamEconomy:
      minimumReuse.steamEconomy,

    maximumSteamEconomyAtPerfectReuse:
      perfectReuse.steamEconomy,

    iterationCount:
      BISECTION_ITERATIONS,
  }
}

export function createEvaporatorRequiredVaporReuseEfficiencyCsv(
  input:
    EvaporatorRequiredVaporReuseEfficiencyInput,
  result:
    EvaporatorRequiredVaporReuseEfficiencyResult,
): string {
  const rows = [
    [
      'Required Vapor-Reuse Efficiency for Target Steam Economy',
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
      'Target steam economy',
      input.targetSteamEconomy,
      'kg water/kg steam',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Required vapor-reuse efficiency',
      result.requiredVaporReuseEfficiency,
      'fraction',
    ],
    [
      'Required vapor-reuse efficiency',
      result.requiredVaporReuseEfficiencyPercent,
      '%',
    ],
    [
      'Achieved steam economy',
      result.steamEconomy,
      'kg water/kg steam',
    ],
    [
      'Economy margin',
      result.economyMargin,
      'kg water/kg steam',
    ],
    [
      'Required heating steam',
      result.requiredSteamMassFlowRate,
      'kg/h',
    ],
    [
      'Steam reduction',
      result.steamReductionPercent,
      '%',
    ],
    [
      'Maximum economy at perfect reuse',
      result.maximumSteamEconomyAtPerfectReuse,
      'kg water/kg steam',
    ],
    [
      'Iterations',
      result.iterationCount,
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
