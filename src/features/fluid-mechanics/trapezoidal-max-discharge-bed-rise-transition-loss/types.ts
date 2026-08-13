export interface TrapezoidalMaximumDischargeBedRiseTransitionLossInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  upstreamFlowDepth: number

  specifiedBedRise: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalMaximumDischargeBedRiseTransitionLossResult {
  maximumVolumetricFlowRate: number

  maximumMassFlowRate: number

  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocityAtMaximumFlow: number

  upstreamFroudeNumberAtMaximumFlow: number

  upstreamSpecificEnergyAtMaximumFlow: number

  availableThroatSpecificEnergyAtMaximumFlow: number

  upstreamCriticalFlowRate: number

  upstreamCriticalFlowMargin: number

  losslessMaximumVolumetricFlowRate: number

  transitionLossFlowPenalty: number

  transitionLossCapacityRatio: number

  transitionLossFlowReductionPercent: number

  zeroBedRiseMaximumVolumetricFlowRate: number

  bedRiseFlowPenalty: number

  bedRiseCapacityRatio: number

  bedRiseFlowReductionPercent: number

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

  minimumRequiredThroatEnergy: number

  crestWaterSurfaceElevationRelativeToUpstreamBed: number

  waterSurfaceElevationChangeAtThreshold: number

  energyClosureResidual: number

  controlConditionResidual: number

  transitionLossDissipationPower: number

  bedRisePotentialPower: number

  flowSolverIterations: number

  modelName: string

  limitationDescription: string
}
