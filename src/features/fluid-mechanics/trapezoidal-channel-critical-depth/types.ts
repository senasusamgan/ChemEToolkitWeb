export interface TrapezoidalChannelCriticalDepthInput {
  bottomWidth: number

  volumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  fluidDensity: number
}

export interface TrapezoidalChannelCriticalDepthResult {
  bottomWidth: number

  volumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  criticalDepth: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  criticalVelocity: number

  gravityWaveCelerity: number

  froudeNumber: number

  velocityHead: number

  specificEnergy: number

  specificEnergyToDepthRatio: number

  reconstructedVolumetricFlowRate: number

  dischargeResidual: number

  relativeDischargeResidual: number

  massFlowRate: number

  solverIterations: number

  modelName: string

  limitationDescription: string
}
