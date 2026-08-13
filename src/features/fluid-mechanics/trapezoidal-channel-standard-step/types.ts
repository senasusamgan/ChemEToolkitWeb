export interface TrapezoidalChannelStandardStepInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  startDepth: number

  downstreamReachLength: number

  fluidDensity: number
}

export interface TrapezoidalChannelStandardStepResult {
  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  profileClassification: string

  profileTrend: string

  startDepth: number

  endDepth: number

  depthChange: number

  startFlowArea: number

  endFlowArea: number

  startTopWidth: number

  endTopWidth: number

  startHydraulicRadius: number

  endHydraulicRadius: number

  startHydraulicDepth: number

  endHydraulicDepth: number

  startVelocity: number

  endVelocity: number

  startFroudeNumber: number

  endFroudeNumber: number

  startSpecificEnergy: number

  endSpecificEnergy: number

  specificEnergyChange: number

  startFrictionSlope: number

  endFrictionSlope: number

  averageFrictionSlope: number

  localGvfDepthGradientAtStart: number

  localGvfDepthGradientAtEnd: number

  downstreamReachLength: number

  equivalentDirectStepDistance: number

  distanceClosureResidual: number

  bedElevationChange: number

  waterSurfaceElevationChange: number

  frictionHeadLoss: number

  energyGradeLineChange: number

  standardStepEnergyResidual: number

  hydraulicPowerDissipated: number

  massFlowRate: number

  normalDepthSolverIterations: number

  depthSolverIterations: number

  modelName: string

  limitationDescription: string
}
