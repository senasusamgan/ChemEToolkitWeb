export interface TrapezoidalChannelGvfProfileRk4Input {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  downstreamReachLength: number

  integrationSteps: number

  fluidDensity: number
}

export interface TrapezoidalChannelGvfProfilePoint {
  distance: number

  flowDepth: number

  froudeNumber: number

  frictionSlope: number

  specificEnergy: number

  depthGradient: number
}

export interface TrapezoidalChannelGvfProfileRk4Result {
  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  startProfileClassification: string

  endProfileClassification: string

  initialFlowDepth: number

  finalFlowDepth: number

  depthChange: number

  downstreamReachLength: number

  integrationSteps: number

  integrationStepLength: number

  startFlowArea: number

  finalFlowArea: number

  startHydraulicRadius: number

  finalHydraulicRadius: number

  startVelocity: number

  finalVelocity: number

  startFroudeNumber: number

  finalFroudeNumber: number

  startFrictionSlope: number

  finalFrictionSlope: number

  startSpecificEnergy: number

  finalSpecificEnergy: number

  integratedFrictionHeadLoss: number

  averageFrictionSlope: number

  bedElevationChange: number

  waterSurfaceElevationChange: number

  energyGradeLineChange: number

  energyClosureResidual: number

  minimumFlowDepth: number

  maximumFlowDepth: number

  maximumAbsoluteDepthGradient: number

  hydraulicPowerDissipated: number

  massFlowRate: number

  profilePoints:
    TrapezoidalChannelGvfProfilePoint[]

  modelName: string

  limitationDescription: string
}
