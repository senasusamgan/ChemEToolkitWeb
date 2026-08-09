export type UltrasonicFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface UltrasonicTransitTimeFlowMeterInput {
  pipeDiameter: number

  acousticPathLength: number

  acousticPathAngleDegrees: number

  downstreamTransitTimeMicroseconds: number

  upstreamTransitTimeMicroseconds: number

  fluidDensity: number

  dynamicViscosity: number
}

export interface UltrasonicTransitTimeFlowMeterResult {
  pipeDiameter: number

  pipeCrossSectionalArea: number

  acousticPathLength: number

  acousticPathAngleDegrees: number

  acousticPathAngleRadians: number

  downstreamTransitTime: number

  upstreamTransitTime: number

  transitTimeDifference: number

  reciprocalTimeDifference: number

  axialVelocity: number

  acousticPathVelocityComponent: number

  acousticVelocity: number

  volumetricFlowRate: number

  volumetricFlowRateCubicMetersPerHour:
    number

  volumetricFlowRateLitersPerSecond:
    number

  massFlowRate: number

  reynoldsNumber: number

  flowRegime: UltrasonicFlowRegime

  flowMachNumber: number

  reconstructedDownstreamTransitTime:
    number

  reconstructedUpstreamTransitTime:
    number

  downstreamClosureResidual:
    number

  upstreamClosureResidual:
    number

  modelName: string

  limitationDescription: string
}
