export interface AdaptiveRungeKutta45Input {
  initialX: number
  finalX: number
  initialY: number
  coefficientA: number
  forcingB: number
  initialStepSize: number
  absoluteTolerance: number
  relativeTolerance: number
  maximumSteps: number
}

export interface AdaptiveRungeKutta45Result {
  finalY: number
  acceptedSteps: number
  rejectedSteps: number
  totalAttempts: number
  minimumAcceptedStep: number
  maximumAcceptedStep: number
  lastErrorEstimate: number
  finalStepSize: number
  modelName: string
  limitationDescription: string
}
