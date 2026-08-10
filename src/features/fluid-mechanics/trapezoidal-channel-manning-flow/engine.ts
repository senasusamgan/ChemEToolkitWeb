import type {
  OpenChannelFlowRegime,
  TrapezoidalChannelManningFlowInput,
  TrapezoidalChannelManningFlowResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_MANNING_FLOW_ENGINE_VERSION =
  'trapezoidal-channel-manning-flow-v1'

export type TrapezoidalChannelManningFlowErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_FLOW_DEPTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelManningFlowError
  extends Error {
  readonly code:
    TrapezoidalChannelManningFlowErrorCode

  constructor(
    code:
      TrapezoidalChannelManningFlowErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelManningFlowError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

function determineFlowRegime(
  froudeNumber: number,
): OpenChannelFlowRegime {
  if (
    Math.abs(
      froudeNumber -
      1,
    ) <=
    1e-9
  ) {
    return 'critical'
  }

  if (
    froudeNumber < 1
  ) {
    return 'subcritical'
  }

  return 'supercritical'
}

export function calculateTrapezoidalChannelManningFlow(
  input:
    TrapezoidalChannelManningFlowInput,
): TrapezoidalChannelManningFlowResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.flowDepth,
    ) ||
    input.flowDepth <= 0
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'INVALID_FLOW_DEPTH',
      'Flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <= 0
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'INVALID_CHANNEL_SLOPE',
      'Channel energy slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <= 0
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const z =
    input.sideSlopeHorizontalPerVertical

  const y =
    input.flowDepth

  const b =
    input.bottomWidth

  const flowArea =
    y *
    (
      b +
      z *
      y
    )

  const wettedPerimeter =
    b +
    2 *
    y *
    Math.sqrt(
      1 +
      z *
      z,
    )

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const topWidth =
    b +
    2 *
    z *
    y

  const hydraulicDepth =
    flowArea /
    topWidth

  const volumetricFlowRate =
    (
      1 /
      input.manningRoughness
    ) *
    flowArea *
    hydraulicRadius **
      (
        2 / 3
      ) *
    Math.sqrt(
      input.channelSlope,
    )

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const meanVelocity =
    volumetricFlowRate /
    flowArea

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const flowRegime =
    determineFlowRegime(
      froudeNumber,
    )

  const boundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    hydraulicRadius *
    input.channelSlope

  const velocityHead =
    (
      meanVelocity *
      meanVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergy =
    flowDepthSafe(
      y,
    ) +
    velocityHead

  const recoveredManningRoughness =
    (
      flowArea *
      hydraulicRadius **
        (
          2 / 3
        ) *
      Math.sqrt(
        input.channelSlope,
      )
    ) /
    volumetricFlowRate

  const manningClosureResidual =
    recoveredManningRoughness -
    input.manningRoughness

  const positiveValues = [
    flowArea,

    wettedPerimeter,

    hydraulicRadius,

    topWidth,

    hydraulicDepth,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    meanVelocity,

    froudeNumber,

    boundaryShearStress,

    velocityHead,

    specificEnergy,

    recoveredManningRoughness,
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
      manningClosureResidual,
    ) ||
    Math.abs(
      manningClosureResidual,
    ) >
      Math.max(
        1e-12,
        input.manningRoughness *
          1e-10,
      )
  ) {
    throw new TrapezoidalChannelManningFlowError(
      'NUMERICAL_FAILURE',
      'The Manning-flow calculation failed its roughness-coefficient closure check.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    flowDepth:
      input.flowDepth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    channelSlope:
      input.channelSlope,

    manningRoughness:
      input.manningRoughness,

    flowArea,

    wettedPerimeter,

    hydraulicRadius,

    topWidth,

    hydraulicDepth,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    meanVelocity,

    froudeNumber,

    flowRegime,

    boundaryShearStress,

    velocityHead,

    specificEnergy,

    recoveredManningRoughness,

    manningClosureResidual,

    modelName:
      'Trapezoidal Open-Channel Flow — Manning Equation',

    limitationDescription:
      'Uniform steady open-channel flow using the SI Manning equation. The channel is assumed prismatic with trapezoidal geometry, and the supplied channel slope is treated as the energy slope. Local transitions, backwater effects, rapidly varied flow and nonuniform roughness are not included.',
  }
}

function flowDepthSafe(
  value: number,
): number {
  return value
}

export function createTrapezoidalChannelManningFlowCsv(
  input:
    TrapezoidalChannelManningFlowInput,
  result:
    TrapezoidalChannelManningFlowResult,
): string {
  const rows = [
    [
      'Trapezoidal Open-Channel Flow — Manning Equation',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Bottom width',
      input.bottomWidth,
      'm',
    ],
    [
      'Flow depth',
      input.flowDepth,
      'm',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Channel slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'Manning roughness',
      input.manningRoughness,
      's/m^(1/3)',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Flow area',
      result.flowArea,
      'm2',
    ],
    [
      'Wetted perimeter',
      result.wettedPerimeter,
      'm',
    ],
    [
      'Hydraulic radius',
      result.hydraulicRadius,
      'm',
    ],
    [
      'Top width',
      result.topWidth,
      'm',
    ],
    [
      'Hydraulic depth',
      result.hydraulicDepth,
      'm',
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
      'Mean velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Froude number',
      result.froudeNumber,
      '-',
    ],
    [
      'Flow regime',
      result.flowRegime,
      '-',
    ],
    [
      'Boundary shear stress',
      result.boundaryShearStress,
      'Pa',
    ],
    [
      'Specific energy',
      result.specificEnergy,
      'm',
    ],
    [
      'Recovered Manning roughness',
      result.recoveredManningRoughness,
      's/m^(1/3)',
    ],
    [
      'Manning closure residual',
      result.manningClosureResidual,
      's/m^(1/3)',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
