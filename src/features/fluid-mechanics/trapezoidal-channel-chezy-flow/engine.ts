import type {
  TrapezoidalChannelChezyFlowInput,
  TrapezoidalChannelChezyFlowResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_CHEZY_FLOW_ENGINE_VERSION =
  'trapezoidal-channel-chezy-flow-v1'

export type TrapezoidalChannelChezyFlowErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_FLOW_DEPTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_CHEZY_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelChezyFlowError
  extends Error {
  readonly code:
    TrapezoidalChannelChezyFlowErrorCode

  constructor(
    code:
      TrapezoidalChannelChezyFlowErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelChezyFlowError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalChannelChezyFlow(
  input:
    TrapezoidalChannelChezyFlowInput,
): TrapezoidalChannelChezyFlowResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelChezyFlowError(
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
    throw new TrapezoidalChannelChezyFlowError(
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
    throw new TrapezoidalChannelChezyFlowError(
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
    throw new TrapezoidalChannelChezyFlowError(
      'INVALID_CHANNEL_SLOPE',
      'Channel energy slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.chezyCoefficient,
    ) ||
    input.chezyCoefficient <= 0
  ) {
    throw new TrapezoidalChannelChezyFlowError(
      'INVALID_CHEZY_COEFFICIENT',
      'Chezy coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelChezyFlowError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const b =
    input.bottomWidth

  const y =
    input.flowDepth

  const z =
    input.sideSlopeHorizontalPerVertical

  const flowArea =
    y *
    (
      b +
      z *
      y
    )

  const topWidth =
    b +
    2 *
    z *
    y

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

  const hydraulicDepth =
    flowArea /
    topWidth

  const meanVelocity =
    input.chezyCoefficient *
    Math.sqrt(
      hydraulicRadius *
      input.channelSlope,
    )

  const volumetricFlowRate =
    flowArea *
    meanVelocity

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const flowRegime =
    Math.abs(
      froudeNumber -
      1,
    ) <=
    1e-6
      ? 'Critical'
      : froudeNumber < 1
        ? 'Subcritical'
        : 'Supercritical'

  const boundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    hydraulicRadius *
    input.channelSlope

  const specificEnergy =
    y +
    (
      meanVelocity *
      meanVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const equivalentManningRoughness =
    hydraulicRadius **
      (
        1 / 6
      ) /
    input.chezyCoefficient

  const reconstructedManningVelocity =
    (
      1 /
      equivalentManningRoughness
    ) *
    hydraulicRadius **
      (
        2 / 3
      ) *
    Math.sqrt(
      input.channelSlope,
    )

  const reconstructedManningFlowRate =
    flowArea *
    reconstructedManningVelocity

  const flowClosureResidual =
    reconstructedManningFlowRate -
    volumetricFlowRate

  const hydraulicPowerDissipationPerLength =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    volumetricFlowRate *
    input.channelSlope

  const positiveValues = [
    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    massFlowRate,

    froudeNumber,

    boundaryShearStress,

    specificEnergy,

    equivalentManningRoughness,

    reconstructedManningVelocity,

    reconstructedManningFlowRate,

    hydraulicPowerDissipationPerLength,
  ]

  const closureTolerance =
    Math.max(
      1e-12,
      volumetricFlowRate *
      1e-10,
    )

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      flowClosureResidual,
    ) ||
    Math.abs(
      flowClosureResidual,
    ) >
      closureTolerance
  ) {
    throw new TrapezoidalChannelChezyFlowError(
      'NUMERICAL_FAILURE',
      'The Chezy-flow solution failed its geometry or Manning-equivalence closure check.',
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

    chezyCoefficient:
      input.chezyCoefficient,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    massFlowRate,

    froudeNumber,

    flowRegime,

    boundaryShearStress,

    specificEnergy,

    equivalentManningRoughness,

    reconstructedManningVelocity,

    reconstructedManningFlowRate,

    flowClosureResidual,

    hydraulicPowerDissipationPerLength,

    modelName:
      'Trapezoidal Channel Chezy Flow Rate',

    limitationDescription:
      'Steady uniform open-channel flow in a prismatic symmetric trapezoidal section using the Chezy equation. The channel slope is treated as the energy slope. The model does not include gradually varied flow, local controls, backwater effects, transitions or spatially varying resistance.',
  }
}

export function createTrapezoidalChannelChezyFlowCsv(
  input:
    TrapezoidalChannelChezyFlowInput,
  result:
    TrapezoidalChannelChezyFlowResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Chezy Flow Rate',
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
      'Chezy coefficient',
      input.chezyCoefficient,
      'm^0.5/s',
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
      'Top width',
      result.topWidth,
      'm',
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
      'Hydraulic depth',
      result.hydraulicDepth,
      'm',
    ],
    [
      'Mean velocity',
      result.meanVelocity,
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
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
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
      'Equivalent Manning roughness',
      result.equivalentManningRoughness,
      's/m^(1/3)',
    ],
    [
      'Reconstructed Manning velocity',
      result.reconstructedManningVelocity,
      'm/s',
    ],
    [
      'Reconstructed Manning flow rate',
      result.reconstructedManningFlowRate,
      'm3/s',
    ],
    [
      'Flow closure residual',
      result.flowClosureResidual,
      'm3/s',
    ],
    [
      'Hydraulic power dissipation per length',
      result.hydraulicPowerDissipationPerLength,
      'W/m',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
