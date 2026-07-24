export interface CurveFittingInput {
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
  x4: number
  y4: number
  x5: number
  y5: number
  polynomialDegree: number
  predictionX: number
}

export interface CurveFittingResult {
  coefficient0: number
  coefficient1: number
  coefficient2: number
  predictionY: number
  rSquared: number
  rootMeanSquareError: number
  residualSumOfSquares: number
  modelName: string
  limitationDescription: string
}
