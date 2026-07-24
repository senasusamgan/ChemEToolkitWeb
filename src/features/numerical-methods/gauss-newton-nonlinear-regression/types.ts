export interface GaussNewtonNonlinearRegressionInput {
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
  x4: number
  y4: number
  initialA: number
  initialB: number
  tolerance: number
  maximumIterations: number
}

export interface GaussNewtonNonlinearRegressionResult {
  parameterA: number
  parameterB: number
  iterations: number
  converged: boolean
  residualSumOfSquares: number
  rootMeanSquareError: number
  gradientNorm: number
  modelName: string
  limitationDescription: string
}
