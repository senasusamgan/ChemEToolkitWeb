export type FlowNozzleRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface FlowNozzleDifferentialPressureInput {
  pipeDiameter: number

  nozzleDiameter: number

  differentialPressure: number

  fluidDensity: number

  dynamicViscosity: number

  dischargeCoefficient: number
}

export interface FlowNozzleDifferentialPressureResult {
  pipeDiameter: number

  nozzleDiameter: number

  betaRatio: number

  pipeArea: number

  nozzleArea: number

  areaRatio: number

  differentialPressure: number

  idealVolumetricFlowRate: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  pipeVelocity: number

  nozzleVelocity: number

  reynoldsNumber: number

  flowRegime: FlowNozzleRegime

  differentialPressureHead: number

  modelName: string

  limitationDescription: string
}
