export interface GillilandStageEstimateInput {
  minimumStages: number
  minimumRefluxRatio: number
  operatingRefluxRatio: number
  overallStageEfficiency: number
}

export interface GillilandStageEstimateResult {
  reducedReflux: number
  gillilandReducedStages: number
  theoreticalStageCount: number
  requiredIntegerTheoreticalStages: number
  actualStageCount: number
  requiredIntegerActualStages: number
  modelName: string
  limitationDescription: string
}
