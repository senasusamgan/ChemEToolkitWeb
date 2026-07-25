export interface CohenCoonTuningInput {
  processGain: number
  processTimeConstant: number
  processDeadTime: number
}

export interface CohenCoonTuningResult {
  deadTimeRatio: number
  controllerGain: number
  integralTime: number
  derivativeTime: number
  integralGain: number
  derivativeGain: number
  recommendedSampleTime: number
  modelName: string
  limitationDescription: string
}
