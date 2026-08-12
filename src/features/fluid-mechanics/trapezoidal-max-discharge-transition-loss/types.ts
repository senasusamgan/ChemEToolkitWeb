export interface TrapezoidalMaximumDischargeTransitionLossInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  upstreamFlowDepth: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalMaximumDischargeTransitionLossResult {
  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  maximumVolumetricFlowRate: number

  maximumMassFlowRate: number

  upstreamVelocityAtMaximumFlow: number

  upstreamVelocityHeadAtMaximumFlow: number

  upstreamFroudeNumberAtMaximumFlow: number

  upstreamSpecificEnergyAtMaximumFlow: number

  upstreamCriticalFlowRate: number

  upstreamCriticalFlowMargin: number

  losslessMaximumVolumetricFlowRate: number

  transitionLossFlowPenalty: number

  transitionLossCapacityRatio: number

  transitionLossFlowReductionPercent: number

  lossAdjustedControlDepth: number

  lossAdjustedControlFlowArea: number

  lossAdjustedControlTopWidth: number

  lossAdjustedControlHydraulicDepth: number

  lossAdjustedControlVelocity: number

  lossAdjustedControlVelocityHead: number

  lossAdjustedControlFroudeNumber: number

  theoreticalControlFroudeNumber: number

  controlSpecificEnergyWithoutLoss: number

  transitionLossHeadAtMaximumFlow: number

  transitionLossHeadFractionOfUpstreamEnergy: number

  minimumRequiredSpecificEnergy: number

  energyClosureResidual: number

  controlConditionResidual: number

  backCalculatedMaximumTransitionLossCoefficient: number

  lossCoefficientClosureResidual: number

  forwardLossAdjustedMinimumWidth: number

  forwardWidthClosureResidual: number

  forwardAvailableEnergyMargin: number

  forwardThresholdStatus: string

  maximumDissipationPower: number

  flowSolverIterations: number

  modelName: string

  limitationDescription: string
}
