export interface ShootingMethodBoundaryValueInput {
  domainLength: number
  frequencySquared: number
  leftBoundaryValue: number
  rightBoundaryValue: number
  initialSlopeGuess1: number
  initialSlopeGuess2: number
  integrationSteps: number
  boundaryTolerance: number
  maximumIterations: number
}

export interface ShootingMethodBoundaryValueResult {
  initialSlope: number
  achievedRightBoundary: number
  boundaryResidual: number
  centerValue: number
  iterations: number
  converged: boolean
  profile: number[]
  modelName: string
  limitationDescription: string
}
