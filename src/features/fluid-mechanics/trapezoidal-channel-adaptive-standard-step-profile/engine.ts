import {
  TrapezoidalChannelStandardStepError,
  calculateTrapezoidalChannelStandardStep,
} from '../trapezoidal-channel-standard-step/engine.ts'

import type {
  TrapezoidalChannelAdaptiveStandardStepProfileInput,
  TrapezoidalChannelAdaptiveStandardStepProfilePoint,
  TrapezoidalChannelAdaptiveStandardStepProfileResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_ADAPTIVE_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'trapezoidal-channel-adaptive-standard-step-profile-v1'

export type TrapezoidalChannelAdaptiveStandardStepProfileErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
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

export class TrapezoidalChannelAdaptiveStandardStepProfileError
  extends Error {
  readonly code:
    TrapezoidalChannelAdaptiveStandardStepProfileErrorCode

  constructor(
    code:
      TrapezoidalChannelAdaptiveStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelAdaptiveStandardStepProfileError'

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

export function calculateTrapezoidalChannelAdaptiveStandardStepProfile(
  input:
    TrapezoidalChannelAdaptiveStandardStepProfileInput,
): TrapezoidalChannelAdaptiveStandardStepProfileResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
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
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
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
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
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
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
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
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.initialFlowDepth,
    ) ||
    input.initialFlowDepth <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_INITIAL_DEPTH',
      'Initial flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.totalReachLength,
    ) ||
    input.totalReachLength <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_REACH_LENGTH',
      'Total reach length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumStepLength,
    ) ||
    input.maximumStepLength <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_MAXIMUM_STEP_LENGTH',
      'Maximum standard-step length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumDepthChangePerStep,
    ) ||
    input.maximumDepthChangePerStep <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_MAXIMUM_DEPTH_CHANGE',
      'Maximum depth change per accepted step must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.minimumStepLength,
    ) ||
    input.minimumStepLength <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_MINIMUM_STEP_LENGTH',
      'Minimum adaptive step length must be a positive finite value.',
    )
  }

  if (
    input.minimumStepLength >
    input.maximumStepLength
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_STEP_LIMITS',
      'Minimum adaptive step length cannot exceed the maximum step length.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  let currentDistance =
    0

  let currentDepth =
    input.initialFlowDepth

  let acceptedStepCount =
    0

  let attemptedStepCount =
    0

  let adaptiveReductionCount =
    0

  let cumulativeDepthSolverIterations =
    0

  let totalFrictionHeadLoss =
    0

  let cumulativeSegmentEnergyResidual =
    0

  let startProfileClassification =
    ''

  let endProfileClassification =
    ''

  let channelSlopeClass =
    ''

  let criticalDepth =
    Number.NaN

  let normalDepth =
    Number.NaN

  let startFlowArea =
    Number.NaN

  let finalFlowArea =
    Number.NaN

  let startVelocity =
    Number.NaN

  let finalVelocity =
    Number.NaN

  let startFroudeNumber =
    Number.NaN

  let finalFroudeNumber =
    Number.NaN

  let startSpecificEnergy =
    Number.NaN

  let finalSpecificEnergy =
    Number.NaN

  let startFrictionSlope =
    Number.NaN

  let finalFrictionSlope =
    Number.NaN

  let maximumAbsoluteDepthGradient =
    0

  let maximumDepthChangeObserved =
    0

  const acceptedLengths:
    number[] =
    []

  const profilePoints:
    TrapezoidalChannelAdaptiveStandardStepProfilePoint[] =
    []

  const distanceTolerance =
    Math.max(
      1e-10,
      input.totalReachLength *
      1e-12,
    )

  while (
    currentDistance <
    input.totalReachLength -
    distanceTolerance
  ) {
    if (
      acceptedStepCount >=
      MAXIMUM_ACCEPTED_SEGMENTS
    ) {
      throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
        'TOO_MANY_SEGMENTS',
        `Adaptive profile exceeded ${MAXIMUM_ACCEPTED_SEGMENTS} accepted segments.`,
      )
    }

    const remainingDistance =
      input.totalReachLength -
      currentDistance

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

    let acceptedStep =
      null as
        | ReturnType<
            typeof calculateTrapezoidalChannelStandardStep
          >
        | null

    for (
      let localAttempt = 1;
      localAttempt <=
        MAXIMUM_ATTEMPTS_PER_SEGMENT;
      localAttempt += 1
    ) {
      attemptedStepCount +=
        1

      try {
        const step =
          calculateTrapezoidalChannelStandardStep({
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

            startDepth:
              currentDepth,

            downstreamReachLength:
              candidateLength,

            fluidDensity:
              input.fluidDensity,
          })

        const absoluteDepthChange =
          Math.abs(
            step.depthChange,
          )

        const depthChangeTolerance =
          Math.max(
            1e-12,
            input.maximumDepthChangePerStep *
            1e-9,
          )

        const depthChangeAcceptable =
          absoluteDepthChange <=
          input.maximumDepthChangePerStep +
          depthChangeTolerance

        if (
          depthChangeAcceptable
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
          throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
            'MINIMUM_STEP_EXCEEDED',
            `Depth change ${absoluteDepthChange} m exceeds the requested ${input.maximumDepthChangePerStep} m limit even at the minimum allowed adaptive step.`,
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
          TrapezoidalChannelAdaptiveStandardStepProfileError
        ) {
          throw error
        }

        if (
          !(
            error instanceof
            TrapezoidalChannelStandardStepError
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
          throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
            'MINIMUM_STEP_EXCEEDED',
            `Standard-step solver could not advance from x = ${currentDistance} m at the minimum adaptive step: ${error.message}`,
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
      throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
        'MINIMUM_STEP_EXCEEDED',
        `No acceptable standard-step segment could be found from x = ${currentDistance} m.`,
      )
    }

    if (
      acceptedStepCount ===
      0
    ) {
      startProfileClassification =
        acceptedStep.profileClassification

      endProfileClassification =
        acceptedStep.profileClassification

      channelSlopeClass =
        acceptedStep.channelSlopeClass

      criticalDepth =
        acceptedStep.criticalDepth

      normalDepth =
        acceptedStep.normalDepth

      startFlowArea =
        acceptedStep.startFlowArea

      startVelocity =
        acceptedStep.startVelocity

      startFroudeNumber =
        acceptedStep.startFroudeNumber

      startSpecificEnergy =
        acceptedStep.startSpecificEnergy

      startFrictionSlope =
        acceptedStep.startFrictionSlope

      profilePoints.push({
        stepIndex:
          0,

        distance:
          0,

        acceptedStepLength:
          0,

        flowDepth:
          input.initialFlowDepth,

        depthChangeFromPrevious:
          0,

        flowArea:
          acceptedStep.startFlowArea,

        velocity:
          acceptedStep.startVelocity,

        froudeNumber:
          acceptedStep.startFroudeNumber,

        specificEnergy:
          acceptedStep.startSpecificEnergy,

        frictionSlope:
          acceptedStep.startFrictionSlope,

        localDepthGradient:
          acceptedStep.localGvfDepthGradientAtStart,

        cumulativeFrictionHeadLoss:
          0,
      })
    } else if (
      acceptedStep.profileClassification !==
      startProfileClassification
    ) {
      throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
        'PROFILE_ZONE_CHANGE',
        `Adaptive profile changed from ${startProfileClassification} to ${acceptedStep.profileClassification} at x = ${currentDistance} m.`,
      )
    }

    acceptedStepCount +=
      1

    acceptedLengths.push(
      candidateLength,
    )

    totalFrictionHeadLoss +=
      acceptedStep.frictionHeadLoss

    cumulativeSegmentEnergyResidual +=
      acceptedStep.standardStepEnergyResidual

    cumulativeDepthSolverIterations +=
      acceptedStep.depthSolverIterations

    maximumDepthChangeObserved =
      Math.max(
        maximumDepthChangeObserved,
        Math.abs(
          acceptedStep.depthChange,
        ),
      )

    maximumAbsoluteDepthGradient =
      Math.max(
        maximumAbsoluteDepthGradient,
        Math.abs(
          acceptedStep.localGvfDepthGradientAtStart,
        ),
        Math.abs(
          acceptedStep.localGvfDepthGradientAtEnd,
        ),
      )

    currentDistance +=
      candidateLength

    if (
      Math.abs(
        currentDistance -
        input.totalReachLength
      ) <=
      distanceTolerance
    ) {
      currentDistance =
        input.totalReachLength
    }

    currentDepth =
      acceptedStep.endDepth

    finalFlowArea =
      acceptedStep.endFlowArea

    finalVelocity =
      acceptedStep.endVelocity

    finalFroudeNumber =
      acceptedStep.endFroudeNumber

    finalSpecificEnergy =
      acceptedStep.endSpecificEnergy

    finalFrictionSlope =
      acceptedStep.endFrictionSlope

    endProfileClassification =
      acceptedStep.profileClassification

    profilePoints.push({
      stepIndex:
        acceptedStepCount,

      distance:
        currentDistance,

      acceptedStepLength:
        candidateLength,

      flowDepth:
        acceptedStep.endDepth,

      depthChangeFromPrevious:
        acceptedStep.depthChange,

      flowArea:
        acceptedStep.endFlowArea,

      velocity:
        acceptedStep.endVelocity,

      froudeNumber:
        acceptedStep.endFroudeNumber,

      specificEnergy:
        acceptedStep.endSpecificEnergy,

      frictionSlope:
        acceptedStep.endFrictionSlope,

      localDepthGradient:
        acceptedStep.localGvfDepthGradientAtEnd,

      cumulativeFrictionHeadLoss:
        totalFrictionHeadLoss,
    })
  }

  if (
    profilePoints.length <
    2
  ) {
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive profile produced no accepted hydraulic reach.',
    )
  }

  const finalFlowDepth =
    currentDepth

  const totalDepthChange =
    finalFlowDepth -
    input.initialFlowDepth

  const profileTrend =
    totalDepthChange >
    0
      ? 'Flow depth increases downstream'
      : totalDepthChange <
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
    input.totalReachLength

  const bedElevationChange =
    -input.channelSlope *
    input.totalReachLength

  const waterSurfaceElevationChange =
    bedElevationChange +
    totalDepthChange

  const energyGradeLineChange =
    -totalFrictionHeadLoss

  const totalEnergyClosureResidual =
    (
      finalSpecificEnergy -
      startSpecificEnergy
    ) -
    (
      input.channelSlope *
      input.totalReachLength -
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

    input.initialFlowDepth,

    finalFlowDepth,

    input.totalReachLength,

    minimumAcceptedStepLength,

    maximumAcceptedStepLength,

    averageAcceptedStepLength,

    startFlowArea,

    finalFlowArea,

    startVelocity,

    finalVelocity,

    startFroudeNumber,

    finalFroudeNumber,

    startSpecificEnergy,

    finalSpecificEnergy,

    startFrictionSlope,

    finalFrictionSlope,

    totalFrictionHeadLoss,

    averageFrictionSlope,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const finiteValues = [
    totalDepthChange,

    maximumDepthChangeObserved,

    bedElevationChange,

    waterSurfaceElevationChange,

    energyGradeLineChange,

    cumulativeSegmentEnergyResidual,

    totalEnergyClosureResidual,
  ]

  const energyTolerance =
    Math.max(
      1e-8,
      Math.max(
        startSpecificEnergy,
        finalSpecificEnergy,
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
    startProfileClassification !==
      endProfileClassification ||
    Math.abs(
      currentDistance -
      input.totalReachLength
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
    throw new TrapezoidalChannelAdaptiveStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'The adaptive standard-step profile failed its reach, depth-change, energy or profile-zone closure checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    startProfileClassification,

    endProfileClassification,

    profileTrend,

    initialFlowDepth:
      input.initialFlowDepth,

    finalFlowDepth,

    totalDepthChange,

    minimumFlowDepth,

    maximumFlowDepth,

    totalReachLength:
      input.totalReachLength,

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

    startFlowArea,

    finalFlowArea,

    startVelocity,

    finalVelocity,

    startFroudeNumber,

    finalFroudeNumber,

    startSpecificEnergy,

    finalSpecificEnergy,

    startFrictionSlope,

    finalFrictionSlope,

    totalFrictionHeadLoss,

    averageFrictionSlope,

    bedElevationChange,

    waterSurfaceElevationChange,

    energyGradeLineChange,

    cumulativeSegmentEnergyResidual,

    totalEnergyClosureResidual,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,

    cumulativeDepthSolverIterations,

    profilePoints,

    modelName:
      'Adaptive Standard-Step GVF Profile for a Trapezoidal Channel',

    limitationDescription:
      'Adaptive multi-reach standard-step solution. Each candidate segment is solved with the standard-step energy equation and automatically halved when the predicted depth change exceeds the requested limit or the single-step solver cannot safely remain within the same GVF profile zone. The method does not integrate through hydraulic jumps or the critical-depth singularity.',
  }
}

export function createTrapezoidalChannelAdaptiveStandardStepProfileCsv(
  input:
    TrapezoidalChannelAdaptiveStandardStepProfileInput,
  result:
    TrapezoidalChannelAdaptiveStandardStepProfileResult,
): string {
  const rows: Array<
    Array<
      string |
      number
    >
  > = [
    [
      'Adaptive Standard-Step GVF Profile for a Trapezoidal Channel',
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
      'Initial flow depth',
      input.initialFlowDepth,
      'm',
    ],
    [
      'Total reach length',
      input.totalReachLength,
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
      'Summary Result',
      'Value',
      'Unit',
    ],
    [
      'GVF profile',
      result.startProfileClassification,
      '-',
    ],
    [
      'Final flow depth',
      result.finalFlowDepth,
      'm',
    ],
    [
      'Total depth change',
      result.totalDepthChange,
      'm',
    ],
    [
      'Accepted steps',
      result.acceptedStepCount,
      '-',
    ],
    [
      'Attempted steps',
      result.attemptedStepCount,
      '-',
    ],
    [
      'Adaptive reductions',
      result.adaptiveReductionCount,
      '-',
    ],
    [
      'Minimum accepted step length',
      result.minimumAcceptedStepLength,
      'm',
    ],
    [
      'Maximum accepted step length',
      result.maximumAcceptedStepLength,
      'm',
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
      'Step',
      'Distance (m)',
      'Accepted dx (m)',
      'Depth (m)',
      'Delta y (m)',
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
      point.stepIndex,

      point.distance,

      point.acceptedStepLength,

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
