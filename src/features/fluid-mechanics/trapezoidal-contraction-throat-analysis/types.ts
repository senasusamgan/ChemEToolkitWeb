export interface TrapezoidalContractionThroatAnalysisInput {
  upstreamBottomWidth: number

  contractedBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  fluidDensity: number
}

export interface TrapezoidalContractionThroatAnalysisResult {
  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  minimumContractedBottomWidth: number

  remainingWidthMargin: number

  contractionRatio: number

  widthLimitUtilizationPercent: number

  throatStatus: string

  throatCriticalDepth: number

  throatCriticalSpecificEnergy: number

  availableSpecificEnergyMargin: number

  maximumPassableFlowAtAvailableEnergy: number

  flowCapacityMargin: number

  additionalSpecificEnergyRequired: number

  subcriticalThroatDepth: number | null

  subcriticalThroatVelocity: number | null

  subcriticalThroatFroudeNumber: number | null

  supercriticalAlternateDepth: number | null

  supercriticalAlternateVelocity: number | null

  supercriticalAlternateFroudeNumber: number | null

  waterSurfaceElevationChange: number | null

  subcriticalEnergyResidual: number | null

  alternateEnergyResidual: number | null

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
