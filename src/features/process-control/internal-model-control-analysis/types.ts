export interface InternalModelControlAnalysisInput {
  actualProcessGain: number
  actualTimeConstant: number
  actualDeadTime: number
  modelProcessGain: number
  modelTimeConstant: number
  modelDeadTime: number
  filterTimeConstant: number
  angularFrequency: number
}

export interface InternalModelControlAnalysisResult {
  controllerMagnitude: number
  controllerPhaseDegrees: number
  closedLoopMagnitude: number
  closedLoopPhaseDegrees: number
  modelMismatchMagnitude: number
  robustnessDenominatorMagnitude: number
  nominalClosedLoopMagnitude: number
  lowFrequencyControllerGain: number
  modelName: string
  limitationDescription: string
}
