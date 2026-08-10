export interface TrapezoidalChannelAlternateDepthInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  specificEnergy: number

  fluidDensity: number
}

export interface TrapezoidalChannelAlternateDepthResult {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  volumetricFlowRate: number

  specificEnergy: number

  criticalDepth: number

  minimumSpecificEnergy: number

  energyAboveMinimum: number

  shallowDepth: number

  deepDepth: number

  alternateDepthRatio: number

  shallowFlowArea: number

  deepFlowArea: number

  shallowTopWidth: number

  deepTopWidth: number

  shallowHydraulicDepth: number

  deepHydraulicDepth: number

  shallowVelocity: number

  deepVelocity: number

  shallowFroudeNumber: number

  deepFroudeNumber: number

  shallowRecoveredSpecificEnergy: number

  deepRecoveredSpecificEnergy: number

  shallowEnergyResidual: number

  deepEnergyResidual: number

  shallowMomentumFunction: number

  deepMomentumFunction: number

  momentumFunctionDifference: number

  massFlowRate: number

  shallowSolverIterations: number

  deepSolverIterations: number

  modelName: string

  limitationDescription: string
}
