export type VortexFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface VortexSheddingFlowMeterInput {
  pipeDiameter: number

  bluffBodyWidth: number

  sheddingFrequency: number

  strouhalNumber: number

  fluidDensity: number

  dynamicViscosity: number
}

export interface VortexSheddingFlowMeterResult {
  pipeDiameter: number

  bluffBodyWidth: number

  sheddingFrequency: number

  strouhalNumber: number

  pipeCrossSectionalArea: number

  fluidVelocity: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  reynoldsNumber: number

  flowRegime: VortexFlowRegime

  vortexSheddingPeriod: number

  vortexSpacing: number

  dynamicPressure: number

  recoveredStrouhalNumber: number

  strouhalResidual: number

  modelName: string

  limitationDescription: string
}
