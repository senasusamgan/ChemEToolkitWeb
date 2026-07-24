export interface BetMonolayerCapacityInput {
  betSlope: number
  betIntercept: number
  molecularCrossSectionArea: number
}

export interface BetMonolayerCapacityResult {
  monolayerCapacity: number
  betConstant: number
  specificSurfaceArea: number
  consistencyRatio: number
  modelName: string
  limitationDescription: string
}
