export interface KremserStrippingStagesInput {
  factor: number
  targetRemovalFraction: number
}

export interface KremserStrippingStagesResult {
  factor: number
  theoreticalStageCount: number
  requiredIntegerStages: number
  achievedRemainingFraction: number
  achievedRemovalFraction: number
  limitingCaseUsed: boolean
  modelName: string
  limitationDescription: string
}
