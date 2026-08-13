export interface TrapezoidalChannelStandardStepProfileInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  totalReachLength: number

  numberOfSteps: number

  fluidDensity: number
}

export interface TrapezoidalChannelStandardStepProfilePoint {
  stepIndex: number

  distance: number

  flowDepth: number

  flowArea: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number

  localDepthGradient: number

  cumulativeFrictionHeadLoss: number
}

export interface TrapezoidalChannelStandardStepProfileResult {
  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  startProfileClassification: string

  endProfileClassification: string

  profileTrend: string

  initialFlowDepth: number

  finalFlowDepth: number

  depthChange: number

  minimumFlowDepth: number

  maximumFlowDepth: number

  totalReachLength: number

  numberOfSteps: number

  stepLength: number

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
    TrapezoidalChannelStandardStepProfilePoint[]

  modelName: string

  limitationDescription: string
}
