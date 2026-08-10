export interface BroadCrestedWeirFlowInput {
  crestWidth: number

  upstreamHeadAboveCrest: number

  dischargeCoefficient: number

  fluidDensity: number
}

export interface BroadCrestedWeirFlowResult {
  crestWidth: number

  upstreamHeadAboveCrest: number

  dischargeCoefficient: number

  theoreticalCriticalDepth: number

  theoreticalCriticalVelocity: number

  theoreticalCriticalFroudeNumber: number

  theoreticalCriticalFlowArea: number

  idealUnitDischarge: number

  correctedUnitDischarge: number

  idealVolumetricFlowRate: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  theoreticalSpecificEnergy: number

  specificEnergyResidual: number

  recoveredUpstreamHead: number

  headClosureResidual: number

  dischargeRatio: number

  modelName: string

  limitationDescription: string
}
