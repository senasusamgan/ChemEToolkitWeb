export interface ClosedLoopFeedbackAnalysisInput {
  controllerGain: number
  processGain: number
  measurementGain: number
  processTimeConstant: number
  setpointStep: number
  loadDisturbance: number
  evaluationTime: number
}

export interface ClosedLoopFeedbackAnalysisResult {
  loopGain: number
  closedLoopSetpointGain: number
  closedLoopDisturbanceGain: number
  closedLoopTimeConstant: number
  steadyStateOutput: number
  outputAtEvaluationTime: number
  responseFraction: number
  steadyStateError: number
  modelName: string
  limitationDescription: string
}
