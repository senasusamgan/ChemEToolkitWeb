export interface CountercurrentExtractionStagesInput {
  distributionCoefficient: number
  solventToRaffinateRatio: number
  targetSoluteRecoveryFraction: number
}

export interface CountercurrentExtractionStagesResult {
  extractionFactor: number
  theoreticalStageCount: number
  requiredIntegerStages: number
  achievedRemainingFraction: number
  achievedRecoveryFraction: number
  limitingCaseUsed: boolean
  modelName: string
  limitationDescription: string
}
