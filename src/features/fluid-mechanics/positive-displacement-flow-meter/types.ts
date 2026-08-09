export type PositiveDisplacementFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface PositiveDisplacementFlowMeterInput {
  pipeDiameter: number

  displacementPerCycle: number

  rotationalSpeedRpm: number

  volumetricEfficiency: number

  fluidDensity: number

  dynamicViscosity: number
}

export interface PositiveDisplacementFlowMeterResult {
  pipeDiameter: number

  displacementPerCycle: number

  rotationalSpeedRpm: number

  cycleFrequency: number

  volumetricEfficiency: number

  pipeCrossSectionalArea: number

  idealVolumetricFlowRate: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  slipVolumetricFlowRate: number

  slipPercentage: number

  fluidVelocity: number

  reynoldsNumber: number

  flowRegime: PositiveDisplacementFlowRegime

  recoveredDisplacementPerCycle: number

  displacementClosureResidual: number

  modelName: string

  limitationDescription: string
}
