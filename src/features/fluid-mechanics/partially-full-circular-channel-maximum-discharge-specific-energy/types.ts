export interface PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput {
  pipeDiameter: number

  targetSpecificEnergy: number

  fluidDensity: number
}


export interface PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult {
  maximumDischarge: number

  criticalDepth: number

  depthRatio: number

  crownClearance: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  velocityHead: number

  targetSpecificEnergy: number

  calculatedSpecificEnergy: number

  energyResidual: number

  criticalRelationResidual: number

  massFlowRate: number

  hydraulicPower: number

  depthEnergyFraction: number

  velocityEnergyFraction: number

  centralAngleRadians: number

  rootIterations: number

  modelName: string

  limitationDescription: string
}
