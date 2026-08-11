export interface TrapezoidalChannelGvfSlopeInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  flowDepth: number

  fluidDensity: number
}

export interface TrapezoidalChannelGvfSlopeResult {
  bottomWidth: number

  flowDepth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  flowRegime: string

  specificEnergy: number

  frictionSlope: number

  criticalDepth: number

  normalDepth: number

  channelSlopeClass: string

  profileClassification: string

  froudeDenominator: number

  energyGradient: number

  depthGradient: number

  waterSurfaceElevationGradient: number

  energyGradeLineGradient: number

  depthChangePer100m: number

  waterSurfaceElevationChangePer100m: number

  bedElevationChangePer100m: number

  frictionHeadLossPer100m: number

  energyGradeLineChangePer100m: number

  differentialEquationResidual: number

  boundaryShearStress: number

  hydraulicPowerDissipationPerLength: number

  massFlowRate: number

  normalDepthSolverIterations: number

  modelName: string

  limitationDescription: string
}
