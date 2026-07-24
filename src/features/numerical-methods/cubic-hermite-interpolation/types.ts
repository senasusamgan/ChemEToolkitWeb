export interface CubicHermiteInterpolationInput {
  x0: number
  x1: number
  y0: number
  y1: number
  derivative0: number
  derivative1: number
  evaluationX: number
}

export interface CubicHermiteInterpolationResult {
  interpolatedValue: number
  interpolatedDerivative: number
  normalizedCoordinate: number
  h00: number
  h10: number
  h01: number
  h11: number
  modelName: string
  limitationDescription: string
}
