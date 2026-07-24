export interface CholeskyDecompositionSolverInput {
  a11: number
  a12: number
  a13: number
  a22: number
  a23: number
  a33: number
  b1: number
  b2: number
  b3: number
}

export interface CholeskyDecompositionSolverResult {
  x1: number
  x2: number
  x3: number
  l11: number
  l21: number
  l31: number
  l22: number
  l32: number
  l33: number
  determinant: number
  residualNorm: number
  modelName: string
  limitationDescription: string
}
