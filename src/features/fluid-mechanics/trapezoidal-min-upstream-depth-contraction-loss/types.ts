export interface TrapezoidalMinimumUpstreamDepthContractionLossInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalMinimumUpstreamDepthContractionLossResult {
  upstreamCriticalDepth: number

  upstreamCriticalSpecificEnergy: number

  minimumSubcriticalUpstreamDepth: number

  alternateSupercriticalUpstreamDepth: number

  requiredUpstreamFlowArea: number

  requiredUpstreamTopWidth: number

  requiredUpstreamHydraulicDepth: number

  requiredUpstreamVelocity: number

  requiredUpstreamVelocityHead: number

  requiredUpstreamFroudeNumber: number

  alternateUpstreamVelocity: number

  alternateUpstreamFroudeNumber: number

  depthAboveUpstreamCritical: number

  upstreamDepthToCriticalDepthRatio: number

  contractedWidthReduction: number

  contractionRatio: number

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

  requiredUpstreamSpecificEnergy: number

  waterSurfaceElevationChangeAtThreshold: number

  subcriticalEnergyResidual: number

  alternateEnergyResidual: number

  controlConditionResidual: number

  massFlowRate: number

  transitionLossDissipationPower: number

  modelName: string

  limitationDescription: string
}
