export interface NaturalCubicSplineInterpolationInput {
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
  x4: number
  y4: number
  evaluationX: number
}

export interface NaturalCubicSplineInterpolationResult {
  interpolatedValue: number
  interpolatedFirstDerivative: number
  interpolatedSecondDerivative: number
  intervalIndex: number
  secondDerivative1: number
  secondDerivative2: number
  secondDerivative3: number
  secondDerivative4: number
  modelName: string
  limitationDescription: string
}
