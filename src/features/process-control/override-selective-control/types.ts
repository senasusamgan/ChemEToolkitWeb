export interface OverrideSelectiveControlInput {
  selectorMode: number
  normalControllerDemand: number
  firstConstraintDemand: number
  secondConstraintDemand: number
  minimumOutput: number
  maximumOutput: number
}

export interface OverrideSelectiveControlResult {
  selectedDemand: number
  selectedSource: string
  constrainedOutput: number
  overrideActive: boolean
  outputWasClamped: boolean
  normalDemandDeviation: number
  selectorDescription: string
  modelName: string
  limitationDescription: string
}
