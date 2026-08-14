import type {
  PartiallyFullCircularChannelManningFlowInput,
  PartiallyFullCircularChannelManningFlowResult,
} from './types.ts'

export const PARTIALLY_FULL_CIRCULAR_CHANNEL_MANNING_FLOW_ENGINE_VERSION =
  'partially-full-circular-channel-manning-flow-v1'

export type PartiallyFullCircularChannelManningFlowErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_DEPTH'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class PartiallyFullCircularChannelManningFlowError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelManningFlowErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelManningFlowErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelManningFlowError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665


export function calculatePartiallyFullCircularChannelManningFlow(
  input:
    PartiallyFullCircularChannelManningFlowInput,
): PartiallyFullCircularChannelManningFlowResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelManningFlowError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.flowDepth,
    ) ||
    input.flowDepth <=
      0 ||
    input.flowDepth >=
      input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelManningFlowError(
      'INVALID_FLOW_DEPTH',
      'Flow depth must satisfy 0 < y < D for a partially full circular channel.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <=
      0
  ) {
    throw new PartiallyFullCircularChannelManningFlowError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <=
      0
  ) {
    throw new PartiallyFullCircularChannelManningFlowError(
      'INVALID_CHANNEL_SLOPE',
      'Channel slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelManningFlowError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const diameter =
    input.pipeDiameter

  const radius =
    diameter /
    2

  const depthRatio =
    input.flowDepth /
    diameter

  const cosineArgument =
    (
      radius -
      input.flowDepth
    ) /
    radius

  const boundedCosineArgument =
    Math.min(
      1,
      Math.max(
        -1,
        cosineArgument,
      ),
    )

  const centralAngleRadians =
    2 *
    Math.acos(
      boundedCosineArgument,
    )

  const centralAngleDegrees =
    centralAngleRadians *
    180 /
    Math.PI

  const flowArea =
    radius *
    radius /
    2 *
    (
      centralAngleRadians -
      Math.sin(
        centralAngleRadians,
      )
    )

  const fullFlowArea =
    Math.PI *
    diameter *
    diameter /
    4

  const areaRatioToFull =
    flowArea /
    fullFlowArea

  const wettedPerimeter =
    radius *
    centralAngleRadians

  const fullWettedPerimeter =
    Math.PI *
    diameter

  const wettedPerimeterRatioToFull =
    wettedPerimeter /
    fullWettedPerimeter

  const topWidth =
    2 *
    radius *
    Math.sin(
      centralAngleRadians /
      2
    )

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const fullFlowHydraulicRadius =
    diameter /
    4

  const hydraulicRadiusRatioToFull =
    hydraulicRadius /
    fullFlowHydraulicRadius

  const hydraulicDepth =
    flowArea /
    topWidth

  const slopeRoot =
    Math.sqrt(
      input.channelSlope,
    )

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
    slopeRoot

  const fullFlowVolumetricFlowRate =
    (
      1 /
      input.manningRoughness
    ) *
    fullFlowArea *
    fullFlowHydraulicRadius **
      (
        2 / 3
      ) *
    slopeRoot

  const flowRateRatioToFull =
    volumetricFlowRate /
    fullFlowVolumetricFlowRate

  const meanVelocity =
    volumetricFlowRate /
    flowArea

  const fullFlowMeanVelocity =
    fullFlowVolumetricFlowRate /
    fullFlowArea

  const velocityRatioToFull =
    meanVelocity /
    fullFlowMeanVelocity

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const flowRegime =
    Math.abs(
      froudeNumber -
      1
    ) <=
    1e-6
      ? 'Critical'
      : froudeNumber <
        1
        ? 'Subcritical'
        : 'Supercritical'

  const averageBoundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    hydraulicRadius *
    input.channelSlope

  const hydraulicPowerDissipationPerUnitLength =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    volumetricFlowRate *
    input.channelSlope

  const positiveValues = [
    radius,

    depthRatio,

    centralAngleRadians,

    centralAngleDegrees,

    flowArea,

    fullFlowArea,

    areaRatioToFull,

    wettedPerimeter,

    fullWettedPerimeter,

    wettedPerimeterRatioToFull,

    topWidth,

    hydraulicRadius,

    fullFlowHydraulicRadius,

    hydraulicRadiusRatioToFull,

    hydraulicDepth,

    volumetricFlowRate,

    fullFlowVolumetricFlowRate,

    flowRateRatioToFull,

    meanVelocity,

    fullFlowMeanVelocity,

    velocityRatioToFull,

    froudeNumber,

    averageBoundaryShearStress,

    hydraulicPowerDissipationPerUnitLength,
  ]

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <=
        0,
    ) ||
    depthRatio >=
      1 ||
    centralAngleRadians >=
      2 *
      Math.PI ||
    flowArea >=
      fullFlowArea ||
    wettedPerimeter >=
      fullWettedPerimeter
  ) {
    throw new PartiallyFullCircularChannelManningFlowError(
      'NUMERICAL_FAILURE',
      'The partially full circular-channel geometry or Manning hydraulic solution failed its physical checks.',
    )
  }

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  return {
    radius,

    depthRatio,

    centralAngleRadians,

    centralAngleDegrees,

    flowArea,

    fullFlowArea,

    areaRatioToFull,

    wettedPerimeter,

    fullWettedPerimeter,

    wettedPerimeterRatioToFull,

    topWidth,

    hydraulicRadius,

    fullFlowHydraulicRadius,

    hydraulicRadiusRatioToFull,

    hydraulicDepth,

    volumetricFlowRate,

    fullFlowVolumetricFlowRate,

    flowRateRatioToFull,

    massFlowRate,

    meanVelocity,

    fullFlowMeanVelocity,

    velocityRatioToFull,

    froudeNumber,

    flowRegime,

    averageBoundaryShearStress,

    hydraulicPowerDissipationPerUnitLength,

    modelName:
      'Manning Flow in a Partially Full Circular Open Channel',

    limitationDescription:
      'Uniform, steady open-channel flow in a circular conduit with a free surface. The flow depth must remain strictly between zero and the conduit diameter. Manning roughness is assumed constant and pressure-flow/full-pipe conditions are outside this model.',
  }
}


export function createPartiallyFullCircularChannelManningFlowCsv(
  input:
    PartiallyFullCircularChannelManningFlowInput,
  result:
    PartiallyFullCircularChannelManningFlowResult,
): string {
  const rows = [
    [
      'Partially Full Circular Channel Flow - Manning',
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
      'Flow depth',
      input.flowDepth,
      'm',
    ],
    [
      'Manning roughness',
      input.manningRoughness,
      '-',
    ],
    [
      'Channel slope',
      input.channelSlope,
      '-',
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
      'Depth ratio y/D',
      result.depthRatio,
      '-',
    ],
    [
      'Central angle',
      result.centralAngleDegrees,
      'deg',
    ],
    [
      'Flow area',
      result.flowArea,
      'm2',
    ],
    [
      'Area ratio to full',
      result.areaRatioToFull,
      '-',
    ],
    [
      'Wetted perimeter',
      result.wettedPerimeter,
      'm',
    ],
    [
      'Top width',
      result.topWidth,
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
      'Volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Full-flow Manning capacity',
      result.fullFlowVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Flow-rate ratio to full',
      result.flowRateRatioToFull,
      '-',
    ],
    [
      'Mean velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Velocity ratio to full',
      result.velocityRatioToFull,
      '-',
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
      'Average boundary shear stress',
      result.averageBoundaryShearStress,
      'Pa',
    ],
    [
      'Hydraulic power dissipation per unit length',
      result.hydraulicPowerDissipationPerUnitLength,
      'W/m',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
