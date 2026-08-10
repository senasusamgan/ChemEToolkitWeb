export interface SharpCrestedRectangularWeirInput {
  crestWidth: number

  headOverCrest: number

  dischargeCoefficient: number

  fluidDensity: number
}

export interface SharpCrestedRectangularWeirResult {
  crestWidth: number

  headOverCrest: number

  dischargeCoefficient: number

  idealVolumetricFlowRate: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  unitDischarge: number

  equivalentFlowArea: number

  equivalentMeanVelocity: number

  equivalentVelocityHead: number

  recoveredHeadOverCrest: number

  headClosureResidual: number

  dischargeRatio: number

  modelName: string

  limitationDescription: string
}
