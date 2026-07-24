export interface AdamsBashforthMoultonInput {
  initialX: number
  finalX: number
  initialY: number
  coefficientA: number
  forcingB: number
  stepSize: number
}

export interface AdamsBashforthMoultonResult {
  finalY: number
  finalX: number
  stepCount: number
  lastPredictor: number
  lastCorrector: number
  lastCorrectionMagnitude: number
  maximumCorrectionMagnitude: number
  modelName: string
  limitationDescription: string
}
