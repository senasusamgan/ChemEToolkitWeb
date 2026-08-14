export interface TrapezoidalChannelUpstreamStandardStepProfileInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  downstreamControlDepth: number

  upstreamReachLength: number

  numberOfSteps: number

  fluidDensity: number
}

export interface TrapezoidalChannelUpstreamStandardStepProfilePoint {
  stationIndex: number

  distanceFromUpstream: number

  distanceFromDownstream: number

  flowDepth: number

  flowArea: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number

  localDepthGradient: number

  cumulativeFrictionHeadLoss: number
}

export interface TrapezoidalChannelUpstreamStandardStepProfileResult {
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

  numberOfSteps: number

  stepLength: number

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

  normalDepthSolverIterations: number

  profilePoints:
    TrapezoidalChannelUpstreamStandardStepProfilePoint[]

  modelName: string

  limitationDescription: string
}
