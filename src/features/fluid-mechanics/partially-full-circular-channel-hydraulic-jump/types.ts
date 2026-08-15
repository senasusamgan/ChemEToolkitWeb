export interface PartiallyFullCircularChannelHydraulicJumpInput {
  pipeDiameter: number

  volumetricFlowRate: number

  upstreamFlowDepth: number

  fluidDensity: number
}

export interface PartiallyFullCircularChannelHydraulicJumpState {
  flowDepth: number

  depthRatio: number

  centralAngleDegrees: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  specificEnergy: number

  hydrostaticFirstMoment: number

  specificForce: number
}

export interface PartiallyFullCircularChannelHydraulicJumpResult {
  upstreamState:
    PartiallyFullCircularChannelHydraulicJumpState

  downstreamState:
    PartiallyFullCircularChannelHydraulicJumpState

  criticalDepth: number

  criticalSpecificEnergy: number

  jumpHeight: number

  sequentDepthRatio: number

  specificEnergyLoss: number

  energyLossPercent: number

  upstreamSpecificForce: number

  downstreamSpecificForce: number

  momentumClosureResidual: number

  hydrostaticForceUpstream: number

  hydrostaticForceDownstream: number

  hydrostaticForceIncrease: number

  momentumFluxChangeForce: number

  forceBalanceResidual: number

  hydraulicPowerDissipated: number

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
