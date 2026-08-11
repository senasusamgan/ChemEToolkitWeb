export interface TrapezoidalChannelDirectStepInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  startDepth: number

  endDepth: number

  fluidDensity: number
}

export interface TrapezoidalChannelDirectStepResult {
  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  profileClassification: string

  startFlowArea: number

  endFlowArea: number

  startHydraulicRadius: number

  endHydraulicRadius: number

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

  slopeDifference: number

  signedDistance: number

  reachLength: number

  reachDirection: string

  bedElevationChange: number

  waterSurfaceElevationChange: number

  energyGradeLineChange: number

  signedFrictionHeadChange: number

  frictionHeadLoss: number

  energyClosureResidual: number

  hydraulicPowerDissipated: number

  massFlowRate: number

  normalDepthSolverIterations: number

  modelName: string

  limitationDescription: string
}
