import {
  PartiallyFullCircularChannelAdaptiveStandardStepProfileError,
  calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile,
} from '../partially-full-circular-channel-adaptive-standard-step-profile/engine.ts'

import type {
  PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint,
} from '../partially-full-circular-channel-adaptive-standard-step-profile/types.ts'

import type {
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput,
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfilePoint,
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_ADAPTIVE_UPSTREAM_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'partially-full-circular-channel-adaptive-upstream-standard-step-profile-v1'


export type PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_DOWNSTREAM_BOUNDARY_DEPTH'
  | 'INVALID_UPSTREAM_LENGTH'
  | 'INVALID_INITIAL_REACH'
  | 'INVALID_MINIMUM_REACH'
  | 'INVALID_MAXIMUM_REACH'
  | 'INVALID_REACH_RANGE'
  | 'INVALID_ABSOLUTE_TOLERANCE'
  | 'INVALID_RELATIVE_TOLERANCE'
  | 'PROFILE_SOLVER_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError'

    this.code =
      code
  }
}


function validateInput(
  input:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_UPSTREAM_LENGTH',
      'Upstream profile length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.initialReachLength,
    ) ||
    input.initialReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_INITIAL_REACH',
      'Initial reach length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.minimumReachLength,
    ) ||
    input.minimumReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_MINIMUM_REACH',
      'Minimum reach length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumReachLength,
    ) ||
    input.maximumReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_MAXIMUM_REACH',
      'Maximum reach length must be positive and finite.',
    )
  }

  if (
    input.minimumReachLength >
      input.initialReachLength ||
    input.initialReachLength >
      input.maximumReachLength
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_REACH_RANGE',
      'Adaptive reach lengths must satisfy minimum ≤ initial ≤ maximum.',
    )
  }

  if (
    !Number.isFinite(
      input.absoluteTolerance,
    ) ||
    input.absoluteTolerance <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_ABSOLUTE_TOLERANCE',
      'Absolute depth tolerance must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.relativeTolerance,
    ) ||
    input.relativeTolerance <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_RELATIVE_TOLERANCE',
      'Relative depth tolerance must be positive and finite.',
    )
  }
}


function mapPoint(
  point:
    PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint,
): PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfilePoint {
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

    acceptedReachLength:
      Math.abs(
        point.acceptedReachLength,
      ),

    localErrorEstimate:
      point.localErrorEstimate,

    errorRatio:
      point.errorRatio,

    trialRootIterations:
      point.trialRootIterations,
  }
}


export function calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
  input:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput,
): PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileResult {
  validateInput(
    input,
  )

  let base

  try {
    base =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
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

        initialReachLength:
          input.initialReachLength,

        minimumReachLength:
          input.minimumReachLength,

        maximumReachLength:
          input.maximumReachLength,

        absoluteTolerance:
          input.absoluteTolerance,

        relativeTolerance:
          input.relativeTolerance,
      })
  } catch (error) {
    if (
      error instanceof
        PartiallyFullCircularChannelAdaptiveStandardStepProfileError
    ) {
      throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
        'PROFILE_SOLVER_FAILURE',
        `Adaptive upstream standard-step profile failed: ${error.message}`,
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

  const distanceTolerance =
    Math.max(
      1e-10,
      input.upstreamProfileLength *
      1e-10,
    )

  const energyTolerance =
    Math.max(
      1e-6,
      frictionHeadLossMagnitude *
      1e-5,
    )

  const finiteValues = [
    base.criticalDepth,
    base.minimumAcceptedReachLength,
    base.maximumAcceptedReachLength,
    base.meanAcceptedReachLength,
    base.maximumAcceptedErrorRatio,
    upstreamDepthChange,
    bedRiseToUpstreamEndpoint,
    waterSurfaceElevationChange,
    frictionHeadLossMagnitude,
    totalHeadRiseMovingUpstream,
    energyClosureResidual,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    profilePoints.length !==
      base.acceptedReaches +
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
    throw new PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive upstream profile failed its endpoint, point-count or energy-closure checks.',
    )
  }

  return {
    downstreamBoundary,

    upstreamEndpoint,

    profilePoints,

    upstreamProfileLength:
      input.upstreamProfileLength,

    criticalDepth:
      base.criticalDepth,

    flowRegime:
      base.flowRegime,

    acceptedReaches:
      base.acceptedReaches,

    rejectedTrials:
      base.rejectedTrials,

    attemptedTrials:
      base.attemptedTrials,

    completedStandardStepSolves:
      base.completedStandardStepSolves,

    totalRootIterations:
      base.totalRootIterations,

    minimumAcceptedReachLength:
      base.minimumAcceptedReachLength,

    maximumAcceptedReachLength:
      base.maximumAcceptedReachLength,

    meanAcceptedReachLength:
      base.meanAcceptedReachLength,

    maximumAcceptedErrorRatio:
      base.maximumAcceptedErrorRatio,

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

    modelName:
      'Partially Full Circular Channel Adaptive Upstream Standard-Step GVF Profile',

    limitationDescription:
      'The specified downstream boundary depth is treated as the control condition. Calculator 467 performs adaptive standard-step integration with negative signed distance, while this calculator reports distance positively upstream. Reach length is automatically adjusted from the local one-reach versus two-half-reach depth error estimate.',
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


export function createPartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCsv(
  input:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput,
  result:
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Adaptive Upstream Standard-Step GVF Profile',
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
      'Initial Reach Length',
      input.initialReachLength,
      'm',
    ],
    [
      'Minimum Reach Length',
      input.minimumReachLength,
      'm',
    ],
    [
      'Maximum Reach Length',
      input.maximumReachLength,
      'm',
    ],
    [
      'Absolute Tolerance',
      input.absoluteTolerance,
      'm',
    ],
    [
      'Relative Tolerance',
      input.relativeTolerance,
      '-',
    ],
    [],
    [
      'Summary',
      'Value',
      'Unit',
    ],
    [
      'Accepted Reaches',
      result.acceptedReaches,
      '-',
    ],
    [
      'Rejected Trials',
      result.rejectedTrials,
      '-',
    ],
    [
      'Attempted Trials',
      result.attemptedTrials,
      '-',
    ],
    [
      'Completed Standard-Step Solves',
      result.completedStandardStepSolves,
      '-',
    ],
    [
      'Minimum Accepted Reach',
      result.minimumAcceptedReachLength,
      'm',
    ],
    [
      'Maximum Accepted Reach',
      result.maximumAcceptedReachLength,
      'm',
    ],
    [
      'Mean Accepted Reach',
      result.meanAcceptedReachLength,
      'm',
    ],
    [
      'Maximum Accepted Error Ratio',
      result.maximumAcceptedErrorRatio,
      '-',
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
      'Accepted Reach Length',
      'Local Error Estimate',
      'Error Ratio',
      'Trial Root Iterations',
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
      point.acceptedReachLength,
      point.localErrorEstimate,
      point.errorRatio,
      point.trialRootIterations,
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
