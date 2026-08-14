export interface TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  downstreamControlDepth: number

  upstreamReachLength: number

  maximumStepLength: number

  maximumDepthChangePerStep: number

  minimumStepLength: number

  fluidDensity: number
}

export interface TrapezoidalChannelAdaptiveUpstreamStandardStepProfilePoint {
  stationIndex: number

  distanceFromUpstream: number

  distanceFromDownstream: number

  acceptedStepLengthFromPrevious: number

  flowDepth: number

  depthChangeFromPrevious: number

  flowArea: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number

  localDepthGradient: number

  cumulativeFrictionHeadLoss: number
}

export interface TrapezoidalChannelAdaptiveUpstreamStandardStepProfileResult {
  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  profileClassification: string

  profileTrendDownstream: string

  upstreamBoundaryDepth: number

  downstreamControlDepth: number

  downstreamDepthChange: number

  minimumFlowDepth: number

  maximumFlowDepth: number

  upstreamReachLength: number

  requestedMaximumStepLength: number

  requestedMaximumDepthChangePerStep: number

  configuredMinimumStepLength: number

  acceptedStepCount: number

  attemptedStepCount: number

  adaptiveReductionCount: number

  minimumAcceptedStepLength: number

  maximumAcceptedStepLength: number

  averageAcceptedStepLength: number

  maximumDepthChangeObserved: number

  upstreamFlowArea: number

  downstreamFlowArea: number

  upstreamVelocity: number

  downstreamVelocity: number

  upstreamFroudeNumber: number

  downstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  downstreamSpecificEnergy: number

  upstreamFrictionSlope: number

  downstreamFrictionSlope: number

  totalFrictionHeadLoss: number

  averageFrictionSlope: number

  bedElevationChangeDownstream: number

  waterSurfaceElevationChangeDownstream: number

  energyGradeLineChangeDownstream: number

  cumulativeSegmentEnergyResidual: number

  totalEnergyClosureResidual: number

  maximumAbsoluteDepthGradient: number

  hydraulicPowerDissipated: number

  massFlowRate: number

  cumulativeDepthSolverIterations: number

  profilePoints:
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfilePoint[]

  modelName: string

  limitationDescription: string
}
