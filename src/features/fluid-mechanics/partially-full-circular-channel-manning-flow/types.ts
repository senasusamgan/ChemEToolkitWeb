export interface PartiallyFullCircularChannelManningFlowInput {
  pipeDiameter: number

  flowDepth: number

  manningRoughness: number

  channelSlope: number

  fluidDensity: number
}

export interface PartiallyFullCircularChannelManningFlowResult {
  radius: number

  depthRatio: number

  centralAngleRadians: number

  centralAngleDegrees: number

  flowArea: number

  fullFlowArea: number

  areaRatioToFull: number

  wettedPerimeter: number

  fullWettedPerimeter: number

  wettedPerimeterRatioToFull: number

  topWidth: number

  hydraulicRadius: number

  fullFlowHydraulicRadius: number

  hydraulicRadiusRatioToFull: number

  hydraulicDepth: number

  volumetricFlowRate: number

  fullFlowVolumetricFlowRate: number

  flowRateRatioToFull: number

  massFlowRate: number

  meanVelocity: number

  fullFlowMeanVelocity: number

  velocityRatioToFull: number

  froudeNumber: number

  flowRegime: string

  averageBoundaryShearStress: number

  hydraulicPowerDissipationPerUnitLength: number

  modelName: string

  limitationDescription: string
}
