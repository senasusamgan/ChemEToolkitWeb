export interface CubicRouthHurwitzStabilityInput {
  coefficient3: number
  coefficient2: number
  coefficient1: number
  coefficient0: number
}

export interface CubicRouthHurwitzStabilityResult {
  normalizedCoefficient3: number
  normalizedCoefficient2: number
  normalizedCoefficient1: number
  normalizedCoefficient0: number
  thirdRowFirstElement: number
  stabilityDeterminant: number
  minimumFirstColumnValue: number
  rightHalfPlaneRootCount: number
  stabilityClassification: string
  modelName: string
  limitationDescription: string
}
