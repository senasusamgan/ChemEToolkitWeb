export interface BinaryDistillationBalanceInput {
  feedFlowRate: number
  feedLightKeyFraction: number
  distillateLightKeyFraction: number
  bottomsLightKeyFraction: number
}

export interface BinaryDistillationBalanceResult {
  distillateFlowRate: number
  bottomsFlowRate: number
  distillateRecoveryFraction: number
  bottomsRecoveryFraction: number
  lightKeyRecoveryToDistillate: number
  heavyKeyRecoveryToBottoms: number
  totalBalanceResidual: number
  lightKeyBalanceResidual: number
  modelName: string
  limitationDescription: string
}
