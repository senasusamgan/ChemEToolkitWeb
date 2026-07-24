export interface ConjugateGradientSolverInput {
  a11: number
  a12: number
  a13: number
  a22: number
  a23: number
  a33: number
  b1: number
  b2: number
  b3: number
  initialX1: number
  initialX2: number
  initialX3: number
  tolerance: number
  maximumIterations: number
}

export interface ConjugateGradientSolverResult {
  x1: number
  x2: number
  x3: number
  iterations: number
  converged: boolean
  residualNorm: number
  relativeResidual: number
  modelName: string
  limitationDescription: string
}
