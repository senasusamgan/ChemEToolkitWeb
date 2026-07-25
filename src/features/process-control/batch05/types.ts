export type ProcessControlBatch05Mode =
  | 'mimoDecouplingControl'
  | 'adaptiveControl'
  | 'ratioControl'
  | 'secondOrderFrequencyResponse'
  | 'smithPredictor'
  | 'splitRangeControl'

export interface MIMODecouplingInput {
  k11: number
  k12: number
  k21: number
  k22: number
  outputTarget1: number
  outputTarget2: number
}

export interface MIMODecouplingResult {
  determinant: number
  manipulatedInput1: number
  manipulatedInput2: number
  relativeGain11: number
  relativeGain12: number
  relativeGain21: number
  relativeGain22: number
  conditionEstimate: number
  interactionIndex: number
}

export interface AdaptiveControlInput {
  currentGainEstimate: number
  currentBiasEstimate: number
  manipulatedInput: number
  measuredOutput: number
  adaptationGain: number
  sampleTime: number
  normalizationConstant: number
}

export interface AdaptiveControlResult {
  predictedOutputBeforeUpdate: number
  predictionError: number
  updatedGainEstimate: number
  updatedBiasEstimate: number
  predictedOutputAfterUpdate: number
  normalizedAdaptationStep: number
}

export interface RatioControlInput {
  wildFlow: number
  desiredRatio: number
  measuredControlledFlow: number
  controllerGain: number
  controllerBias: number
  minimumOutput: number
  maximumOutput: number
}

export interface RatioControlResult {
  controlledFlowSetpoint: number
  flowError: number
  rawControllerOutput: number
  controllerOutput: number
  outputWasLimited: boolean
  actualMeasuredRatio: number
}

export interface SecondOrderFrequencyResponseInput {
  processGain: number
  naturalFrequency: number
  dampingRatio: number
  angularFrequency: number
}

export interface SecondOrderFrequencyResponseResult {
  magnitudeRatio: number
  magnitudeDecibels: number
  phaseDegrees: number
  realPart: number
  imaginaryPart: number
  normalizedFrequency: number
  resonantFrequency: number | null
  resonantPeak: number | null
}

export interface SmithPredictorInput {
  actualProcessGain: number
  actualTimeConstant: number
  actualDeadTime: number
  modelProcessGain: number
  modelTimeConstant: number
  modelDeadTime: number
  controllerGain: number
  setpointStep: number
  evaluationTime: number
}

export interface SmithPredictorResult {
  modelLoopGain: number
  nominalClosedLoopGain: number
  nominalClosedLoopTimeConstant: number
  delayFreePrediction: number
  delayedModelPrediction: number
  approximateActualOutput: number
  modelMismatch: number
  effectiveResponseTime: number
}

export interface SplitRangeControlInput {
  controllerDemandPercent: number
  splitPointPercent: number
  overlapBandPercent: number
  firstValveMinimumPercent: number
  firstValveMaximumPercent: number
  secondValveMinimumPercent: number
  secondValveMaximumPercent: number
}

export interface SplitRangeControlResult {
  firstValveOpeningPercent: number
  secondValveOpeningPercent: number
  activeRegion: string
  simultaneousOperation: boolean
  firstValveSpanFraction: number
  secondValveSpanFraction: number
}
