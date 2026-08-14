import {
  TrapezoidalChannelUpstreamStandardStepProfileError,
  calculateTrapezoidalChannelUpstreamStandardStepProfile,
} from '../trapezoidal-channel-upstream-standard-step-profile/engine.ts'

import type {
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput,
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfilePoint,
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfileResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_ADAPTIVE_UPSTREAM_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'trapezoidal-channel-adaptive-upstream-standard-step-profile-v1'

export type TrapezoidalChannelAdaptiveUpstreamStandardStepProfileErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_DOWNSTREAM_DEPTH'
  | 'INVALID_REACH_LENGTH'
  | 'INVALID_MAXIMUM_STEP_LENGTH'
  | 'INVALID_MAXIMUM_DEPTH_CHANGE'
  | 'INVALID_MINIMUM_STEP_LENGTH'
  | 'INVALID_STEP_LIMITS'
  | 'INVALID_DENSITY'
  | 'MINIMUM_STEP_EXCEEDED'
  | 'PROFILE_ZONE_CHANGE'
  | 'TOO_MANY_SEGMENTS'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError
  extends Error {
  readonly code:
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfileErrorCode

  constructor(
    code:
      TrapezoidalChannelAdaptiveUpstreamStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

const MAXIMUM_ACCEPTED_SEGMENTS =
  5000

const MAXIMUM_ATTEMPTS_PER_SEGMENT =
  100

interface ReverseStation {
  distanceFromDownstream: number

  flowDepth: number

  flowArea: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number

  localDepthGradient: number
}


export function calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
  input:
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput,
): TrapezoidalChannelAdaptiveUpstreamStandardStepProfileResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical <
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
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
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.downstreamControlDepth,
    ) ||
    input.downstreamControlDepth <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_DOWNSTREAM_DEPTH',
      'Downstream control depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamReachLength,
    ) ||
    input.upstreamReachLength <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_REACH_LENGTH',
      'Upstream reach length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumStepLength,
    ) ||
    input.maximumStepLength <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_MAXIMUM_STEP_LENGTH',
      'Maximum reverse standard-step length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumDepthChangePerStep,
    ) ||
    input.maximumDepthChangePerStep <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_MAXIMUM_DEPTH_CHANGE',
      'Maximum depth change per reverse step must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.minimumStepLength,
    ) ||
    input.minimumStepLength <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_MINIMUM_STEP_LENGTH',
      'Minimum adaptive step length must be a positive finite value.',
    )
  }

  if (
    input.minimumStepLength >
    input.maximumStepLength
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_STEP_LIMITS',
      'Minimum adaptive step length cannot exceed maximum step length.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  let distanceFromDownstream =
    0

  let currentDownstreamDepth =
    input.downstreamControlDepth

  let acceptedStepCount =
    0

  let attemptedStepCount =
    0

  let adaptiveReductionCount =
    0

  let cumulativeDepthSolverIterations =
    0

  let cumulativeSegmentEnergyResidual =
    0

  let criticalDepth =
    Number.NaN

  let normalDepth =
    Number.NaN

  let channelSlopeClass =
    ''

  let profileClassification =
    ''

  let maximumDepthChangeObserved =
    0

  const acceptedLengths:
    number[] =
    []

  const reverseStations:
    ReverseStation[] =
    []

  const distanceTolerance =
    Math.max(
      1e-10,
      input.upstreamReachLength *
      1e-12,
    )

  while (
    distanceFromDownstream <
    input.upstreamReachLength -
    distanceTolerance
  ) {
    if (
      acceptedStepCount >=
      MAXIMUM_ACCEPTED_SEGMENTS
    ) {
      throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
        'TOO_MANY_SEGMENTS',
        `Adaptive reverse profile exceeded ${MAXIMUM_ACCEPTED_SEGMENTS} accepted segments.`,
      )
    }

    const remainingDistance =
      input.upstreamReachLength -
      distanceFromDownstream

    const effectiveMinimumStepLength =
      Math.min(
        input.minimumStepLength,
        remainingDistance,
      )

    let candidateLength =
      Math.min(
        input.maximumStepLength,
        remainingDistance,
      )

    let acceptedStep:
      ReturnType<
        typeof calculateTrapezoidalChannelUpstreamStandardStepProfile
      > |
      null =
      null

    for (
      let attempt = 1;
      attempt <=
        MAXIMUM_ATTEMPTS_PER_SEGMENT;
      attempt += 1
    ) {
      attemptedStepCount +=
        1

      try {
        const step =
          calculateTrapezoidalChannelUpstreamStandardStepProfile({
            bottomWidth:
              input.bottomWidth,

            sideSlopeHorizontalPerVertical:
              input.sideSlopeHorizontalPerVertical,

            volumetricFlowRate:
              input.volumetricFlowRate,

            manningRoughness:
              input.manningRoughness,

            channelSlope:
              input.channelSlope,

            downstreamControlDepth:
              currentDownstreamDepth,

            upstreamReachLength:
              candidateLength,

            numberOfSteps:
              1,

            fluidDensity:
              input.fluidDensity,
          })

        const absoluteDepthChange =
          Math.abs(
            step.upstreamBoundaryDepth -
            currentDownstreamDepth,
          )

        const depthTolerance =
          Math.max(
            1e-12,
            input.maximumDepthChangePerStep *
            1e-9,
          )

        if (
          absoluteDepthChange <=
          input.maximumDepthChangePerStep +
          depthTolerance
        ) {
          acceptedStep =
            step

          break
        }

        if (
          candidateLength <=
          effectiveMinimumStepLength *
          (
            1 +
            1e-12
          )
        ) {
          throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
            'MINIMUM_STEP_EXCEEDED',
            `Reverse depth change ${absoluteDepthChange} m still exceeds the requested limit at the minimum adaptive step.`,
          )
        }

        candidateLength =
          Math.max(
            candidateLength /
            2,
            effectiveMinimumStepLength,
          )

        adaptiveReductionCount +=
          1
      } catch (error) {
        if (
          error instanceof
          TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError
        ) {
          throw error
        }

        if (
          !(
            error instanceof
            TrapezoidalChannelUpstreamStandardStepProfileError
          )
        ) {
          throw error
        }

        if (
          candidateLength <=
          effectiveMinimumStepLength *
          (
            1 +
            1e-12
          )
        ) {
          throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
            'MINIMUM_STEP_EXCEEDED',
            `Reverse standard-step solver could not advance at the minimum adaptive step: ${error.message}`,
          )
        }

        candidateLength =
          Math.max(
            candidateLength /
            2,
            effectiveMinimumStepLength,
          )

        adaptiveReductionCount +=
          1
      }
    }

    if (
      !acceptedStep
    ) {
      throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
        'MINIMUM_STEP_EXCEEDED',
        `No acceptable reverse standard-step segment could be found at ${distanceFromDownstream} m upstream of the control.`,
      )
    }

    if (
      acceptedStepCount ===
      0
    ) {
      criticalDepth =
        acceptedStep.criticalDepth

      normalDepth =
        acceptedStep.normalDepth

      channelSlopeClass =
        acceptedStep.channelSlopeClass

      profileClassification =
        acceptedStep.profileClassification

      const downstreamPoint =
        acceptedStep.profilePoints[
          acceptedStep.profilePoints.length -
          1
        ]

      reverseStations.push({
        distanceFromDownstream:
          0,

        flowDepth:
          downstreamPoint.flowDepth,

        flowArea:
          downstreamPoint.flowArea,

        velocity:
          downstreamPoint.velocity,

        froudeNumber:
          downstreamPoint.froudeNumber,

        specificEnergy:
          downstreamPoint.specificEnergy,

        frictionSlope:
          downstreamPoint.frictionSlope,

        localDepthGradient:
          downstreamPoint.localDepthGradient,
      })
    } else if (
      acceptedStep.profileClassification !==
      profileClassification
    ) {
      throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
        'PROFILE_ZONE_CHANGE',
        `Adaptive reverse profile changed from ${profileClassification} to ${acceptedStep.profileClassification}.`,
      )
    }

    const upstreamPoint =
      acceptedStep.profilePoints[
        0
      ]

    const absoluteDepthChange =
      Math.abs(
        upstreamPoint.flowDepth -
        currentDownstreamDepth,
      )

    maximumDepthChangeObserved =
      Math.max(
        maximumDepthChangeObserved,
        absoluteDepthChange,
      )

    acceptedLengths.push(
      candidateLength,
    )

    cumulativeDepthSolverIterations +=
      acceptedStep.cumulativeDepthSolverIterations

    cumulativeSegmentEnergyResidual +=
      acceptedStep.totalEnergyClosureResidual

    distanceFromDownstream +=
      candidateLength

    if (
      Math.abs(
        distanceFromDownstream -
        input.upstreamReachLength
      ) <=
      distanceTolerance
    ) {
      distanceFromDownstream =
        input.upstreamReachLength
    }

    reverseStations.push({
      distanceFromDownstream,

      flowDepth:
        upstreamPoint.flowDepth,

      flowArea:
        upstreamPoint.flowArea,

      velocity:
        upstreamPoint.velocity,

      froudeNumber:
        upstreamPoint.froudeNumber,

      specificEnergy:
        upstreamPoint.specificEnergy,

      frictionSlope:
        upstreamPoint.frictionSlope,

      localDepthGradient:
        upstreamPoint.localDepthGradient,
    })

    currentDownstreamDepth =
      upstreamPoint.flowDepth

    acceptedStepCount +=
      1
  }

  if (
    reverseStations.length <
    2 ||
    acceptedLengths.length ===
    0
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive reverse profile produced no accepted reach.',
    )
  }

  const orderedStations =
    reverseStations
      .slice()
      .reverse()

  const profilePoints:
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfilePoint[] =
    []

  let totalFrictionHeadLoss =
    0

  let maximumAbsoluteDepthGradient =
    0

  for (
    let index = 0;
    index <
      orderedStations.length;
    index += 1
  ) {
    const station =
      orderedStations[
        index
      ]

    const distanceFromUpstream =
      input.upstreamReachLength -
      station.distanceFromDownstream

    let acceptedStepLengthFromPrevious =
      0

    let depthChangeFromPrevious =
      0

    if (
      index >
      0
    ) {
      const previous =
        orderedStations[
          index -
          1
        ]

      const previousDistanceFromUpstream =
        input.upstreamReachLength -
        previous.distanceFromDownstream

      acceptedStepLengthFromPrevious =
        distanceFromUpstream -
        previousDistanceFromUpstream

      depthChangeFromPrevious =
        station.flowDepth -
        previous.flowDepth

      totalFrictionHeadLoss +=
        (
          previous.frictionSlope +
          station.frictionSlope
        ) /
        2 *
        acceptedStepLengthFromPrevious
    }

    maximumAbsoluteDepthGradient =
      Math.max(
        maximumAbsoluteDepthGradient,
        Math.abs(
          station.localDepthGradient,
        ),
      )

    profilePoints.push({
      stationIndex:
        index,

      distanceFromUpstream,

      distanceFromDownstream:
        station.distanceFromDownstream,

      acceptedStepLengthFromPrevious,

      flowDepth:
        station.flowDepth,

      depthChangeFromPrevious,

      flowArea:
        station.flowArea,

      velocity:
        station.velocity,

      froudeNumber:
        station.froudeNumber,

      specificEnergy:
        station.specificEnergy,

      frictionSlope:
        station.frictionSlope,

      localDepthGradient:
        station.localDepthGradient,

      cumulativeFrictionHeadLoss:
        totalFrictionHeadLoss,
    })
  }

  const upstream =
    orderedStations[
      0
    ]

  const downstream =
    orderedStations[
      orderedStations.length -
      1
    ]

  const upstreamBoundaryDepth =
    upstream.flowDepth

  const downstreamControlDepth =
    downstream.flowDepth

  const downstreamDepthChange =
    downstreamControlDepth -
    upstreamBoundaryDepth

  const profileTrendDownstream =
    downstreamDepthChange >
    0
      ? 'Flow depth increases downstream'
      : downstreamDepthChange <
        0
        ? 'Flow depth decreases downstream'
        : 'Flow depth is effectively unchanged'

  const minimumFlowDepth =
    Math.min(
      ...profilePoints.map(
        point =>
          point.flowDepth,
      ),
    )

  const maximumFlowDepth =
    Math.max(
      ...profilePoints.map(
        point =>
          point.flowDepth,
      ),
    )

  const minimumAcceptedStepLength =
    Math.min(
      ...acceptedLengths,
    )

  const maximumAcceptedStepLength =
    Math.max(
      ...acceptedLengths,
    )

  const averageAcceptedStepLength =
    acceptedLengths.reduce(
      (
        sum,
        value,
      ) =>
        sum +
        value,
      0,
    ) /
    acceptedLengths.length

  const averageFrictionSlope =
    totalFrictionHeadLoss /
    input.upstreamReachLength

  const bedElevationChangeDownstream =
    -input.channelSlope *
    input.upstreamReachLength

  const waterSurfaceElevationChangeDownstream =
    bedElevationChangeDownstream +
    downstreamDepthChange

  const energyGradeLineChangeDownstream =
    -totalFrictionHeadLoss

  const totalEnergyClosureResidual =
    (
      downstream.specificEnergy -
      upstream.specificEnergy
    ) -
    (
      input.channelSlope *
      input.upstreamReachLength -
      totalFrictionHeadLoss
    )

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const hydraulicPowerDissipated =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    totalFrictionHeadLoss

  const positiveValues = [
    criticalDepth,

    normalDepth,

    upstreamBoundaryDepth,

    downstreamControlDepth,

    input.upstreamReachLength,

    minimumAcceptedStepLength,

    maximumAcceptedStepLength,

    averageAcceptedStepLength,

    upstream.flowArea,

    downstream.flowArea,

    upstream.velocity,

    downstream.velocity,

    upstream.froudeNumber,

    downstream.froudeNumber,

    upstream.specificEnergy,

    downstream.specificEnergy,

    upstream.frictionSlope,

    downstream.frictionSlope,

    totalFrictionHeadLoss,

    averageFrictionSlope,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const finiteValues = [
    downstreamDepthChange,

    maximumDepthChangeObserved,

    maximumAbsoluteDepthGradient,

    bedElevationChangeDownstream,

    waterSurfaceElevationChangeDownstream,

    energyGradeLineChangeDownstream,

    cumulativeSegmentEnergyResidual,

    totalEnergyClosureResidual,
  ]

  const energyTolerance =
    Math.max(
      1e-8,
      Math.max(
        upstream.specificEnergy,
        downstream.specificEnergy,
      ) *
      1e-7,
    )

  const depthTolerance =
    Math.max(
      1e-10,
      input.maximumDepthChangePerStep *
      1e-7,
    )

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
    !finiteValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    profilePoints.length !==
      acceptedStepCount +
      1 ||
    Math.abs(
      distanceFromDownstream -
      input.upstreamReachLength
    ) >
      distanceTolerance ||
    maximumDepthChangeObserved >
      input.maximumDepthChangePerStep +
      depthTolerance ||
    Math.abs(
      cumulativeSegmentEnergyResidual,
    ) >
      energyTolerance ||
    Math.abs(
      totalEnergyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive upstream standard-step profile failed its distance, depth-change or energy closure checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    profileClassification,

    profileTrendDownstream,

    upstreamBoundaryDepth,

    downstreamControlDepth,

    downstreamDepthChange,

    minimumFlowDepth,

    maximumFlowDepth,

    upstreamReachLength:
      input.upstreamReachLength,

    requestedMaximumStepLength:
      input.maximumStepLength,

    requestedMaximumDepthChangePerStep:
      input.maximumDepthChangePerStep,

    configuredMinimumStepLength:
      input.minimumStepLength,

    acceptedStepCount,

    attemptedStepCount,

    adaptiveReductionCount,

    minimumAcceptedStepLength,

    maximumAcceptedStepLength,

    averageAcceptedStepLength,

    maximumDepthChangeObserved,

    upstreamFlowArea:
      upstream.flowArea,

    downstreamFlowArea:
      downstream.flowArea,

    upstreamVelocity:
      upstream.velocity,

    downstreamVelocity:
      downstream.velocity,

    upstreamFroudeNumber:
      upstream.froudeNumber,

    downstreamFroudeNumber:
      downstream.froudeNumber,

    upstreamSpecificEnergy:
      upstream.specificEnergy,

    downstreamSpecificEnergy:
      downstream.specificEnergy,

    upstreamFrictionSlope:
      upstream.frictionSlope,

    downstreamFrictionSlope:
      downstream.frictionSlope,

    totalFrictionHeadLoss,

    averageFrictionSlope,

    bedElevationChangeDownstream,

    waterSurfaceElevationChangeDownstream,

    energyGradeLineChangeDownstream,

    cumulativeSegmentEnergyResidual,

    totalEnergyClosureResidual,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,

    cumulativeDepthSolverIterations,

    profilePoints,

    modelName:
      'Adaptive Upstream Standard-Step GVF Profile from a Downstream Boundary',

    limitationDescription:
      'Adaptive reverse standard-step GVF analysis using Calculator 453 as the one-segment solver. Candidate reverse reaches are halved whenever the predicted depth change exceeds the selected limit or the solution cannot remain safely within the same GVF profile zone.',
  }
}


