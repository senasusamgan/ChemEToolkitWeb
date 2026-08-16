export interface PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput {
  pipeDiameter: number

  requiredDischarge: number

  fluidDensity: number
}


export interface PartiallyFullCircularChannelMinimumRequiredSpecificEnergyResult {
  minimumSpecificEnergy: number

  criticalDepth: number

  criticalDepthRatio: number

  crownClearance: number

  requiredDischarge: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  velocityHead: number

  criticalGeometrySpecificEnergy: number

  specificEnergyClosureResidual: number

  criticalRelationResidual: number

  massFlowRate: number

  hydraulicPower: number

  depthEnergyFraction: number

  velocityEnergyFraction: number

  centralAngleRadians: number

  centralAngleDegrees: number

  modelName: string

  limitationDescription: string
}
