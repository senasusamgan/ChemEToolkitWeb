export interface CrosscurrentExtractionStagesInput {
  distributionCoefficient: number
  solventToRaffinateRatioPerStage: number
  targetSoluteRecoveryFraction: number
}

export interface CrosscurrentExtractionStagesResult {
  extractionFactorPerStage: number
  raffinateFractionPerStage: number
  theoreticalStageCount: number
  requiredIntegerStages: number
  achievedRemainingFraction: number
  achievedRecoveryFraction: number
  modelName: string
  limitationDescription: string
}
