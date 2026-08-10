export interface RectangularChannelAlternateDepthInput {
  channelWidth: number

  volumetricFlowRate: number

  specificEnergy: number

  fluidDensity: number
}

export interface RectangularChannelAlternateDepthResult {
  channelWidth: number

  volumetricFlowRate: number

  unitDischarge: number

  specificEnergy: number

  criticalDepth: number

  minimumSpecificEnergy: number

  energyAboveMinimum: number

  shallowDepth: number

  deepDepth: number

  alternateDepthRatio: number

  shallowVelocity: number

  deepVelocity: number

  shallowFroudeNumber: number

  deepFroudeNumber: number

  shallowVelocityHead: number

  deepVelocityHead: number

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
