export type PitotFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface PitotTubeVelocityFlowInput {
  pipeDiameter: number

  differentialPressure: number

  fluidDensity: number

  dynamicViscosity: number

  pitotCoefficient: number
}

export interface PitotTubeVelocityFlowResult {
  pipeDiameter: number

  pipeCrossSectionalArea: number

  differentialPressure: number

  pitotCoefficient: number

  idealVelocity: number

  correctedVelocity: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  reynoldsNumber: number

  flowRegime: PitotFlowRegime

  measuredVelocityHead: number

  correctedVelocityHead: number

  correctedDynamicPressure: number

  modelName: string

  limitationDescription: string
}
