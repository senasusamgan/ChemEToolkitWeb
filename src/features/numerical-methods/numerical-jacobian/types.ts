export interface NumericalJacobianInput {
  x: number
  y: number
  circleConstant: number
  exponentialConstant: number
  stepX: number
  stepY: number
}

export interface NumericalJacobianResult {
  j11: number
  j12: number
  j21: number
  j22: number
  determinant: number
  analyticalJ11: number
  analyticalJ12: number
  analyticalJ21: number
  analyticalJ22: number
  maximumAbsoluteError: number
  conditionIndicator: number
  modelName: string
  limitationDescription: string
}
