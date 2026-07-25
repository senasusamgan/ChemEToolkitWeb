export interface PressureProcessDynamicsInput {
  vesselVolume: number
  gasTemperature: number
  gasConstant: number
  molarInflowRate: number
  outletPressure: number
  pressureFlowResistance: number
  initialPressure: number
  evaluationTime: number
  maximumAllowablePressure: number
}

export interface PressureProcessDynamicsResult {
  processTimeConstant: number
  steadyStatePressure: number
  pressureAtEvaluationTime: number
  molarOutflowAtEvaluationTime: number
  responseFraction: number
  pressureMargin: number
  overpressureRisk: boolean
  modelName: string
  limitationDescription: string
}
