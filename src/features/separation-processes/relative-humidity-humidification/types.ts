export interface RelativeHumidityHumidificationInput {
  dryAirFlowRate: number
  dryBulbTemperature: number
  totalPressure: number
  inletRelativeHumidity: number
  targetRelativeHumidity: number
}

export interface RelativeHumidityHumidificationResult {
  saturationVaporPressure: number
  inletVaporPartialPressure: number
  targetVaporPartialPressure: number
  inletHumidityRatio: number
  targetHumidityRatio: number
  waterAdditionRate: number
  humidityRatioIncrease: number
  modelName: string
  limitationDescription: string
}
