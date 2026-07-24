export interface BroydenNonlinearSystemInput {
  circleConstant: number
  exponentialConstant: number
  initialX: number
  initialY: number
  tolerance: number
  maximumIterations: number
}

export interface BroydenNonlinearSystemResult {
  x: number
  y: number
  iterations: number
  converged: boolean
  residualNorm: number
  equation1Residual: number
  equation2Residual: number
  modelName: string
  limitationDescription: string
}
