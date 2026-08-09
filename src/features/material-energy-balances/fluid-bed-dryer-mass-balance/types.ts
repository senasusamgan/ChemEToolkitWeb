export interface FluidBedDryerMassBalanceInput {
  wetFeedMassFlowRate: number
  inletMoistureWetBasis: number
  outletMoistureWetBasis: number
  dryAirMassFlowRate: number
  inletAirHumidityRatio: number
}

export interface FluidBedDryerMassBalanceResult {
  modelName: string
  limitationDescription: string
  drySolidMassFlowRate: number
  inletWaterMassFlowRate: number
  dryProductMassFlowRate: number
  outletProductWaterMassFlowRate: number
  evaporatedWaterMassFlowRate: number
  inletWetAirMassFlowRate: number
  outletAirHumidityRatio: number
  outletWetAirMassFlowRate: number
  totalMassIn: number
  totalMassOut: number
  massBalanceClosureError: number
  massBalanceClosurePercent: number
  waterRemovalPercent: number
}
