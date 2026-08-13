export interface TrapezoidalMaximumTransitionLossCoefficientBedRiseInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  specifiedBedRise: number

  fluidDensity: number
}

export interface TrapezoidalMaximumTransitionLossCoefficientBedRiseResult {
  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamVelocityHead: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  availableThroatSpecificEnergy: number

  specifiedBedRiseFractionOfUpstreamEnergy: number

  losslessMaximumVolumetricFlowRate: number

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

  transitionLossHeadFractionOfAvailableThroatEnergy: number

  minimumRequiredThroatEnergy: number

  crestWaterSurfaceElevationRelativeToUpstreamBed: number

  waterSurfaceElevationChangeAtThreshold: number

  throatEnergyClosureResidual: number

  totalEnergyClosureResidual: number

  controlConditionResidual: number

  contractionRatio: number

  contractedWidthReduction: number

  massFlowRate: number

  maximumTransitionLossDissipationPower: number

  bedRisePotentialPower: number

  combinedBedRiseAndLossPower: number

  capacitySolverIterations: number

  modelName: string

  limitationDescription: string
}
