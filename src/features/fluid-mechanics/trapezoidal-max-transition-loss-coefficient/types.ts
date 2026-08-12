export interface TrapezoidalMaximumTransitionLossCoefficientInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  fluidDensity: number
}

export interface TrapezoidalMaximumTransitionLossCoefficientResult {
  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamVelocityHead: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  contractedWidthReduction: number

  contractionRatio: number

  losslessMaximumFlowRate: number

  losslessFlowCapacityMargin: number

  losslessCapacityRatio: number

  maximumAllowableTransitionLossCoefficient: number

  lossAdjustedControlDepth: number

  lossAdjustedControlFlowArea: number

  lossAdjustedControlTopWidth: number

  lossAdjustedControlHydraulicDepth: number

  lossAdjustedControlVelocity: number

  lossAdjustedControlVelocityHead: number

  lossAdjustedControlFroudeNumber: number

  theoreticalControlFroudeNumber: number

  controlSpecificEnergyWithoutLoss: number

  maximumAllowableTransitionLossHead: number

  transitionLossHeadFractionOfUpstreamEnergy: number

  minimumRequiredUpstreamSpecificEnergy: number

  energyClosureResidual: number

  controlConditionResidual: number

  forwardLossAdjustedMinimumWidth: number

  forwardWidthClosureResidual: number

  forwardAvailableEnergyMargin: number

  forwardThresholdStatus: string

  massFlowRate: number

  maximumAllowableDissipationPower: number

  modelName: string

  limitationDescription: string
}
