export interface PartiallyFullCircularChannelStandardStepProfileInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  signedProfileLength: number

  maximumReachLength: number
}


export interface PartiallyFullCircularChannelStandardStepProfilePoint {
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

  segmentLength: number

  segmentDepthChange: number

  segmentFrictionHeadChange: number

  segmentEnergyResidual: number

  rootIterations: number

  rootCandidatesFound: number
}


export interface PartiallyFullCircularChannelStandardStepProfileResult {
  initialState:
    PartiallyFullCircularChannelStandardStepProfilePoint

  finalState:
    PartiallyFullCircularChannelStandardStepProfilePoint

  profilePoints:
    PartiallyFullCircularChannelStandardStepProfilePoint[]

  signedProfileLength: number

  profileDirection: string

  numberOfReaches: number

  actualReachLength: number

  criticalDepth: number

  flowRegime: string

  totalDepthChange: number

  minimumDepth: number

  maximumDepth: number

  waterSurfaceElevationChange: number

  signedFrictionHeadChange: number

  frictionHeadLossMagnitude: number

  totalHeadChange: number

  cumulativeEnergyResidual: number

  maximumSegmentEnergyResidual: number

  totalRootIterations: number

  maximumRootCandidates: number

  modelName: string

  limitationDescription: string
}
