export interface OneDimensionalWaveEquationInput {
  waveSpeed: number
  domainLength: number
  initialAmplitude: number
  finalTime: number
  spatialNodes: number
  timeStep: number
}

export interface OneDimensionalWaveEquationResult {
  centerDisplacement: number
  maximumAbsoluteDisplacement: number
  rootMeanSquareDisplacement: number
  spatialStep: number
  effectiveTimeStep: number
  timeSteps: number
  courantNumber: number
  profile: number[]
  modelName: string
  limitationDescription: string
}
