export interface BlockDiagramAlgebraInput {
  firstForwardGain: number
  secondForwardGain: number
  feedbackGain: number
  inputSignal: number
}

export interface BlockDiagramAlgebraResult {
  seriesForwardGain: number
  loopGain: number
  closedLoopGain: number
  outputSignal: number
  errorSignal: number
  sensitivity: number
  modelName: string
  limitationDescription: string
}
