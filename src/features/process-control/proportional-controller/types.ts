export interface ProportionalControllerInput {
  controllerBias: number
  controllerGain: number
  setpoint: number
  measuredValue: number
  minimumOutput: number
  maximumOutput: number
}

export interface ProportionalControllerResult {
  controlError: number
  proportionalCorrection: number
  rawOutput: number
  controllerOutput: number
  outputWasLimited: boolean
  outputPositionPercent: number
  modelName: string
  limitationDescription: string
}
