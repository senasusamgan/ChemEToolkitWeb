export interface TrapezoidalContractionTransitionLossInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  transitionLossCoefficient: number

  fluidDensity: number
}

export interface TrapezoidalContractionTransitionLossResult {
  upstreamFlowArea: number

  upstreamVelocity: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  losslessMinimumContractedBottomWidth: number

  lossAdjustedMinimumContractedBottomWidth: number

  lossPenaltyWidth: number

  remainingWidthMargin: number

  contractionRatio: number

  widthLimitUtilizationPercent: number

  lossAdjustedControlDepth: number

  lossAdjustedControlVelocity: number

  lossAdjustedControlFroudeNumber: number

  theoreticalControlFroudeNumber: number

  controlSpecificEnergyWithoutLoss: number

  controlTransitionLossHead: number

  minimumRequiredUpstreamSpecificEnergy: number

  availableSpecificEnergyMargin: number

  additionalSpecificEnergyRequired: number

  throatStatus: string

  subcriticalThroatDepth: number | null

  subcriticalThroatVelocity: number | null

  subcriticalThroatFroudeNumber: number | null

  subcriticalTransitionLossHead: number | null

  supercriticalAlternateDepth: number | null

  supercriticalAlternateVelocity: number | null

  supercriticalAlternateFroudeNumber: number | null

  supercriticalTransitionLossHead: number | null

  waterSurfaceElevationChange: number | null

  subcriticalEnergyResidual: number | null

  alternateEnergyResidual: number | null

  controlConditionResidual: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
