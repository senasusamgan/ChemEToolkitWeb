export interface KremserAbsorptionStagesInput {
  factor: number
  targetRemovalFraction: number
}

export interface KremserAbsorptionStagesResult {
  factor: number
  theoreticalStageCount: number
  requiredIntegerStages: number
  achievedRemainingFraction: number
  achievedRemovalFraction: number
  limitingCaseUsed: boolean
  modelName: string
  limitationDescription: string
}
