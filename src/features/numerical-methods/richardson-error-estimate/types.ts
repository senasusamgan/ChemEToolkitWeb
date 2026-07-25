export interface RichardsonErrorEstimateInput {
  lowerBound: number
  upperBound: number
  coefficient3: number
  coefficient2: number
  coefficient1: number
  coefficient0: number
  coarseIntervals: number
  refinementRatio: number
  assumedOrder: number
}

export interface RichardsonErrorEstimateResult {
  coarseEstimate: number
  fineEstimate: number
  extrapolatedEstimate: number
  estimatedFineError: number
  exactIntegral: number
  actualFineError: number
  effectivityIndex: number
  modelName: string
  limitationDescription: string
}
