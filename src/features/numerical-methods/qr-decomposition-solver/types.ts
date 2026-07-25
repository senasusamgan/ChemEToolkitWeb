export interface QRDecompositionSolverInput {
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

export interface QRDecompositionSolverResult {
  x1: number
  x2: number
  x3: number
  residualNorm: number
  orthogonalityError: number
  determinantEstimate: number
  r11: number
  r22: number
  r33: number
  modelName: string
  limitationDescription: string
}
