export type OpenChannelFlowRegime =
  | 'subcritical'
  | 'critical'
  | 'supercritical'

export interface TrapezoidalChannelManningFlowInput {
  bottomWidth: number

  flowDepth: number

  sideSlopeHorizontalPerVertical: number

  channelSlope: number

  manningRoughness: number

  fluidDensity: number
}

export interface TrapezoidalChannelManningFlowResult {
  bottomWidth: number

  flowDepth: number

  sideSlopeHorizontalPerVertical: number

  channelSlope: number

  manningRoughness: number

  flowArea: number

  wettedPerimeter: number

  hydraulicRadius: number

  topWidth: number

  hydraulicDepth: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  meanVelocity: number

  froudeNumber: number

  flowRegime: OpenChannelFlowRegime

  boundaryShearStress: number

  velocityHead: number

  specificEnergy: number

  recoveredManningRoughness: number

  manningClosureResidual: number

  modelName: string

  limitationDescription: string
}
