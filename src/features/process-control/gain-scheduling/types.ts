export interface GainSchedulingInput {
  operatingPoint: number
  lowOperatingPoint: number
  highOperatingPoint: number
  lowControllerGain: number
  highControllerGain: number
  lowIntegralTime: number
  highIntegralTime: number
  lowDerivativeTime: number
  highDerivativeTime: number
}

export interface GainSchedulingResult {
  interpolationFraction: number
  effectiveOperatingPoint: number
  scheduledControllerGain: number
  scheduledIntegralTime: number
  scheduledDerivativeTime: number
  scheduledIntegralGain: number
  scheduledDerivativeGain: number
  wasClamped: boolean
  modelName: string
  limitationDescription: string
}
