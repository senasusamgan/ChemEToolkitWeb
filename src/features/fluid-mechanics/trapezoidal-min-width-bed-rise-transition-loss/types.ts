export interface TrapezoidalMinimumWidthBedRiseTransitionLossInput {
  upstreamBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  specifiedBedRise: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalMinimumWidthBedRiseTransitionLossResult {
  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  availableThroatSpecificEnergy: number

  minimumContractedBottomWidth: number

  losslessMinimumContractedBottomWidth: number

  transitionLossWidthPenalty: number

  maximumAllowableWidthReduction: number

  maximumContractionPercent: number

  contractionRatioAtLimit: number

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

  minimumRequiredThroatEnergy: number

  crestWaterSurfaceElevationRelativeToUpstreamBed: number

  waterSurfaceElevationChangeAtThreshold: number

  energyClosureResidual: number

  controlConditionResidual: number

  massFlowRate: number

  transitionLossDissipationPower: number

  bedRisePotentialPower: number

  widthSolverIterations: number

  modelName: string

  limitationDescription: string
}
