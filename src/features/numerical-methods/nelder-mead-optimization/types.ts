export interface NelderMeadOptimizationInput {
  q11: number
  q12: number
  q22: number
  c1: number
  c2: number
  initialX: number
  initialY: number
  initialSimplexSize: number
  tolerance: number
  maximumIterations: number
}

export interface NelderMeadOptimizationResult {
  optimumX: number
  optimumY: number
  objectiveValue: number
  iterations: number
  converged: boolean
  finalSimplexSpread: number
  exactOptimumX: number
  exactOptimumY: number
  distanceToExactOptimum: number
  modelName: string
  limitationDescription: string
}
