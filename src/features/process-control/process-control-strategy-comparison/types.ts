export interface ProcessControlStrategyComparisonInput {
  processGain: number
  feedbackControllerGain: number
  measurementGain: number
  disturbanceGain: number
  disturbanceMagnitude: number
  feedforwardModelGain: number
  secondaryControllerGain: number
  secondaryProcessGain: number
}

export interface ProcessControlStrategyComparisonResult {
  uncontrolledDeviation: number
  feedbackResidual: number
  feedforwardFeedbackResidual: number
  cascadeResidual: number
  feedbackReductionPercent: number
  feedforwardReductionPercent: number
  cascadeReductionPercent: number
  bestStrategy: string
  modelName: string
  limitationDescription: string
}
