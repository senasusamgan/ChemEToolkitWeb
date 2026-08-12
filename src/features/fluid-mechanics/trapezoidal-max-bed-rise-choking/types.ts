export interface TrapezoidalMaximumBedRiseBeforeChokingInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  fluidDensity: number
}

export interface TrapezoidalMaximumBedRiseBeforeChokingResult {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamVelocityHead: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  criticalDepth: number

  criticalFlowArea: number

  criticalTopWidth: number

  criticalHydraulicDepth: number

  criticalVelocity: number

  criticalVelocityHead: number

  criticalFroudeNumber: number

  criticalSpecificEnergy: number

  maximumBedRise: number

  maximumBedRiseToUpstreamDepthRatio: number

  availableEnergyMarginFraction: number

  crestWaterSurfaceElevationRelativeToUpstreamBed: number

  waterSurfaceElevationChangeAtChoking: number

  specificEnergyClosureResidual: number

  criticalConditionResidual: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
