import {
  TrapezoidalChannelStandardStepError,
  calculateTrapezoidalChannelStandardStep,
} from '../trapezoidal-channel-standard-step/engine.ts'

import type {
  TrapezoidalChannelStandardStepProfileInput,
  TrapezoidalChannelStandardStepProfilePoint,
  TrapezoidalChannelStandardStepProfileResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'trapezoidal-channel-standard-step-profile-v1'

export type TrapezoidalChannelStandardStepProfileErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_REACH_LENGTH'
  | 'INVALID_NUMBER_OF_STEPS'
  | 'INVALID_DENSITY'
  | 'STEP_FAILURE'
  | 'PROFILE_ZONE_CHANGE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelStandardStepProfileError
  extends Error {
  readonly code:
    TrapezoidalChannelStandardStepProfileErrorCode

  constructor(
    code:
      TrapezoidalChannelStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelStandardStepProfileError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalChannelStandardStepProfile(
  input:
    TrapezoidalChannelStandardStepProfileInput,
): TrapezoidalChannelStandardStepProfileResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepProfileError(
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
    throw new TrapezoidalChannelStandardStepProfileError(
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
    throw new TrapezoidalChannelStandardStepProfileError(
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
    throw new TrapezoidalChannelStandardStepProfileError(
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
    throw new TrapezoidalChannelStandardStepProfileError(
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
    throw new TrapezoidalChannelStandardStepProfileError(
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
    throw new TrapezoidalChannelStandardStepProfileError(
      'INVALID_REACH_LENGTH',
      'Total downstream reach length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.numberOfSteps,
    ) ||
    !Number.isInteger(
      input.numberOfSteps,
    ) ||
    input.numberOfSteps <
      1 ||
    input.numberOfSteps >
      2000
  ) {
    throw new TrapezoidalChannelStandardStepProfileError(
      'INVALID_NUMBER_OF_STEPS',
      'Number of standard steps must be an integer from 1 to 2000.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepProfileError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const stepLength =
    input.totalReachLength /
    input.numberOfSteps

  let currentDepth =
    input.initialFlowDepth

  let startProfileClassification =
    ''

  let channelSlopeClass =
    ''

  let criticalDepth =
    Number.NaN

  let normalDepth =
    Number.NaN

  let startFlowArea =
    Number.NaN

  let startVelocity =
    Number.NaN

  let startFroudeNumber =
    Number.NaN

  let startSpecificEnergy =
    Number.NaN

  let startFrictionSlope =
    Number.NaN

  let finalFlowArea =
    Number.NaN

  let finalVelocity =
    Number.NaN

  let finalFroudeNumber =
    Number.NaN

  let finalSpecificEnergy =
    Number.NaN

  let finalFrictionSlope =
    Number.NaN

  let finalProfileClassification =
    ''

  let totalFrictionHeadLoss =
    0

  let cumulativeSegmentEnergyResidual =
    0

  let cumulativeDepthSolverIterations =
    0

  let maximumAbsoluteDepthGradient =
    0

  const profilePoints:
    TrapezoidalChannelStandardStepProfilePoint[] =
    []

  for (
    let stepIndex = 1;
    stepIndex <=
      input.numberOfSteps;
    stepIndex += 1
  ) {
    let step

    try {
      step =
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
            stepLength,

          fluidDensity:
            input.fluidDensity,
        })
    } catch (error) {
      if (
        error instanceof
        TrapezoidalChannelStandardStepError
      ) {
        throw new TrapezoidalChannelStandardStepProfileError(
          'STEP_FAILURE',
          `Standard-step profile failed at segment ${stepIndex}/${input.numberOfSteps}: ${error.message}`,
        )
      }

      throw error
    }

    if (
      stepIndex ===
      1
    ) {
      startProfileClassification =
        step.profileClassification

      channelSlopeClass =
        step.channelSlopeClass

      criticalDepth =
        step.criticalDepth

      normalDepth =
        step.normalDepth

      startFlowArea =
        step.startFlowArea

      startVelocity =
        step.startVelocity

      startFroudeNumber =
        step.startFroudeNumber

      startSpecificEnergy =
        step.startSpecificEnergy

      startFrictionSlope =
        step.startFrictionSlope

      maximumAbsoluteDepthGradient =
        Math.max(
          Math.abs(
            step.localGvfDepthGradientAtStart,
          ),
          Math.abs(
            step.localGvfDepthGradientAtEnd,
          ),
        )

      profilePoints.push({
        stepIndex:
          0,

        distance:
          0,

        flowDepth:
          input.initialFlowDepth,

        flowArea:
          step.startFlowArea,

        velocity:
          step.startVelocity,

        froudeNumber:
          step.startFroudeNumber,

        specificEnergy:
          step.startSpecificEnergy,

        frictionSlope:
          step.startFrictionSlope,

        localDepthGradient:
          step.localGvfDepthGradientAtStart,

        cumulativeFrictionHeadLoss:
          0,
      })
    } else if (
      step.profileClassification !==
      startProfileClassification
    ) {
      throw new TrapezoidalChannelStandardStepProfileError(
        'PROFILE_ZONE_CHANGE',
        `GVF profile changed from ${startProfileClassification} to ${step.profileClassification} at segment ${stepIndex}. Reduce the total reach or increase the number of steps.`,
      )
    }

    totalFrictionHeadLoss +=
      step.frictionHeadLoss

    cumulativeSegmentEnergyResidual +=
      step.standardStepEnergyResidual

    cumulativeDepthSolverIterations +=
      step.depthSolverIterations

    maximumAbsoluteDepthGradient =
      Math.max(
        maximumAbsoluteDepthGradient,
        Math.abs(
          step.localGvfDepthGradientAtStart,
        ),
        Math.abs(
          step.localGvfDepthGradientAtEnd,
        ),
      )

    currentDepth =
      step.endDepth

    finalFlowArea =
      step.endFlowArea

    finalVelocity =
      step.endVelocity

    finalFroudeNumber =
      step.endFroudeNumber

    finalSpecificEnergy =
      step.endSpecificEnergy

    finalFrictionSlope =
      step.endFrictionSlope

    finalProfileClassification =
      step.profileClassification

    profilePoints.push({
      stepIndex,

      distance:
        stepIndex *
        stepLength,

      flowDepth:
        step.endDepth,

      flowArea:
        step.endFlowArea,

      velocity:
        step.endVelocity,

      froudeNumber:
        step.endFroudeNumber,

      specificEnergy:
        step.endSpecificEnergy,

      frictionSlope:
        step.endFrictionSlope,

      localDepthGradient:
        step.localGvfDepthGradientAtEnd,

      cumulativeFrictionHeadLoss:
        totalFrictionHeadLoss,
    })
  }

  const finalFlowDepth =
    currentDepth

  const depthChange =
    finalFlowDepth -
    input.initialFlowDepth

  const profileTrend =
    depthChange >
    0
      ? 'Flow depth increases downstream'
      : depthChange <
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

  const averageFrictionSlope =
    totalFrictionHeadLoss /
    input.totalReachLength

  const bedElevationChange =
    -input.channelSlope *
    input.totalReachLength

  const waterSurfaceElevationChange =
    bedElevationChange +
    depthChange

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

    stepLength,

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
    depthChange,

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
      input.numberOfSteps +
      1 ||
    startProfileClassification !==
      finalProfileClassification ||
    Math.abs(
      cumulativeSegmentEnergyResidual,
    ) >
      energyTolerance ||
    Math.abs(
      totalEnergyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalChannelStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'The multi-reach standard-step profile failed its point-count, energy or GVF profile-zone checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    startProfileClassification,

    endProfileClassification:
      finalProfileClassification,

    profileTrend,

    initialFlowDepth:
      input.initialFlowDepth,

    finalFlowDepth,

    depthChange,

    minimumFlowDepth,

    maximumFlowDepth,

    totalReachLength:
      input.totalReachLength,

    numberOfSteps:
      input.numberOfSteps,

    stepLength,

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
      'Trapezoidal Channel Multi-Reach Standard-Step GVF Profile',

    limitationDescription:
      'The total reach is divided into equal standard-step segments. Each segment solves the implicit endpoint energy equation using Manning friction and average endpoint friction slope. The profile must remain within one GVF zone; reaches approaching normal-depth or critical-depth asymptotes should use more, shorter steps.',
  }
}

export function createTrapezoidalChannelStandardStepProfileCsv(
  input:
    TrapezoidalChannelStandardStepProfileInput,
  result:
    TrapezoidalChannelStandardStepProfileResult,
): string {
  const rows: Array<Array<string | number>> = [
    [
      'Trapezoidal Channel Multi-Reach Standard-Step GVF Profile',
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
      'Number of steps',
      input.numberOfSteps,
      '-',
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
      'Depth change',
      result.depthChange,
      'm',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Normal depth',
      result.normalDepth,
      'm',
    ],
    [
      'Step length',
      result.stepLength,
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
      'Water-surface elevation change',
      result.waterSurfaceElevationChange,
      'm',
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
      'Depth (m)',
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

      point.flowDepth,

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
