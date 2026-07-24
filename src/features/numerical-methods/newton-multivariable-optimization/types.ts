export interface NewtonMultivariableOptimizationInput {
  q11: number
  q12: number
  q22: number
  c1: number
  c2: number
  initialX: number
  initialY: number
  tolerance: number
  maximumIterations: number
}

export interface NewtonMultivariableOptimizationResult {
  optimumX: number
  optimumY: number
  objectiveValue: number
  gradientNorm: number
  iterations: number
  converged: boolean
  determinant: number
  modelName: string
  limitationDescription: string
}
