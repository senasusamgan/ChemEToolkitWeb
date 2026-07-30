export interface WeightedAverageItem {
  value: number
  weight: number
}

export interface WeightedAveragePropertyInput {
  items: WeightedAverageItem[]
}

export interface WeightedAveragePropertyResult {
  weightedAverage: number
  weightedSum: number
  totalWeight: number
  normalizedWeights: number[]
  minimumActiveValue: number
  maximumActiveValue: number
  modelName: string
  limitationDescription: string
}
