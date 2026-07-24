export interface LevenbergMarquardtRegressionInput {
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
  initialDamping: number
  tolerance: number
  maximumIterations: number
}

export interface LevenbergMarquardtRegressionResult {
  parameterA: number
  parameterB: number
  residualSumOfSquares: number
  rootMeanSquareError: number
  iterations: number
  acceptedSteps: number
  rejectedSteps: number
  finalDamping: number
  converged: boolean
  modelName: string
  limitationDescription: string
}
