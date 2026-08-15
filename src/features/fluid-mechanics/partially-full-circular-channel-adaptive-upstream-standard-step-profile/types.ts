export interface PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  downstreamBoundaryDepth: number

  upstreamProfileLength: number

  initialReachLength: number

  minimumReachLength: number

  maximumReachLength: number

  absoluteTolerance: number

  relativeTolerance: number
}


export interface PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfilePoint {
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

  acceptedReachLength: number

  localErrorEstimate: number

  errorRatio: number

  trialRootIterations: number
}


export interface PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileResult {
  downstreamBoundary:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfilePoint

  upstreamEndpoint:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfilePoint

  profilePoints:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfilePoint[]

  upstreamProfileLength: number

  criticalDepth: number

  flowRegime: string

  acceptedReaches: number

  rejectedTrials: number

  attemptedTrials: number

  completedStandardStepSolves: number

  totalRootIterations: number

  minimumAcceptedReachLength: number

  maximumAcceptedReachLength: number

  meanAcceptedReachLength: number

  maximumAcceptedErrorRatio: number

  upstreamDepthChange: number

  minimumDepth: number

  maximumDepth: number

  bedRiseToUpstreamEndpoint: number

  waterSurfaceElevationChange: number

  frictionHeadLossMagnitude: number

  totalHeadRiseMovingUpstream: number

  energyClosureResidual: number

  modelName: string

  limitationDescription: string
}
