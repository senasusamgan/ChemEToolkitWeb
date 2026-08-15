export interface PartiallyFullCircularChannelAdaptiveStandardStepProfileInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  signedProfileLength: number

  initialReachLength: number

  minimumReachLength: number

  maximumReachLength: number

  absoluteTolerance: number

  relativeTolerance: number
}


export interface PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint {
  index: number

  distance: number

  flowDepth: number

  bedElevation: number

  waterSurfaceElevation: number

  meanVelocity: number

  froudeNumber: number

  frictionSlope: number

  specificEnergy: number

  totalHead: number

  acceptedReachLength: number

  localErrorEstimate: number

  errorRatio: number

  trialRootIterations: number

  rootCandidatesFound: number
}


export interface PartiallyFullCircularChannelAdaptiveStandardStepProfileResult {
  initialState:
    PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint

  finalState:
    PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint

  profilePoints:
    PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint[]

  signedProfileLength: number

  profileDirection: string

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

  totalDepthChange: number

  minimumDepth: number

  maximumDepth: number

  waterSurfaceElevationChange: number

  signedFrictionHeadChange: number

  frictionHeadLossMagnitude: number

  totalHeadChange: number

  energyClosureResidual: number

  modelName: string

  limitationDescription: string
}
