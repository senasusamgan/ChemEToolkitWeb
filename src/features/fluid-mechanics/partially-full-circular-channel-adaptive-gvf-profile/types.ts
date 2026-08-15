export interface PartiallyFullCircularChannelAdaptiveGvfProfileInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  integrationDistance: number

  initialStepLength: number

  minimumStepLength: number

  maximumStepLength: number

  absoluteTolerance: number

  relativeTolerance: number
}


export interface PartiallyFullCircularChannelAdaptiveGvfProfilePoint {
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

  depthGradient: number

  acceptedStepLength: number

  localErrorEstimate: number

  errorRatio: number
}


export interface PartiallyFullCircularChannelAdaptiveGvfProfileResult {
  initialState:
    PartiallyFullCircularChannelAdaptiveGvfProfilePoint

  finalState:
    PartiallyFullCircularChannelAdaptiveGvfProfilePoint

  profilePoints:
    PartiallyFullCircularChannelAdaptiveGvfProfilePoint[]

  integrationDistance: number

  integrationDirection: string

  criticalDepth: number

  flowRegime: string

  acceptedSteps: number

  rejectedSteps: number

  attemptedSteps: number

  functionEvaluations: number

  minimumAcceptedStepLength: number

  maximumAcceptedStepLength: number

  meanAcceptedStepLength: number

  maximumAcceptedErrorRatio: number

  initialDepthGradient: number

  finalDepthGradient: number

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
