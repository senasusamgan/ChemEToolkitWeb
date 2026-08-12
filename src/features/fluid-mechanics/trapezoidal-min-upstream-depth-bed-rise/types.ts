export interface TrapezoidalMinimumUpstreamDepthBedRiseInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  bedRise: number

  fluidDensity: number
}

export interface TrapezoidalMinimumUpstreamDepthBedRiseResult {
  criticalDepth: number

  criticalSpecificEnergy: number

  requiredUpstreamSpecificEnergy: number

  minimumSubcriticalUpstreamDepth: number

  alternateSupercriticalDepth: number

  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamVelocityHead: number

  upstreamFroudeNumber: number

  alternateVelocity: number

  alternateFroudeNumber: number

  depthAboveCritical: number

  upstreamDepthToCriticalDepthRatio: number

  crestWaterSurfaceElevationChange: number

  forwardMaximumBedRise: number

  bedRiseClosureResidual: number

  upstreamEnergyResidual: number

  alternateEnergyResidual: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
