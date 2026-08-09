import type {
  EvaporatorSteamRequirementInput,
  EvaporatorSteamRequirementResult,
} from '../evaporator-steam-requirement-economy/types.ts'

export interface MultipleEffectEvaporatorSteamEconomyInput
  extends EvaporatorSteamRequirementInput {
  effectCount: number
  vaporReuseEfficiency: number
}

export interface MultipleEffectEvaporatorSteamEconomyResult
  extends EvaporatorSteamRequirementResult {
  effectCount: number
  vaporReuseEfficiency: number

  latentHeatAmplificationFactor: number
  equivalentVaporizationLatentHeat: number

  actualEvaporationHeatDuty: number
  effectiveEvaporationHeatDuty: number

  singleEffectRequiredSteamMassFlowRate: number

  steamSavingsMassFlowRate: number
  steamReductionPercent: number

  idealizedEffectUtilizationPercent: number
}
