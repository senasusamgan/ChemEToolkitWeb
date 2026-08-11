export interface MostEconomicalTrapezoidalChannelInput {
  volumetricFlowRate: number

  channelSlope: number

  manningRoughness: number

  sideSlopeHorizontalPerVertical: number

  fluidDensity: number
}

export interface MostEconomicalTrapezoidalChannelResult {
  volumetricFlowRate: number

  channelSlope: number

  manningRoughness: number

  sideSlopeHorizontalPerVertical: number

  flowDepth: number

  bottomWidth: number

  topWidth: number

  flowArea: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  sideLength: number

  halfTopWidth: number

  optimumGeometryResidual: number

  hydraulicRadiusResidual: number

  bottomWidthToDepthRatio: number

  meanVelocity: number

  froudeNumber: number

  flowRegime: string

  specificEnergy: number

  boundaryShearStress: number

  massFlowRate: number

  hydraulicPowerDissipationPerLength: number

  manningConveyance: number

  reconstructedFlowRate: number

  flowClosureResidual: number

  relativeFlowClosureResidual: number

  geometryFactor: number

  modelName: string

  limitationDescription: string
}
