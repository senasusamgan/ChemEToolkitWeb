export interface PartiallyFullCircularChannelGvfSlopeInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  flowDepth: number
}


export interface PartiallyFullCircularChannelGvfSlopeResult {
  flowDepth: number

  depthRatio: number

  centralAngleDegrees: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  velocityHead: number

  specificEnergy: number

  froudeNumber: number

  frictionSlope: number

  channelSlope: number

  slopeNumerator: number

  froudeDenominator: number

  depthGradient: number

  depthChangePer100m: number

  criticalDepth: number

  criticalSpecificEnergy: number

  criticalDepthDifference: number

  flowRegime: string

  slopeBalance: string

  localProfileTrend: string

  modelName: string

  limitationDescription: string
}
