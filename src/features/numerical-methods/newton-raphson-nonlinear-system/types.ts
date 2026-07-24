export interface NewtonRaphsonNonlinearSystemInput {
  circleConstant: number
  exponentialConstant: number
  initialX: number
  initialY: number
  tolerance: number
  maximumIterations: number
}

export interface NewtonRaphsonNonlinearSystemResult {
  x: number
  y: number
  iterations: number
  converged: boolean
  residualNorm: number
  equation1Residual: number
  equation2Residual: number
  jacobianDeterminant: number
  modelName: string
  limitationDescription: string
}
