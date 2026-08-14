export interface PartiallyFullCircularChannelCriticalDepthInput {
  pipeDiameter: number

  volumetricFlowRate: number

  fluidDensity: number
}

export interface PartiallyFullCircularChannelCriticalDepthResult {
  criticalDepth: number

  criticalDepthRatio: number

  radius: number

  centralAngleRadians: number

  centralAngleDegrees: number

  criticalFlowArea: number

  criticalTopWidth: number

  criticalWettedPerimeter: number

  criticalHydraulicRadius: number

  criticalHydraulicDepth: number

  criticalVelocity: number

  criticalWaveCelerity: number

  criticalFroudeNumber: number

  criticalSpecificEnergy: number

  velocityHead: number

  dischargePerUnitTopWidth: number

  criticalConditionResidual: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
