export interface TrapezoidalHydraulicJumpInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  upstreamDepth: number

  volumetricFlowRate: number

  fluidDensity: number
}

export interface TrapezoidalHydraulicJumpResult {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  upstreamDepth: number

  downstreamDepth: number

  sequentDepthRatio: number

  criticalDepth: number

  volumetricFlowRate: number

  massFlowRate: number

  upstreamFlowArea: number

  downstreamFlowArea: number

  upstreamTopWidth: number

  downstreamTopWidth: number

  upstreamHydraulicDepth: number

  downstreamHydraulicDepth: number

  upstreamVelocity: number

  downstreamVelocity: number

  upstreamFroudeNumber: number

  downstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  downstreamSpecificEnergy: number

  energyLoss: number

  energyLossPercentage: number

  dissipatedPower: number

  upstreamHydrostaticMomentumTerm: number

  downstreamHydrostaticMomentumTerm: number

  upstreamKineticMomentumTerm: number

  downstreamKineticMomentumTerm: number

  upstreamMomentumFunction: number

  downstreamMomentumFunction: number

  momentumClosureResidual: number

  relativeMomentumClosureResidual: number

  solverIterations: number

  modelName: string

  limitationDescription: string
}
