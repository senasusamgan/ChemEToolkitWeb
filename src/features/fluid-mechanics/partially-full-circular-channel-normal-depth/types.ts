export interface PartiallyFullCircularChannelNormalDepthInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  fluidDensity: number
}

export interface PartiallyFullCircularChannelNormalDepthSolution {
  flowDepth: number

  depthRatio: number

  centralAngleDegrees: number

  flowArea: number

  wettedPerimeter: number

  topWidth: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  flowRegime: string

  averageBoundaryShearStress: number

  hydraulicPowerDissipationPerUnitLength: number
}

export interface PartiallyFullCircularChannelNormalDepthResult {
  solutionMultiplicity: string

  shallowSolution:
    PartiallyFullCircularChannelNormalDepthSolution

  deepSolution:
    PartiallyFullCircularChannelNormalDepthSolution | null

  fullFlowCapacity: number

  maximumPartialFlowCapacity: number

  maximumCapacityDepth: number

  maximumCapacityDepthRatio: number

  maximumCapacityRatioToFull: number

  requestedFlowToFullCapacityRatio: number

  requestedFlowToMaximumCapacityRatio: number

  maximumCapacityMargin: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
