export interface ThomasTridiagonalSolverInput {
  lower1: number
  lower2: number
  lower3: number
  diagonal1: number
  diagonal2: number
  diagonal3: number
  diagonal4: number
  upper1: number
  upper2: number
  upper3: number
  rhs1: number
  rhs2: number
  rhs3: number
  rhs4: number
}

export interface ThomasTridiagonalSolverResult {
  x1: number
  x2: number
  x3: number
  x4: number
  residualNorm: number
  minimumModifiedPivot: number
  modelName: string
  limitationDescription: string
}
