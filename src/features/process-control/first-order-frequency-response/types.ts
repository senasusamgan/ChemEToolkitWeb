export interface FirstOrderFrequencyResponseInput {
  processGain: number
  timeConstant: number
  angularFrequency: number
}

export interface FirstOrderFrequencyResponseResult {
  magnitudeRatio: number
  magnitudeDecibels: number
  phaseDegrees: number
  realPart: number
  imaginaryPart: number
  cornerAngularFrequency: number
  cornerFrequencyHertz: number
  normalizedFrequency: number
  modelName: string
  limitationDescription: string
}
