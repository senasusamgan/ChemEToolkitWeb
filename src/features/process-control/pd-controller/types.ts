export interface PDControllerInput {
  controllerBias: number
  controllerGain: number
  derivativeTime: number
  currentError: number
  previousError: number
  sampleTime: number
  minimumOutput: number
  maximumOutput: number
}

export interface PDControllerResult {
  errorDerivative: number
  proportionalContribution: number
  derivativeContribution: number
  rawOutput: number
  controllerOutput: number
  outputWasLimited: boolean
  modelName: string
  limitationDescription: string
}
