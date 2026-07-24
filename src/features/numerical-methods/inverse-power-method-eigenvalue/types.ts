export interface InversePowerMethodEigenvalueInput {
  a11: number
  a12: number
  a13: number
  a21: number
  a22: number
  a23: number
  a31: number
  a32: number
  a33: number
  shift: number
  initialX1: number
  initialX2: number
  initialX3: number
  tolerance: number
  maximumIterations: number
}

export interface InversePowerMethodEigenvalueResult {
  eigenvalue: number
  eigenvector1: number
  eigenvector2: number
  eigenvector3: number
  iterations: number
  converged: boolean
  residualNorm: number
  shiftedInverseEstimate: number
  modelName: string
  limitationDescription: string
}
