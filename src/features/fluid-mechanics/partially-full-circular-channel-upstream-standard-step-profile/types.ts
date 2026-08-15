export interface PartiallyFullCircularChannelUpstreamStandardStepProfileInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  downstreamBoundaryDepth: number

  upstreamProfileLength: number

  maximumReachLength: number
}


export interface PartiallyFullCircularChannelUpstreamStandardStepProfilePoint {
  index: number

  upstreamDistance: number

  signedDistanceFromBoundary: number

  flowDepth: number

  bedElevationRelativeToBoundary: number

  waterSurfaceElevationRelativeToBoundary: number

  meanVelocity: number

  froudeNumber: number

  frictionSlope: number

  specificEnergy: number

  totalHeadRelativeToBoundary: number

  reachLength: number

  rootIterations: number
}


export interface PartiallyFullCircularChannelUpstreamStandardStepProfileResult {
  downstreamBoundary:
    PartiallyFullCircularChannelUpstreamStandardStepProfilePoint

  upstreamEndpoint:
    PartiallyFullCircularChannelUpstreamStandardStepProfilePoint

  profilePoints:
    PartiallyFullCircularChannelUpstreamStandardStepProfilePoint[]

  upstreamProfileLength: number

  numberOfReaches: number

  actualReachLength: number

  criticalDepth: number

  flowRegime: string

  upstreamDepthChange: number

  minimumDepth: number

  maximumDepth: number

  bedRiseToUpstreamEndpoint: number

  waterSurfaceElevationChange: number

  frictionHeadLossMagnitude: number

  totalHeadRiseMovingUpstream: number

  energyClosureResidual: number

  totalRootIterations: number

  modelName: string

  limitationDescription: string
}
