export interface RectangularHydraulicJumpInput {
  channelWidth: number

  upstreamDepth: number

  volumetricFlowRate: number

  fluidDensity: number
}

export interface RectangularHydraulicJumpResult {
  channelWidth: number

  upstreamDepth: number

  downstreamDepth: number

  sequentDepthRatio: number

  volumetricFlowRate: number

  massFlowRate: number

  unitDischarge: number

  upstreamFlowArea: number

  downstreamFlowArea: number

  upstreamVelocity: number

  downstreamVelocity: number

  upstreamFroudeNumber: number

  downstreamFroudeNumber: number

  upstreamSpecificEnergy: number

  downstreamSpecificEnergy: number

  energyLoss: number

  energyLossPercentage: number

  dissipatedPower: number

  upstreamMomentumFunction: number

  downstreamMomentumFunction: number

  momentumClosureResidual: number

  upstreamRegime: string

  downstreamRegime: string

  modelName: string

  limitationDescription: string
}
