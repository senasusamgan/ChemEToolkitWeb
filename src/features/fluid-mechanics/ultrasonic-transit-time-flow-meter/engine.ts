import type {
  UltrasonicFlowRegime,
  UltrasonicTransitTimeFlowMeterInput,
  UltrasonicTransitTimeFlowMeterResult,
} from './types.ts'

export const ULTRASONIC_TRANSIT_TIME_FLOW_METER_ENGINE_VERSION =
  'ultrasonic-transit-time-flow-meter-v1'

export type UltrasonicTransitTimeFlowMeterErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_PATH_LENGTH'
  | 'INVALID_PATH_ANGLE'
  | 'INVALID_DOWNSTREAM_TIME'
  | 'INVALID_UPSTREAM_TIME'
  | 'INVALID_TRANSIT_TIME_ORDER'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'INVALID_ACOUSTIC_STATE'
  | 'NUMERICAL_FAILURE'

export class UltrasonicTransitTimeFlowMeterError
  extends Error {
  readonly code:
    UltrasonicTransitTimeFlowMeterErrorCode

  constructor(
    code:
      UltrasonicTransitTimeFlowMeterErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'UltrasonicTransitTimeFlowMeterError'

    this.code =
      code
  }
}

function determineFlowRegime(
  reynoldsNumber: number,
): UltrasonicFlowRegime {
  if (
    reynoldsNumber < 2300
  ) {
    return 'laminar'
  }

  if (
    reynoldsNumber < 4000
  ) {
    return 'transitional'
  }

  return 'turbulent'
}

export function calculateUltrasonicTransitTimeFlowMeter(
  input:
    UltrasonicTransitTimeFlowMeterInput,
): UltrasonicTransitTimeFlowMeterResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.acousticPathLength,
    ) ||
    input.acousticPathLength <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_PATH_LENGTH',
      'Acoustic path length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.acousticPathAngleDegrees,
    ) ||
    input.acousticPathAngleDegrees <= 0 ||
    input.acousticPathAngleDegrees >= 90
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_PATH_ANGLE',
      'Acoustic path angle must be greater than 0° and less than 90° relative to the pipe axis.',
    )
  }

  if (
    !Number.isFinite(
      input.downstreamTransitTimeMicroseconds,
    ) ||
    input.downstreamTransitTimeMicroseconds <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_DOWNSTREAM_TIME',
      'Downstream transit time must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamTransitTimeMicroseconds,
    ) ||
    input.upstreamTransitTimeMicroseconds <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_UPSTREAM_TIME',
      'Upstream transit time must be a positive finite value.',
    )
  }

  if (
    input.upstreamTransitTimeMicroseconds <=
    input.downstreamTransitTimeMicroseconds
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_TRANSIT_TIME_ORDER',
      'For positive flow in the defined direction, upstream transit time must exceed downstream transit time.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dynamicViscosity,
    ) ||
    input.dynamicViscosity <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  const downstreamTransitTime =
    input.downstreamTransitTimeMicroseconds *
    1e-6

  const upstreamTransitTime =
    input.upstreamTransitTimeMicroseconds *
    1e-6

  const acousticPathAngleRadians =
    input.acousticPathAngleDegrees *
    Math.PI /
    180

  const angleCosine =
    Math.cos(
      acousticPathAngleRadians,
    )

  if (
    !Number.isFinite(
      angleCosine,
    ) ||
    angleCosine <= 0
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_PATH_ANGLE',
      'Acoustic path angle does not produce a positive axial projection.',
    )
  }

  const reciprocalTimeDifference =
    (
      1 /
      downstreamTransitTime
    ) -
    (
      1 /
      upstreamTransitTime
    )

  const transitTimeDifference =
    upstreamTransitTime -
    downstreamTransitTime

  const acousticPathVelocityComponent =
    (
      input.acousticPathLength /
      2
    ) *
    reciprocalTimeDifference

  const axialVelocity =
    acousticPathVelocityComponent /
    angleCosine

  const acousticVelocity =
    (
      input.acousticPathLength /
      2
    ) *
    (
      (
        1 /
        downstreamTransitTime
      ) +
      (
        1 /
        upstreamTransitTime
      )
    )

  if (
    !Number.isFinite(
      acousticVelocity,
    ) ||
    acousticVelocity <=
      acousticPathVelocityComponent
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'INVALID_ACOUSTIC_STATE',
      'Transit times imply an invalid acoustic velocity relative to the flow component.',
    )
  }

  const pipeCrossSectionalArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

  const volumetricFlowRate =
    pipeCrossSectionalArea *
    axialVelocity

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const reynoldsNumber =
    (
      input.fluidDensity *
      axialVelocity *
      input.pipeDiameter
    ) /
    input.dynamicViscosity

  const flowRegime =
    determineFlowRegime(
      reynoldsNumber,
    )

  const flowMachNumber =
    axialVelocity /
    acousticVelocity

  const reconstructedDownstreamTransitTime =
    input.acousticPathLength /
    (
      acousticVelocity +
      acousticPathVelocityComponent
    )

  const reconstructedUpstreamTransitTime =
    input.acousticPathLength /
    (
      acousticVelocity -
      acousticPathVelocityComponent
    )

  const downstreamClosureResidual =
    reconstructedDownstreamTransitTime -
    downstreamTransitTime

  const upstreamClosureResidual =
    reconstructedUpstreamTransitTime -
    upstreamTransitTime

  const positiveValues = [
    pipeCrossSectionalArea,

    downstreamTransitTime,

    upstreamTransitTime,

    transitTimeDifference,

    reciprocalTimeDifference,

    axialVelocity,

    acousticPathVelocityComponent,

    acousticVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    flowMachNumber,

    reconstructedDownstreamTransitTime,

    reconstructedUpstreamTransitTime,
  ]

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      downstreamClosureResidual,
    ) ||
    !Number.isFinite(
      upstreamClosureResidual,
    ) ||
    Math.abs(
      downstreamClosureResidual,
    ) >
      1e-12 ||
    Math.abs(
      upstreamClosureResidual,
    ) >
      1e-12
  ) {
    throw new UltrasonicTransitTimeFlowMeterError(
      'NUMERICAL_FAILURE',
      'The ultrasonic transit-time calculation failed its reconstructed-time closure check.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    pipeCrossSectionalArea,

    acousticPathLength:
      input.acousticPathLength,

    acousticPathAngleDegrees:
      input.acousticPathAngleDegrees,

    acousticPathAngleRadians,

    downstreamTransitTime,

    upstreamTransitTime,

    transitTimeDifference,

    reciprocalTimeDifference,

    axialVelocity,

    acousticPathVelocityComponent,

    acousticVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    flowRegime,

    flowMachNumber,

    reconstructedDownstreamTransitTime,

    reconstructedUpstreamTransitTime,

    downstreamClosureResidual,

    upstreamClosureResidual,

    modelName:
      'Ultrasonic Transit-Time Flow Meter',

    limitationDescription:
      'Single-path steady-flow model. The acoustic path angle is measured relative to the pipe axis. The calculated axial acoustic-path velocity is treated as representative of the cross-sectional mean velocity. Real meters may require multi-path integration, profile correction, wall-delay compensation and manufacturer calibration.',
  }
}

