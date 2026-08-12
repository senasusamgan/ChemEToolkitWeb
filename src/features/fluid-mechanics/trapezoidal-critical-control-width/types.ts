export interface TrapezoidalCriticalControlWidthInput {
  volumetricFlowRate: number

  availableSpecificEnergy: number

  sideSlopeHorizontalPerVertical: number

  fluidDensity: number
}

export interface TrapezoidalCriticalControlWidthResult {
  requiredBottomWidth: number

  availableSpecificEnergy: number

  volumetricFlowRate: number

  sideSlopeHorizontalPerVertical: number

  criticalDepth: number

  criticalFlowArea: number

  criticalTopWidth: number

  criticalHydraulicDepth: number

  criticalVelocity: number

  criticalVelocityHead: number

  criticalFroudeNumber: number

  bottomWidthToCriticalDepthRatio: number

  zeroBottomWidthCapacity: number

  capacityMarginAboveZeroWidthLimit: number

  reconstructedMaximumFlowRate: number

  flowClosureResidual: number

  relativeFlowClosureResidual: number

  recoveredSpecificEnergy: number

  specificEnergyResidual: number

  criticalConditionResidual: number

  designMassFlowRate: number

  solverIterations: number

  modelName: string

  limitationDescription: string
}
