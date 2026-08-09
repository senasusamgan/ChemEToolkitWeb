export type ElectromagneticFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface ElectromagneticFlowMeterInput {
  pipeDiameter: number

  electrodeSpacing: number

  magneticFluxDensity: number

  inducedVoltageMillivolts: number

  calibrationFactor: number

  fluidDensity: number

  dynamicViscosity: number
}

export interface ElectromagneticFlowMeterResult {
  pipeDiameter: number

  electrodeSpacing: number

  magneticFluxDensity: number

  inducedVoltage: number

  inducedVoltageMillivolts: number

  calibrationFactor: number

  pipeCrossSectionalArea: number

  fluidVelocity: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  reynoldsNumber: number

  flowRegime: ElectromagneticFlowRegime

  dynamicPressure: number

  reconstructedVoltage: number

  reconstructedVoltageMillivolts: number

  voltageClosureResidual: number

  modelName: string

  limitationDescription: string
}
