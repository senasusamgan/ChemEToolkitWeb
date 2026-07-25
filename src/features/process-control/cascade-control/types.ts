export interface CascadeControlInput {
  primaryControllerGain: number
  secondaryControllerGain: number
  primaryProcessGain: number
  secondaryProcessGain: number
  primaryMeasurementGain: number
  secondaryMeasurementGain: number
  primarySetpoint: number
  secondaryDisturbance: number
}

export interface CascadeControlResult {
  secondaryLoopGain: number
  secondaryClosedLoopGain: number
  secondaryDisturbanceAttenuation: number
  primaryLoopGain: number
  primaryClosedLoopGain: number
  setpointContribution: number
  disturbanceContribution: number
  primaryOutput: number
  modelName: string
  limitationDescription: string
}
