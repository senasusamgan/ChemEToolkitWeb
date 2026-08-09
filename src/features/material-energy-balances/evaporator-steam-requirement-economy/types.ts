import type {
  EvaporatorMassCoreInput,
  EvaporatorMassCoreResult,
} from '../evaporator/shared/evaporatorMassCore.ts'

export interface EvaporatorSteamRequirementInput
  extends EvaporatorMassCoreInput {
  feedTemperature: number
  boilingTemperature: number

  feedHeatCapacity: number

  vaporizationLatentHeat: number
  steamLatentHeat: number

  heatLossFraction: number
}

export interface EvaporatorSteamRequirementResult
  extends EvaporatorMassCoreResult {
  modelName: string
  limitationDescription: string

  sensibleHeatDuty: number
  evaporationHeatDuty: number
  usefulProcessHeatDuty: number

  requiredSteamHeatRate: number
  heatLossDuty: number

  requiredSteamMassFlowRate: number

  steamEconomy: number
  specificSteamConsumption: number

  energyBalanceClosureError: number
  energyBalanceClosurePercent: number
}
