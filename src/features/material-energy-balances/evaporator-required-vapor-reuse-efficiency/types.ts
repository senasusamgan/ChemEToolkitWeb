import type {
  MultipleEffectEvaporatorSteamEconomyInput,
  MultipleEffectEvaporatorSteamEconomyResult,
} from '../multiple-effect-evaporator-steam-economy/types.ts'

export interface EvaporatorRequiredVaporReuseEfficiencyInput
  extends Omit<
    MultipleEffectEvaporatorSteamEconomyInput,
    'vaporReuseEfficiency'
  > {
  targetSteamEconomy: number
}

export interface EvaporatorRequiredVaporReuseEfficiencyResult
  extends MultipleEffectEvaporatorSteamEconomyResult {
  targetSteamEconomy: number

  requiredVaporReuseEfficiency: number
  requiredVaporReuseEfficiencyPercent: number

  economyMargin: number

  lowerBracketEfficiency: number
  upperBracketEfficiency: number

  minimumModeledSteamEconomy: number
  maximumSteamEconomyAtPerfectReuse: number

  iterationCount: number
}
