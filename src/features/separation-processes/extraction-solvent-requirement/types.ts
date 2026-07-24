export interface ExtractionSolventRequirementInput {
  raffinateCarrierFlowRate: number
  distributionCoefficient: number
  targetSoluteRecoveryFraction: number
}

export interface ExtractionSolventRequirementResult {
  requiredSolventFlowRate: number
  solventToRaffinateRatio: number
  extractionFactor: number
  raffinateRemainingFraction: number
  achievedRecoveryFraction: number
  modelName: string
  limitationDescription: string
}
