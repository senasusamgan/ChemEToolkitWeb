export interface LinearInterpolationInput {
  firstX: number
  firstY: number
  secondX: number
  secondY: number
  targetX: number
}

export interface LinearInterpolationResult {
  interpolatedY: number
  interpolationFraction: number
  intervalWidth: number
  isExtrapolation: boolean
  modelName: string
  limitationDescription: string
}
