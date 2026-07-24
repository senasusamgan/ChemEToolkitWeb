export interface GradientDescentOptimizationInput {
  q11: number
  q12: number
  q22: number
  c1: number
  c2: number
  initialX: number
  initialY: number
  learningRate: number
  tolerance: number
  maximumIterations: number
}

export interface GradientDescentOptimizationResult {
  optimumX: number
  optimumY: number
  objectiveValue: number
  gradientNorm: number
  iterations: number
  converged: boolean
  exactOptimumX: number
  exactOptimumY: number
  distanceToExactOptimum: number
  modelName: string
  limitationDescription: string
}
