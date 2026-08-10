export type NormalDepthFlowRegime =
  | 'subcritical'
  | 'critical'
  | 'supercritical'

export interface TrapezoidalChannelNormalDepthInput {
  bottomWidth: number

  targetVolumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  channelSlope: number

  manningRoughness: number

  fluidDensity: number
}

export interface TrapezoidalChannelNormalDepthResult {
  bottomWidth: number

  targetVolumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  channelSlope: number

  manningRoughness: number

  normalDepth: number

  calculatedVolumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  flowArea: number

  wettedPerimeter: number

  hydraulicRadius: number

  topWidth: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  flowRegime: NormalDepthFlowRegime

  boundaryShearStress: number

  velocityHead: number

  specificEnergy: number

  dischargeResidual: number

  relativeDischargeResidual: number

  solverIterations: number

  modelName: string

  limitationDescription: string
}
