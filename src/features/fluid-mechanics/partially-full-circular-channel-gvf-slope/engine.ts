import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import type {
  PartiallyFullCircularChannelGvfSlopeInput,
  PartiallyFullCircularChannelGvfSlopeResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_GVF_SLOPE_ENGINE_VERSION =
  'partially-full-circular-channel-gvf-slope-v1'


export type PartiallyFullCircularChannelGvfSlopeErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_FLOW_DEPTH'
  | 'NEAR_CRITICAL_FLOW'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelGvfSlopeError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelGvfSlopeErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelGvfSlopeErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelGvfSlopeError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665


export function calculatePartiallyFullCircularChannelGvfSlope(
  input:
    PartiallyFullCircularChannelGvfSlopeInput,
): PartiallyFullCircularChannelGvfSlopeResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'INVALID_CHANNEL_SLOPE',
      'GVF bed slope must be a positive finite value.',
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
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'INVALID_FLOW_DEPTH',
      'Flow depth must satisfy 0 < y < D.',
    )
  }

  const radius =
    input.pipeDiameter /
    2

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

  const freeSurfaceElevationFromCenter =
    input.flowDepth -
    radius

  const halfTopWidth =
    Math.sqrt(
      Math.max(
        0,
        radius *
        radius -
        freeSurfaceElevationFromCenter *
        freeSurfaceElevationFromCenter,
      ),
    )

  const topWidth =
    2 *
    halfTopWidth

  const wettedPerimeter =
    radius *
    centralAngleRadians

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const meanVelocity =
    input.volumetricFlowRate /
    flowArea

  const velocityHead =
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergy =
    input.flowDepth +
    velocityHead

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const frictionSlope =
    (
      input.manningRoughness *
      input.volumetricFlowRate /
      (
        flowArea *
        hydraulicRadius **
          (
            2 /
            3
          )
      )
    ) **
    2

  const slopeNumerator =
    input.channelSlope -
    frictionSlope

  const froudeDenominator =
    1 -
    froudeNumber *
    froudeNumber

  if (
    Math.abs(
      froudeDenominator,
    ) <=
      1e-6
  ) {
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'NEAR_CRITICAL_FLOW',
      'The GVF differential equation becomes singular near critical flow because 1 − Fr² approaches zero.',
    )
  }

  const depthGradient =
    slopeNumerator /
    froudeDenominator

  const depthChangePer100m =
    depthGradient *
    100

  const critical =
    calculatePartiallyFullCircularChannelCriticalDepth({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      fluidDensity:
        1000,
    })

  const criticalDepthDifference =
    input.flowDepth -
    critical.criticalDepth

  const flowRegime =
    froudeNumber <
      1
      ? 'Subcritical'
      : 'Supercritical'

  const slopeBalanceTolerance =
    Math.max(
      1e-12,
      input.channelSlope *
      1e-9,
      frictionSlope *
      1e-9,
    )

  const slopeBalance =
    Math.abs(
      slopeNumerator,
    ) <=
      slopeBalanceTolerance
      ? 'Bed slope approximately equals friction slope'
      : slopeNumerator >
        0
        ? 'Bed slope exceeds friction slope'
        : 'Friction slope exceeds bed slope'

  const gradientTolerance =
    1e-10

  const localProfileTrend =
    Math.abs(
      depthGradient,
    ) <=
      gradientTolerance
      ? 'Locally uniform depth'
      : depthGradient >
        0
        ? 'Depth increases downstream'
        : 'Depth decreases downstream'

  const finiteValues = [
    flowArea,
    topWidth,
    wettedPerimeter,
    hydraulicRadius,
    hydraulicDepth,
    meanVelocity,
    velocityHead,
    specificEnergy,
    froudeNumber,
    frictionSlope,
    slopeNumerator,
    froudeDenominator,
    depthGradient,
    depthChangePer100m,
    critical.criticalDepth,
    critical.criticalSpecificEnergy,
    criticalDepthDifference,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    flowArea <=
      0 ||
    topWidth <=
      0 ||
    wettedPerimeter <=
      0 ||
    hydraulicRadius <=
      0 ||
    hydraulicDepth <=
      0 ||
    meanVelocity <=
      0 ||
    frictionSlope <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfSlopeError(
      'NUMERICAL_FAILURE',
      'Circular-channel GVF slope calculation failed its geometry or hydraulic checks.',
    )
  }

  return {
    flowDepth:
      input.flowDepth,

    depthRatio:
      input.flowDepth /
      input.pipeDiameter,

    centralAngleDegrees,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    velocityHead,

    specificEnergy,

    froudeNumber,

    frictionSlope,

    channelSlope:
      input.channelSlope,

    slopeNumerator,

    froudeDenominator,

    depthGradient,

    depthChangePer100m,

    criticalDepth:
      critical.criticalDepth,

    criticalSpecificEnergy:
      critical.criticalSpecificEnergy,

    criticalDepthDifference,

    flowRegime,

    slopeBalance,

    localProfileTrend,

    modelName:
      'Partially Full Circular Channel GVF Differential Slope',

    limitationDescription:
      'The local gradually varied flow relation dy/dx = (S0 − Sf)/(1 − Fr²) is evaluated using circular open-channel geometry and Manning friction. The model assumes hydrostatic pressure distribution, gradually varied flow, a prismatic conduit and a free surface below the crown. The equation is singular at critical flow.',
  }
}


function csvCell(
  value: string | number,
): string {
  const text =
    String(
      value,
    )

  if (
    /[",\n]/.test(
      text,
    )
  ) {
    return (
      '"' +
      text.replaceAll(
        '"',
        '""',
      ) +
      '"'
    )
  }

  return text
}


export function createPartiallyFullCircularChannelGvfSlopeCsv(
  input:
    PartiallyFullCircularChannelGvfSlopeInput,
  result:
    PartiallyFullCircularChannelGvfSlopeResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel GVF Differential Slope',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe Diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Volumetric Flow Rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Manning Roughness',
      input.manningRoughness,
      '-',
    ],
    [
      'Channel Bed Slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'Flow Depth',
      input.flowDepth,
      'm',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Flow Area',
      result.flowArea,
      'm2',
    ],
    [
      'Top Width',
      result.topWidth,
      'm',
    ],
    [
      'Hydraulic Radius',
      result.hydraulicRadius,
      'm',
    ],
    [
      'Hydraulic Depth',
      result.hydraulicDepth,
      'm',
    ],
    [
      'Mean Velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Froude Number',
      result.froudeNumber,
      '-',
    ],
    [
      'Specific Energy',
      result.specificEnergy,
      'm',
    ],
    [
      'Friction Slope',
      result.frictionSlope,
      'm/m',
    ],
    [
      'S0 - Sf',
      result.slopeNumerator,
      'm/m',
    ],
    [
      '1 - Fr^2',
      result.froudeDenominator,
      '-',
    ],
    [
      'dy/dx',
      result.depthGradient,
      'm/m',
    ],
    [
      'Depth Change per 100 m',
      result.depthChangePer100m,
      'm/100m',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical Depth Difference',
      result.criticalDepthDifference,
      'm',
    ],
    [
      'Flow Regime',
      result.flowRegime,
      '-',
    ],
    [
      'Slope Balance',
      result.slopeBalance,
      '-',
    ],
    [
      'Local Profile Trend',
      result.localProfileTrend,
      '-',
    ],
    [],
    [
      'Model',
      result.modelName,
      '',
    ],
    [
      'Limitation',
      result.limitationDescription,
      '',
    ],
  ]

  return rows
    .map(
      row =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
