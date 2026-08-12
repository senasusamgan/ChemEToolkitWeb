export interface TrapezoidalMinimumContractionWidthInput {
  upstreamBottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  fluidDensity: number
}

export interface TrapezoidalMinimumContractionWidthResult {
  upstreamBottomWidth: number

  upstreamFlowDepth: number

  upstreamFlowArea: number

  upstreamTopWidth: number

  upstreamHydraulicDepth: number

  upstreamVelocity: number

  upstreamVelocityHead: number

  upstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  minimumContractedBottomWidth: number

  bottomWidthReduction: number

  bottomWidthReductionPercent: number

  contractionRatio: number

  criticalThroatDepth: number

  criticalThroatFlowArea: number

  criticalThroatTopWidth: number

  criticalThroatHydraulicDepth: number

  criticalThroatVelocity: number

  criticalThroatFroudeNumber: number

  criticalThroatSpecificEnergy: number

  waterSurfaceElevationChangeAtChoking: number

  zeroBottomWidthCapacity: number

  flowMarginAboveTriangularLimit: number

  reconstructedCriticalCapacity: number

  flowClosureResidual: number

  energyClosureResidual: number

  criticalConditionResidual: number

  massFlowRate: number

  widthSolverIterations: number

  modelName: string

  limitationDescription: string
}