export function createTrapezoidalChannelAdaptiveUpstreamStandardStepProfileCsv(
  input:
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput,
  result:
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfileResult,
): string {
  const rows: Array<
    Array<
      string |
      number
    >
  > = [
    [
      'Adaptive Upstream Standard-Step GVF Profile from a Downstream Boundary',
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
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
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
      'Downstream control depth',
      input.downstreamControlDepth,
      'm',
    ],
    [
      'Upstream reach length',
      input.upstreamReachLength,
      'm',
    ],
    [
      'Maximum step length',
      input.maximumStepLength,
      'm',
    ],
    [
      'Maximum depth change per step',
      input.maximumDepthChangePerStep,
      'm',
    ],
    [
      'Minimum adaptive step length',
      input.minimumStepLength,
      'm',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Summary',
      'Value',
      'Unit',
    ],
    [
      'GVF profile',
      result.profileClassification,
      '-',
    ],
    [
      'Upstream boundary depth',
      result.upstreamBoundaryDepth,
      'm',
    ],
    [
      'Downstream control depth',
      result.downstreamControlDepth,
      'm',
    ],
    [
      'Accepted reverse steps',
      result.acceptedStepCount,
      '-',
    ],
    [
      'Attempted reverse steps',
      result.attemptedStepCount,
      '-',
    ],
    [
      'Adaptive reductions',
      result.adaptiveReductionCount,
      '-',
    ],
    [
      'Maximum depth change observed',
      result.maximumDepthChangeObserved,
      'm',
    ],
    [
      'Total friction head loss',
      result.totalFrictionHeadLoss,
      'm',
    ],
    [
      'Average friction slope',
      result.averageFrictionSlope,
      '-',
    ],
    [
      'Total energy closure residual',
      result.totalEnergyClosureResidual,
      'm',
    ],
    [
      'Hydraulic power dissipated',
      result.hydraulicPowerDissipated,
      'W',
    ],
    [],
    [
      'Station',
      'Distance from Upstream (m)',
      'Distance from Downstream (m)',
      'Accepted dx from Previous (m)',
      'Depth (m)',
      'Delta y from Previous (m)',
      'Area (m2)',
      'Velocity (m/s)',
      'Froude',
      'Specific Energy (m)',
      'Friction Slope',
      'dy/dx',
      'Cumulative Friction Head (m)',
    ],
  ]

  for (
    const point of
      result.profilePoints
  ) {
    rows.push([
      point.stationIndex,

      point.distanceFromUpstream,

      point.distanceFromDownstream,

      point.acceptedStepLengthFromPrevious,

      point.flowDepth,

      point.depthChangeFromPrevious,

      point.flowArea,

      point.velocity,

      point.froudeNumber,

      point.specificEnergy,

      point.frictionSlope,

      point.localDepthGradient,

      point.cumulativeFrictionHeadLoss,
    ])
  }

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
