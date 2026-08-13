export interface TrapezoidalChannelAdaptiveStandardStepProfileInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  totalReachLength: number

  maximumStepLength: number

  maximumDepthChangePerStep: number

  minimumStepLength: number

  fluidDensity: number
}

export interface TrapezoidalChannelAdaptiveStandardStepProfilePoint {
  stepIndex: number

  distance: number

  acceptedStepLength: number

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

export interface TrapezoidalChannelAdaptiveStandardStepProfileResult {
  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  startProfileClassification: string

  endProfileClassification: string

  profileTrend: string

  initialFlowDepth: number

  finalFlowDepth: number

  totalDepthChange: number

  minimumFlowDepth: number

  maximumFlowDepth: number

  totalReachLength: number

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

  startFlowArea: number

  finalFlowArea: number

  startVelocity: number

  finalVelocity: number

  startFroudeNumber: number

  finalFroudeNumber: number

  startSpecificEnergy: number

  finalSpecificEnergy: number

  startFrictionSlope: number

  finalFrictionSlope: number

  totalFrictionHeadLoss: number

  averageFrictionSlope: number

  bedElevationChange: number

  waterSurfaceElevationChange: number

  energyGradeLineChange: number

  cumulativeSegmentEnergyResidual: number

  totalEnergyClosureResidual: number

  maximumAbsoluteDepthGradient: number

  hydraulicPowerDissipated: number

  massFlowRate: number

  cumulativeDepthSolverIterations: number

  profilePoints:
    TrapezoidalChannelAdaptiveStandardStepProfilePoint[]

  modelName: string

  limitationDescription: string
}
