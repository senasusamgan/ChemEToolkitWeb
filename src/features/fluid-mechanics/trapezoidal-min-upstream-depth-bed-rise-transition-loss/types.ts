export interface TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  specifiedBedRise: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossResult {
  minimumSubcriticalUpstreamDepth: number

  zeroBedRiseMinimumSubcriticalUpstreamDepth: number

  bedRiseDepthPenalty: number

  bedRiseDepthPenaltyPercent: number

  alternateSupercriticalUpstreamDepth: number

  upstreamCriticalDepth: number

  upstreamCriticalSpecificEnergy: number

  depthAboveUpstreamCritical: number

  upstreamDepthToCriticalDepthRatio: number

  requiredUpstreamSpecificEnergy: number

  throatRequiredSpecificEnergy: number

  specifiedBedRiseFractionOfRequiredEnergy: number

  requiredUpstreamFlowArea: number

  requiredUpstreamTopWidth: number

  requiredUpstreamHydraulicDepth: number

  requiredUpstreamVelocity: number

  requiredUpstreamVelocityHead: number

  requiredUpstreamFroudeNumber: number

  alternateUpstreamFlowArea: number

  alternateUpstreamVelocity: number

  alternateUpstreamFroudeNumber: number

  lossAdjustedControlDepth: number

  lossAdjustedControlFlowArea: number

  lossAdjustedControlTopWidth: number

  lossAdjustedControlHydraulicDepth: number

  lossAdjustedControlVelocity: number

  lossAdjustedControlVelocityHead: number

  lossAdjustedControlFroudeNumber: number

  theoreticalControlFroudeNumber: number

  controlSpecificEnergyWithoutLoss: number

  transitionLossHeadAtThreshold: number

  crestBedElevationRelativeToUpstream: number

  crestWaterSurfaceElevationRelativeToUpstreamBed: number

  waterSurfaceElevationChangeAtThreshold: number

  subcriticalEnergyResidual: number

  alternateEnergyResidual: number

  totalEnergyClosureResidual: number

  controlConditionResidual: number

  contractionRatio: number

  contractedWidthReduction: number

  massFlowRate: number

  transitionLossDissipationPower: number

  bedRisePotentialPower: number

  combinedBedRiseAndLossPower: number

  modelName: string

  limitationDescription: string
}
