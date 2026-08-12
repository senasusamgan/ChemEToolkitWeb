export interface TrapezoidalChannelBedRiseCrestDepthInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  bedRise: number

  fluidDensity: number
}

export interface TrapezoidalChannelBedRiseCrestDepthResult {
  upstreamFlowArea: number

  upstreamVelocity: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  specifiedBedRise: number

  maximumBedRiseBeforeChoking: number

  remainingBedRiseMargin: number

  bedRiseUtilizationRatio: number

  nominalCrestSpecificEnergy: number

  criticalDepth: number

  criticalSpecificEnergy: number

  flowStatus: string

  additionalSpecificEnergyRequired: number

  requiredUpstreamSpecificEnergy: number

  subcriticalCrestDepth: number | null

  subcriticalCrestVelocity: number | null

  subcriticalCrestFroudeNumber: number | null

  supercriticalAlternateDepth: number | null

  supercriticalAlternateVelocity: number | null

  supercriticalAlternateFroudeNumber: number | null

  crestWaterSurfaceElevationChange: number | null

  subcriticalEnergyResidual: number | null

  alternateEnergyResidual: number | null

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
