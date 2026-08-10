export interface TrapezoidalChannelCriticalSlopeInput {
  bottomWidth: number

  volumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  manningRoughness: number

  fluidDensity: number
}

export interface TrapezoidalChannelCriticalSlopeResult {
  bottomWidth: number

  volumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  manningRoughness: number

  criticalDepth: number

  criticalSlope: number

  criticalSlopePercent: number

  criticalSlopeAngleDegrees: number

  bedDropPer100m: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  criticalVelocity: number

  froudeNumber: number

  criticalSpecificEnergy: number

  manningConveyance: number

  reconstructedVolumetricFlowRate: number

  dischargeResidual: number

  relativeDischargeResidual: number

  boundaryShearStress: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
