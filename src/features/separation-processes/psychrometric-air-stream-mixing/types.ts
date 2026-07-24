export interface PsychrometricAirStreamMixingInput {
  dryAirFlowRate1: number
  dryBulbTemperature1: number
  humidityRatio1: number
  dryAirFlowRate2: number
  dryBulbTemperature2: number
  humidityRatio2: number
}

export interface PsychrometricAirStreamMixingResult {
  totalDryAirFlowRate: number
  mixedHumidityRatio: number
  enthalpy1: number
  enthalpy2: number
  mixedEnthalpy: number
  mixedDryBulbTemperature: number
  waterVaporFlowRate: number
  energyBalanceResidual: number
  modelName: string
  limitationDescription: string
}
