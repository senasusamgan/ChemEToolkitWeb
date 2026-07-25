export interface FeedforwardControlInput {
  actualDisturbanceGain: number
  actualProcessGain: number
  modelDisturbanceGain: number
  modelProcessGain: number
  disturbanceChange: number
  feedbackLoopGain: number
}

export interface FeedforwardControlResult {
  idealFeedforwardGain: number
  implementedFeedforwardGain: number
  uncompensatedDeviation: number
  feedforwardResidual: number
  finalResidualWithFeedback: number
  compensationPercent: number
  modelGainMismatchPercent: number
  modelName: string
  limitationDescription: string
}
