import type {
  MultipleEffectEvaporatorSteamEconomyInput,
  MultipleEffectEvaporatorSteamEconomyResult,
} from '../multiple-effect-evaporator-steam-economy/types.ts'

export interface EvaporatorTargetSteamEconomyEffectCountInput
  extends Omit<
    MultipleEffectEvaporatorSteamEconomyInput,
    'effectCount'
  > {
  targetSteamEconomy: number
}

export interface EvaporatorTargetSteamEconomyEffectCountResult
  extends MultipleEffectEvaporatorSteamEconomyResult {
  targetSteamEconomy: number
  requiredEffectCount: number

  previousEffectSteamEconomy:
    number | null

  economyMargin: number

  searchLowerEffectCount: number
  searchUpperEffectCount: number
}
