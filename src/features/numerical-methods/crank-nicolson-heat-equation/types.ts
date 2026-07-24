export interface CrankNicolsonHeatEquationInput {
  thermalDiffusivity: number
  slabLength: number
  initialTemperature: number
  leftBoundaryTemperature: number
  rightBoundaryTemperature: number
  finalTime: number
  spatialNodes: number
  timeStep: number
}

export interface CrankNicolsonHeatEquationResult {
  centerTemperature: number
  minimumTemperature: number
  maximumTemperature: number
  averageTemperature: number
  spatialStep: number
  effectiveTimeStep: number
  timeSteps: number
  fourierNumber: number
  profile: number[]
  modelName: string
  limitationDescription: string
}
