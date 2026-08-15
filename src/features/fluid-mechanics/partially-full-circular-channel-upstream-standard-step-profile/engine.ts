import {
  PartiallyFullCircularChannelStandardStepProfileError,
  calculatePartiallyFullCircularChannelStandardStepProfile,
} from '../partially-full-circular-channel-standard-step-profile/engine.ts'

import type {
  PartiallyFullCircularChannelStandardStepProfilePoint,
} from '../partially-full-circular-channel-standard-step-profile/types.ts'

import type {
  PartiallyFullCircularChannelUpstreamStandardStepProfileInput,
  PartiallyFullCircularChannelUpstreamStandardStepProfilePoint,
  PartiallyFullCircularChannelUpstreamStandardStepProfileResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_UPSTREAM_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'partially-full-circular-channel-upstream-standard-step-profile-v1'


export type PartiallyFullCircularChannelUpstreamStandardStepProfileErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_DOWNSTREAM_BOUNDARY_DEPTH'
  | 'INVALID_UPSTREAM_LENGTH'
  | 'INVALID_REACH_LENGTH'
  | 'PROFILE_SOLVER_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelUpstreamStandardStepProfileError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelUpstreamStandardStepProfileErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelUpstreamStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelUpstreamStandardStepProfileError'

    this.code =
      code
  }
}


function validateInput(
  input:
    PartiallyFullCircularChannelUpstreamStandardStepProfileInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <=
      0
  ) {
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.downstreamBoundaryDepth,
    ) ||
    input.downstreamBoundaryDepth <=
      0 ||
    input.downstreamBoundaryDepth >=
      input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
      'INVALID_DOWNSTREAM_BOUNDARY_DEPTH',
      'Downstream boundary depth must satisfy 0 < yb < D.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamProfileLength,
    ) ||
    input.upstreamProfileLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
      'INVALID_UPSTREAM_LENGTH',
      'Upstream profile length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumReachLength,
    ) ||
    input.maximumReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
      'INVALID_REACH_LENGTH',
      'Maximum standard-step reach length must be positive and finite.',
    )
  }
}


function mapPoint(
  point:
    PartiallyFullCircularChannelStandardStepProfilePoint,
): PartiallyFullCircularChannelUpstreamStandardStepProfilePoint {
  return {
    index:
      point.index,

    upstreamDistance:
      -point.distance,

    signedDistanceFromBoundary:
      point.distance,

    flowDepth:
      point.flowDepth,

    bedElevationRelativeToBoundary:
      point.bedElevation,

    waterSurfaceElevationRelativeToBoundary:
      point.waterSurfaceElevation,

    meanVelocity:
      point.meanVelocity,

    froudeNumber:
      point.froudeNumber,

    frictionSlope:
      point.frictionSlope,

    specificEnergy:
      point.specificEnergy,

    totalHeadRelativeToBoundary:
      point.totalHead,

    reachLength:
      Math.abs(
        point.segmentLength,
      ),

    rootIterations:
      point.rootIterations,
  }
}


