export interface HumidificationPsychrometricsInput {
  dryAirMassFlowRate: number
  dryBulbTemperatureCelsius: number
  totalPressureKPa: number
  inletRelativeHumidity: number
  outletRelativeHumidity: number
}

export interface HumidificationPsychrometricsResult {
  saturationVaporPressureKPa: number
  inletVaporPressureKPa: number
  outletVaporPressureKPa: number
  inletHumidityRatio: number
  outletHumidityRatio: number
  saturationHumidityRatio: number
  signedWaterTransferRate: number
  waterTransferMagnitude: number
  inletDewPointCelsius: number | null
  outletDewPointCelsius: number | null
  inletHumidEnthalpy: number
  outletHumidEnthalpy: number
  signedIsothermalHeatDuty: number
  directionDescription: string
  modelName: string
}
