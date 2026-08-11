export interface TrapezoidalChannelChezyFlowInput {
  bottomWidth: number

  flowDepth: number

  sideSlopeHorizontalPerVertical: number

  channelSlope: number

  chezyCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalChannelChezyFlowResult {
  bottomWidth: number

  flowDepth: number

  sideSlopeHorizontalPerVertical: number

  channelSlope: number

  chezyCoefficient: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour: number

  massFlowRate: number

  froudeNumber: number

  flowRegime: string

  boundaryShearStress: number

  specificEnergy: number

  equivalentManningRoughness: number

  reconstructedManningVelocity: number

  reconstructedManningFlowRate: number

  flowClosureResidual: number

  hydraulicPowerDissipationPerLength: number

  modelName: string

  limitationDescription: string
}
