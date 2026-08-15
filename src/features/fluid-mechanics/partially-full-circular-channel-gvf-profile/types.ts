export interface PartiallyFullCircularChannelGvfProfileInput {
  pipeDiameter: number

  volumetricFlowRate: number

  manningRoughness: number

  channelSlope: number

  initialFlowDepth: number

  integrationDistance: number

  maximumStepLength: number
}


export interface PartiallyFullCircularChannelGvfProfilePoint {
  index: number

  distance: number

  flowDepth: number

  depthRatio: number

  bedElevation: number

  waterSurfaceElevation: number

  meanVelocity: number

  froudeNumber: number

  frictionSlope: number

  specificEnergy: number

  totalHead: number

  depthGradient: number
}


export interface PartiallyFullCircularChannelGvfProfileResult {
  initialState:
    PartiallyFullCircularChannelGvfProfilePoint

  finalState:
    PartiallyFullCircularChannelGvfProfilePoint

  profilePoints:
    PartiallyFullCircularChannelGvfProfilePoint[]

  integrationDistance: number

  integrationDirection: string

  numberOfSteps: number

  actualStepLength: number

  criticalDepth: number

  flowRegime: string

  initialDepthGradient: number

  finalDepthGradient: number

  totalDepthChange: number

  minimumDepth: number

  maximumDepth: number

  waterSurfaceElevationChange: number

  signedFrictionHeadChange: number

  frictionHeadLossMagnitude: number

  totalHeadChange: number

  energyClosureResidual: number

  modelName: string

  limitationDescription: string
}
