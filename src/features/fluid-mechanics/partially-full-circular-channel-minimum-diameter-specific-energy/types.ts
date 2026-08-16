export interface PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput {
  requiredDischarge: number

  availableSpecificEnergy: number

  fluidDensity: number
}


export interface PartiallyFullCircularChannelMinimumDiameterSpecificEnergyResult {
  minimumDiameter: number

  requiredDischarge: number

  designCapacity: number

  capacityResidual: number

  capacityUtilization: number

  availableSpecificEnergy: number

  criticalDepth: number

  criticalDepthRatio: number

  crownClearance: number

  diameterSpecificEnergyRatio: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  velocityHead: number

  calculatedSpecificEnergy: number

  energyResidual: number

  criticalRelationResidual: number

  massFlowRate: number

  hydraulicPower: number

  diameterIterations: number

  capacitySolverCalls: number

  innerCriticalIterations: number

  modelName: string

  limitationDescription: string
}