export function calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
  input:
    PartiallyFullCircularChannelUpstreamStandardStepProfileInput,
): PartiallyFullCircularChannelUpstreamStandardStepProfileResult {
  validateInput(
    input,
  )

  let base

  try {
    base =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          input.channelSlope,

        initialFlowDepth:
          input.downstreamBoundaryDepth,

        signedProfileLength:
          -input.upstreamProfileLength,

        maximumReachLength:
          input.maximumReachLength,
      })
  } catch (error) {
    if (
      error instanceof
        PartiallyFullCircularChannelStandardStepProfileError
    ) {
      throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
        'PROFILE_SOLVER_FAILURE',
        `Upstream standard-step profile failed: ${error.message}`,
      )
    }

    throw error
  }

  const profilePoints =
    base.profilePoints.map(
      mapPoint,
    )

  const downstreamBoundary =
    profilePoints[0]

  const upstreamEndpoint =
    profilePoints[
      profilePoints.length -
      1
    ]

  const upstreamDepthChange =
    upstreamEndpoint.flowDepth -
    downstreamBoundary.flowDepth

  const bedRiseToUpstreamEndpoint =
    upstreamEndpoint
      .bedElevationRelativeToBoundary -
    downstreamBoundary
      .bedElevationRelativeToBoundary

  const waterSurfaceElevationChange =
    upstreamEndpoint
      .waterSurfaceElevationRelativeToBoundary -
    downstreamBoundary
      .waterSurfaceElevationRelativeToBoundary

  const totalHeadRiseMovingUpstream =
    upstreamEndpoint
      .totalHeadRelativeToBoundary -
    downstreamBoundary
      .totalHeadRelativeToBoundary

  const frictionHeadLossMagnitude =
    base.frictionHeadLossMagnitude

  const energyClosureResidual =
    totalHeadRiseMovingUpstream -
    frictionHeadLossMagnitude

  const finiteValues = [
    upstreamDepthChange,
    bedRiseToUpstreamEndpoint,
    waterSurfaceElevationChange,
    totalHeadRiseMovingUpstream,
    frictionHeadLossMagnitude,
    energyClosureResidual,
  ]

  const distanceTolerance =
    Math.max(
      1e-10,
      input.upstreamProfileLength *
      1e-10,
    )

  const energyTolerance =
    Math.max(
      1e-7,
      frictionHeadLossMagnitude *
      1e-6,
    )

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    profilePoints.length !==
      base.numberOfReaches +
      1 ||
    Math.abs(
      upstreamEndpoint.upstreamDistance -
      input.upstreamProfileLength,
    ) >
      distanceTolerance ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new PartiallyFullCircularChannelUpstreamStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Upstream backwater profile failed its endpoint or energy-closure checks.',
    )
  }

  return {
    downstreamBoundary,

    upstreamEndpoint,

    profilePoints,

    upstreamProfileLength:
      input.upstreamProfileLength,

    numberOfReaches:
      base.numberOfReaches,

    actualReachLength:
      Math.abs(
        base.actualReachLength,
      ),

    criticalDepth:
      base.criticalDepth,

    flowRegime:
      base.flowRegime,

    upstreamDepthChange,

    minimumDepth:
      base.minimumDepth,

    maximumDepth:
      base.maximumDepth,

    bedRiseToUpstreamEndpoint,

    waterSurfaceElevationChange,

    frictionHeadLossMagnitude,

    totalHeadRiseMovingUpstream,

    energyClosureResidual,

    totalRootIterations:
      base.totalRootIterations,

    modelName:
      'Partially Full Circular Channel Upstream Standard-Step GVF Profile from Downstream Boundary',

    limitationDescription:
      'The downstream boundary depth is treated as the control condition at x = 0. Calculator 466 is then marched with negative signed distance so the solution proceeds physically upstream. Output distances are reported as positive upstream distances from the downstream boundary. The profile must remain within one gradually varied critical-flow regime.',
  }
}


function csvCell(
  value:
    string | number,
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


export function createPartiallyFullCircularChannelUpstreamStandardStepProfileCsv(
  input:
    PartiallyFullCircularChannelUpstreamStandardStepProfileInput,
  result:
    PartiallyFullCircularChannelUpstreamStandardStepProfileResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Upstream Standard-Step GVF Profile from Downstream Boundary',
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
      'Downstream Boundary Depth',
      input.downstreamBoundaryDepth,
      'm',
    ],
    [
      'Upstream Profile Length',
      input.upstreamProfileLength,
      'm',
    ],
    [
      'Maximum Reach Length',
      input.maximumReachLength,
      'm',
    ],
    [],
    [
      'Summary',
      'Value',
      'Unit',
    ],
    [
      'Number of Reaches',
      result.numberOfReaches,
      '-',
    ],
    [
      'Actual Reach Length',
      result.actualReachLength,
      'm',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Upstream Endpoint Depth',
      result.upstreamEndpoint.flowDepth,
      'm',
    ],
    [
      'Upstream Depth Change',
      result.upstreamDepthChange,
      'm',
    ],
    [
      'Bed Rise to Upstream Endpoint',
      result.bedRiseToUpstreamEndpoint,
      'm',
    ],
    [
      'Water Surface Elevation Change',
      result.waterSurfaceElevationChange,
      'm',
    ],
    [
      'Friction Head Loss',
      result.frictionHeadLossMagnitude,
      'm',
    ],
    [
      'Total Head Rise Moving Upstream',
      result.totalHeadRiseMovingUpstream,
      'm',
    ],
    [
      'Energy Closure Residual',
      result.energyClosureResidual,
      'm',
    ],
    [
      'Total Root Iterations',
      result.totalRootIterations,
      '-',
    ],
    [],
    [
      'Point',
      'Upstream Distance',
      'Signed Distance from Boundary',
      'Flow Depth',
      'Bed Elevation Relative to Boundary',
      'Water Surface Elevation Relative to Boundary',
      'Velocity',
      'Froude Number',
      'Friction Slope',
      'Specific Energy',
      'Total Head Relative to Boundary',
      'Reach Length',
      'Root Iterations',
    ],
  ]

  for (
    const point of
      result.profilePoints
  ) {
    rows.push([
      point.index,
      point.upstreamDistance,
      point.signedDistanceFromBoundary,
      point.flowDepth,
      point.bedElevationRelativeToBoundary,
      point.waterSurfaceElevationRelativeToBoundary,
      point.meanVelocity,
      point.froudeNumber,
      point.frictionSlope,
      point.specificEnergy,
      point.totalHeadRelativeToBoundary,
      point.reachLength,
      point.rootIterations,
    ])
  }

  rows.push(
    [],
    [
      'Model',
      result.modelName,
    ],
    [
      'Limitation',
      result.limitationDescription,
    ],
  )

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
