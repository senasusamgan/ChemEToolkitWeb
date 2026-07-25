export type ProcessControlBatch06Mode =
  | 'temperatureProcessDynamics'
  | 'transferFunctionBuilder'
  | 'valveCharacteristics'
  | 'zieglerNicholsUltimateGain'

export interface TemperatureProcessDynamicsInput {
  thermalCapacitance: number
  heatTransferConductance: number
  ambientTemperature: number
  heatInputRate: number
  initialTemperature: number
  evaluationTime: number
  maximumAllowableTemperature: number
}

export interface TemperatureProcessDynamicsResult {
  processTimeConstant: number
  steadyStateTemperature: number
  temperatureAtEvaluationTime: number
  responseFraction: number
  initialHeatingRate: number
  heatLossAtEvaluationTime: number
  temperatureMargin: number
  overtemperatureRisk: boolean
}

export interface TransferFunctionBuilderInput {
  processGain: number
  firstTimeConstant: number
  secondTimeConstant: number
  deadTime: number
  integratorOrder: number
  angularFrequency: number
}

export interface TransferFunctionBuilderResult {
  transferFunctionExpression: string
  frequencyDomainExpression: string
  realPart: number
  imaginaryPart: number
  magnitudeRatio: number
  magnitudeDecibels: number
  phaseDegrees: number
  poleOne: number
  poleTwo: number
}

export interface ValveCharacteristicsInput {
  characteristicMode: number
  ratedFlowCoefficient: number
  valveTravelPercent: number
  rangeability: number
  pressureDrop: number
  liquidSpecificGravity: number
}

export interface ValveCharacteristicsResult {
  characteristicName: string
  normalizedTravel: number
  normalizedFlowCoefficient: number
  effectiveFlowCoefficient: number
  estimatedLiquidFlowRate: number
  normalizedCharacteristicSlope: number
  effectiveCvSlopePerPercentTravel: number
  turndownFromRated: number
}

export interface ZieglerNicholsUltimateGainInput {
  controllerMode: number
  ultimateGain: number
  ultimatePeriod: number
}

export interface ZieglerNicholsUltimateGainResult {
  controllerModeName: string
  controllerGain: number
  integralTime: number
  derivativeTime: number
  integralGain: number
  derivativeGain: number
  recommendedSampleTime: number
  proportionalBandPercent: number
}
