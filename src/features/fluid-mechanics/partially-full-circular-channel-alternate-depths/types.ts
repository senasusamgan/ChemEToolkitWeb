export interface PartiallyFullCircularChannelAlternateDepthsInput {
  pipeDiameter: number

  volumetricFlowRate: number

  specificEnergy: number

  fluidDensity: number
}

export interface PartiallyFullCircularChannelAlternateDepthSolution {
  flowDepth: number

  depthRatio: number

  centralAngleDegrees: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  velocityHead: number

  froudeNumber: number

  flowRegime: string

  recoveredSpecificEnergy: number

  specificEnergyResidual: number
}

export interface PartiallyFullCircularChannelAlternateDepthsResult {
  solutionMultiplicity: string

  shallowSolution:
    PartiallyFullCircularChannelAlternateDepthSolution

  deepSolution:
    PartiallyFullCircularChannelAlternateDepthSolution | null

  criticalDepth: number

  criticalDepthRatio: number

  criticalSpecificEnergy: number

  energyExcessAboveCritical: number

  requestedEnergyToCriticalRatio: number

  fullDepthLimitSpecificEnergy: number

  requestedEnergyToFullDepthLimitRatio: number

  alternateDepthSeparation: number | null

  massFlowRate: number

  modelName: string

  limitationDescription: string
}
