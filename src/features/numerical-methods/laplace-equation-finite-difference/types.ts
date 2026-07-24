export interface LaplaceEquationFiniteDifferenceInput {
  topBoundary: number
  bottomBoundary: number
  leftBoundary: number
  rightBoundary: number
  interiorNodesPerSide: number
  tolerance: number
  maximumIterations: number
  relaxationFactor: number
}

export interface LaplaceEquationFiniteDifferenceResult {
  centerValue: number
  minimumValue: number
  maximumValue: number
  averageInteriorValue: number
  iterations: number
  converged: boolean
  maximumUpdate: number
  grid: number[][]
  modelName: string
  limitationDescription: string
}
