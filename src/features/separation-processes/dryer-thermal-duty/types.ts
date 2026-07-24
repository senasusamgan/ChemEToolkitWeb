export interface DryerThermalDutyInput {
  wetFeedMassFlowRate: number
  initialMoistureDryBasis: number
  finalMoistureDryBasis: number
  inletTemperature: number
  outletTemperature: number
  drySolidHeatCapacity: number
  liquidWaterHeatCapacity: number
  latentHeatOfVaporization: number
  heatLossFraction: number
}

export interface DryerThermalDutyResult {
  drySolidFlowRate: number
  initialWaterFlowRate: number
  finalWaterFlowRate: number
  waterEvaporationRate: number
  drySolidSensibleDuty: number
  waterSensibleDuty: number
  latentDuty: number
  processDuty: number
  requiredHeaterDuty: number
  specificEnergyPerWaterRemoved: number
  modelName: string
  limitationDescription: string
}
