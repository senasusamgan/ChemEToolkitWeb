export interface PartiallyFullCircularChannelStandardStepInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  signedReachLength: number
}


export interface PartiallyFullCircularChannelStandardStepState {
  flowDepth: number

  depthRatio: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  frictionSlope: number

  specificEnergy: number
}


export interface PartiallyFullCircularChannelStandardStepResult {
  initialState:
    PartiallyFullCircularChannelStandardStepState

  solvedState:
    PartiallyFullCircularChannelStandardStepState

  signedReachLength: number

  reachDirection: string

  criticalDepth: number

  flowRegime: string

  localDepthGradient: number

  localLinearDepthPrediction: number

  solvedDepthChange: number

  averageFrictionSlope: number

  signedFrictionHeadChange: number

  frictionHeadLossMagnitude: number

  bedElevationChange: number

  waterSurfaceElevationChange: number

  totalHeadChange: number

  energyResidual: number

  equivalentDirectStepDistance: number

  distanceClosureResidual: number

  rootCandidatesFound: number

  directionalCandidatesFound: number

  rootIterations: number

  modelName: string

  limitationDescription: string
}
