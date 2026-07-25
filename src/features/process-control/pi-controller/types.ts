export interface PIControllerInput {
  controllerBias: number
  controllerGain: number
  integralTime: number
  currentError: number
  previousIntegralState: number
  sampleTime: number
  minimumOutput: number
  maximumOutput: number
}

export interface PIControllerResult {
  proportionalContribution: number
  updatedIntegralState: number
  integralContribution: number
  rawOutput: number
  controllerOutput: number
  outputWasLimited: boolean
  modelName: string
  limitationDescription: string
}
