export interface VariableAreaRotameterFlowInput {
  fluidDensity: number

  floatDensity: number

  floatVolume: number

  floatProjectedArea: number

  annularFlowArea: number

  dragCoefficient: number
}

export interface VariableAreaRotameterFlowResult {
  fluidDensity: number

  floatDensity: number

  floatVolume: number

  floatProjectedArea: number

  annularFlowArea: number

  dragCoefficient: number

  floatWeight: number

  buoyancyForce: number

  effectiveFloatWeight: number

  equilibriumVelocity: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  fluidDynamicPressure: number

  dragForce: number

  forceBalanceResidual: number

  modelName: string

  limitationDescription: string
}
