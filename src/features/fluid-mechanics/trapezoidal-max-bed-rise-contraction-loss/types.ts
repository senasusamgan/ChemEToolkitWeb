export interface TrapezoidalMaximumBedRiseContractionLossInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalMaximumBedRiseContractionLossResult {
  bedRiseStatus: string

  signedBedElevationAllowance: number

  maximumAllowableBedRise: number

  requiredBedLowering: number

  upstreamSpecificEnergy: number

  upstreamFroudeNumber: number

  minimumRequiredThroatEnergy: number

  specificEnergyReserve: number

  lossAdjustedControlDepth: number

  lossAdjustedControlVelocity: number

  lossAdjustedControlFroudeNumber: number

  theoreticalControlFroudeNumber: number

  controlSpecificEnergyWithoutLoss: number

  transitionLossHeadAtThreshold: number

  crestBedElevationRelativeToUpstream: number

  crestWaterSurfaceElevationRelativeToUpstreamBed: number

  waterSurfaceElevationChangeAtThreshold: number

  exactThresholdEnergyResidual: number

  controlConditionResidual: number

  contractionRatio: number

  contractedWidthReduction: number

  lossAdjustedMinimumContractedBottomWidth: number

  widthSafetyMarginAtCurrentBed: number

  massFlowRate: number

  transitionLossDissipationPower: number

  maximumBedRisePotentialPower: number

  requiredBedLoweringPotentialPower: number

  modelName: string

  limitationDescription: string
}
