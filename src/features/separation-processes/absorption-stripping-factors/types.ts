export interface AbsorptionStrippingFactorsInput {
  liquidMolarFlowRate: number
  gasMolarFlowRate: number
  equilibriumSlope: number
}

export interface AbsorptionStrippingFactorsResult {
  absorptionFactor: number
  strippingFactor: number
  liquidToGasRatio: number
  gasToLiquidRatio: number
  absorptionAssessment: string
  strippingAssessment: string
  modelName: string
  limitationDescription: string
}
