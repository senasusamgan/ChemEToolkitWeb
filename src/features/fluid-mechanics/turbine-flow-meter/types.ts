export type TurbineFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface TurbineFlowMeterInput {
  pipeDiameter: number

  pulseFrequency: number

  meterKFactor: number

  calibrationFactor: number

  fluidDensity: number

  dynamicViscosity: number
}

export interface TurbineFlowMeterResult {
  pipeDiameter: number

  pipeCrossSectionalArea: number

  pulseFrequency: number

  meterKFactor: number

  calibrationFactor: number

  rawVolumetricFlowRate: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  fluidVelocity: number

  reynoldsNumber: number

  flowRegime: TurbineFlowRegime

  pulsePeriod: number

  pulsesPerMinute: number

  pulsesPerHour: number

  reconstructedPulseFrequency: number

  frequencyClosureResidual: number

  modelName: string

  limitationDescription: string
}
