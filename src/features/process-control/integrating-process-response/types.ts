export interface IntegratingProcessResponseInput {
  integratingGain: number
  initialOutput: number
  inputStepChange: number
  deadTime: number
  evaluationTime: number
}

export interface IntegratingProcessResponseResult {
  activeIntegrationTime: number
  outputChange: number
  outputAtEvaluationTime: number
  rampSlope: number
  deadTimeCompleted: boolean
  timeToReachTargetChange: number
  targetOutputChange: number
  modelName: string
  limitationDescription: string
}
