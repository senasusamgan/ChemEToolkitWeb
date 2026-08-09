export type KremserAbsorptionRegime =
  | 'favorable'
  | 'unity'
  | 'limited'

export interface KremserAbsorptionInput {
  inletGasSoluteMoleFraction: number
  targetOutletGasSoluteMoleFraction: number
  absorptionFactor: number
}

export interface KremserAbsorptionResult {
  modelName: string
  limitationDescription: string
  absorptionFactor: number
  operatingRegime: KremserAbsorptionRegime
  inletToTargetRatio: number
  targetRemovalPercent: number
  exactIdealStageRequirement: number
  requiredIdealStages: number
  predictedOutletMoleFraction: number
  predictedRemovalPercent: number
  stageRoundingMargin: number
}
