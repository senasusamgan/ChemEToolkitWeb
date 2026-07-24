export interface MethodOfLinesPDESolverInput {
  diffusivity: number
  domainLength: number
  leftBoundary: number
  rightBoundary: number
  initialInteriorValue: number
  finalTime: number
  interiorNodes: number
  timeStep: number
}

export interface MethodOfLinesPDESolverResult {
  centerValue: number
  minimumValue: number
  maximumValue: number
  averageValue: number
  spatialStep: number
  timeSteps: number
  effectiveTimeStep: number
  explicitStabilityNumber: number
  profile: number[]
  modelName: string
  limitationDescription: string
}
