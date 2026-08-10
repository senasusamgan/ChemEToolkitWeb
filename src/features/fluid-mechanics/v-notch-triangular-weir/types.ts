export interface VNotchTriangularWeirInput {
  notchAngleDegrees: number

  headOverVertex: number

  dischargeCoefficient: number

  fluidDensity: number
}

export interface VNotchTriangularWeirResult {
  notchAngleDegrees: number

  notchAngleRadians: number

  halfAngleTangent: number

  headOverVertex: number

  dischargeCoefficient: number

  topWidthAtHead: number

  wettedTriangularArea: number

  idealVolumetricFlowRate: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  equivalentMeanVelocity: number

  equivalentVelocityHead: number

  recoveredHeadOverVertex: number

  headClosureResidual: number

  dischargeRatio: number

  modelName: string

  limitationDescription: string
}
