export interface PartiallyFullCircularChannelCriticalSlopeInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  fluidDensity: number
}

export interface PartiallyFullCircularChannelCriticalSlopeResult {
  criticalSlope: number

  criticalSlopePercent: number

  criticalSlopePerMille: number

  criticalDepth: number

  criticalDepthRatio: number

  criticalSpecificEnergy: number

  criticalFlowArea: number

  criticalTopWidth: number

  criticalWettedPerimeter: number

  criticalHydraulicRadius: number

  criticalHydraulicDepth: number

  criticalVelocity: number

  criticalWaveCelerity: number

  criticalFroudeNumber: number

  manningConveyance: number

  fullFlowCapacityAtCriticalSlope: number

  flowToFullCapacityRatio: number

  averageBoundaryShearStress: number

  hydraulicPowerDissipationPerUnitLength: number

  massFlowRate: number

  slopeClassificationRule: string

  modelName: string

  limitationDescription: string
}
