export interface LUDecompositionSolverInput {
  a11: number
  a12: number
  a13: number
  a21: number
  a22: number
  a23: number
  a31: number
  a32: number
  a33: number
  b1: number
  b2: number
  b3: number
}

export interface LUDecompositionSolverResult {
  x1: number
  x2: number
  x3: number
  determinant: number
  residualNorm: number
  lower11: number
  lower21: number
  lower22: number
  lower31: number
  lower32: number
  lower33: number
  upper11: number
  upper12: number
  upper13: number
  upper22: number
  upper23: number
  upper33: number
  modelName: string
  limitationDescription: string
}
