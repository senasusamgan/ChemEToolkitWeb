export interface PartiallyFullCircularChannelDirectStepInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  state1FlowDepth: number

  state2FlowDepth: number
}


export interface PartiallyFullCircularChannelDirectStepState {
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

  velocityHead: number

  specificEnergy: number

  frictionSlope: number
}


export interface PartiallyFullCircularChannelDirectStepResult {
  state1:
    PartiallyFullCircularChannelDirectStepState

  state2:
    PartiallyFullCircularChannelDirectStepState

  criticalDepth: number

  criticalSpecificEnergy: number

  specificEnergyChange: number

  averageFrictionSlope: number

  bedSlopeMinusAverageFrictionSlope: number

  signedDistance: number

  reachLength: number

  bedElevationChange: number

  waterSurfaceElevationChange: number

  signedFrictionHeadChange: number

  frictionHeadLossMagnitude: number

  totalHeadChange: number

  energyClosureResidual: number

  flowRegime: string

  profileDirection: string

  modelName: string

  limitationDescription: string
}
