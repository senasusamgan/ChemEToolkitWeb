export interface OpenLoopResponseInput {
  processGain: number
  timeConstant: number
  deadTime: number
  inputStepChange: number
  initialOutput: number
  evaluationTime: number
}

export interface OpenLoopResponseResult {
  activeResponseTime: number
  responseFraction: number
  outputChange: number
  outputAtEvaluationTime: number
  steadyStateOutput: number
  initialSlopeAfterDeadTime: number
  timeToNinetyPercent: number
  modelName: string
  limitationDescription: string
}
