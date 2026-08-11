export interface TrapezoidalMaximumDischargeSpecificEnergyInput {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  availableSpecificEnergy: number

  fluidDensity: number
}

export interface TrapezoidalMaximumDischargeSpecificEnergyResult {
  bottomWidth: number

  sideSlopeHorizontalPerVertical: number

  availableSpecificEnergy: number

  criticalDepth: number

  criticalFlowArea: number

  criticalTopWidth: number

  criticalHydraulicDepth: number

  criticalVelocity: number

  criticalVelocityHead: number

  criticalFroudeNumber: number

  maximumVolumetricFlowRate: number

  maximumVolumetricFlowRateCubicMetersPerHour: number

  maximumMassFlowRate: number

  dischargePerUnitTopWidth: number

  criticalDepthToEnergyRatio: number

  recoveredSpecificEnergy: number

  specificEnergyResidual: number

  criticalConditionResidual: number

  forwardCriticalDepth: number

  criticalDepthClosureResidual: number

  solverIterations: number

  modelName: string

  limitationDescription: string
}