export function createUltrasonicTransitTimeFlowMeterCsv(
  input:
    UltrasonicTransitTimeFlowMeterInput,
  result:
    UltrasonicTransitTimeFlowMeterResult,
): string {
  const rows = [
    [
      'Ultrasonic Transit-Time Flow Meter',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Acoustic path length',
      input.acousticPathLength,
      'm',
    ],
    [
      'Acoustic path angle',
      input.acousticPathAngleDegrees,
      'deg',
    ],
    [
      'Downstream transit time',
      input.downstreamTransitTimeMicroseconds,
      'microseconds',
    ],
    [
      'Upstream transit time',
      input.upstreamTransitTimeMicroseconds,
      'microseconds',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [
      'Dynamic viscosity',
      input.dynamicViscosity,
      'Pa s',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Axial fluid velocity',
      result.axialVelocity,
      'm/s',
    ],
    [
      'Acoustic-path velocity component',
      result.acousticPathVelocityComponent,
      'm/s',
    ],
    [
      'Recovered acoustic velocity',
      result.acousticVelocity,
      'm/s',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Reynolds number',
      result.reynoldsNumber,
      '-',
    ],
    [
      'Flow regime',
      result.flowRegime,
      '-',
    ],
    [
      'Transit-time difference',
      result.transitTimeDifference,
      's',
    ],
    [
      'Flow Mach number',
      result.flowMachNumber,
      '-',
    ],
    [
      'Downstream closure residual',
      result.downstreamClosureResidual,
      's',
    ],
    [
      'Upstream closure residual',
      result.upstreamClosureResidual,
      's',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
