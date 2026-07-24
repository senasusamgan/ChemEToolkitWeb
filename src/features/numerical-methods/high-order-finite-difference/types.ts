export interface HighOrderFiniteDifferenceInput {
  coefficient4: number
  coefficient3: number
  coefficient2: number
  coefficient1: number
  coefficient0: number
  evaluationX: number
  stepSize: number
}

export interface HighOrderFiniteDifferenceResult {
  firstDerivative: number
  secondDerivative: number
  exactFirstDerivative: number
  exactSecondDerivative: number
  firstDerivativeAbsoluteError: number
  secondDerivativeAbsoluteError: number
  modelName: string
  limitationDescription: string
}
