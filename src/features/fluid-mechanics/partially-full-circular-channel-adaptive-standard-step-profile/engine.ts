import {
  PartiallyFullCircularChannelStandardStepError,
  calculatePartiallyFullCircularChannelStandardStep,
} from '../partially-full-circular-channel-standard-step/engine.ts'

import type {
  PartiallyFullCircularChannelStandardStepResult,
} from '../partially-full-circular-channel-standard-step/types.ts'

import {
  calculatePartiallyFullCircularChannelGvfSlope,
} from '../partially-full-circular-channel-gvf-slope/engine.ts'

import type {
  PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
  PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint,
  PartiallyFullCircularChannelAdaptiveStandardStepProfileResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_ADAPTIVE_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'partially-full-circular-channel-adaptive-standard-step-profile-v1'


export type PartiallyFullCircularChannelAdaptiveStandardStepProfileErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_PROFILE_LENGTH'
  | 'INVALID_INITIAL_REACH'
  | 'INVALID_MINIMUM_REACH'
  | 'INVALID_MAXIMUM_REACH'
  | 'INVALID_REACH_RANGE'
  | 'INVALID_ABSOLUTE_TOLERANCE'
  | 'INVALID_RELATIVE_TOLERANCE'
  | 'TOO_MANY_TRIALS'
  | 'TOLERANCE_NOT_ACHIEVABLE'
  | 'STANDARD_STEP_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelAdaptiveStandardStepProfileError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelAdaptiveStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelAdaptiveStandardStepProfileError'

    this.code =
      code
  }
}


const MAXIMUM_ATTEMPTED_TRIALS =
  20000

const MAXIMUM_ACCEPTED_REACHES =
  5000

const SAFETY_FACTOR =
  0.9

const MINIMUM_GROWTH_FACTOR =
  0.2

const MAXIMUM_GROWTH_FACTOR =
  3


function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  )
}


function validateInput(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.initialFlowDepth,
    ) ||
    input.initialFlowDepth <=
      0 ||
    input.initialFlowDepth >=
      input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_INITIAL_DEPTH',
      'Initial flow depth must satisfy 0 < y0 < D.',
    )
  }

  if (
    !Number.isFinite(
      input.signedProfileLength,
    ) ||
    input.signedProfileLength ===
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_PROFILE_LENGTH',
      'Signed profile length must be finite and non-zero.',
    )
  }

  if (
    !Number.isFinite(
      input.initialReachLength,
    ) ||
    input.initialReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_INITIAL_REACH',
      'Initial standard-step reach length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.minimumReachLength,
    ) ||
    input.minimumReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_MINIMUM_REACH',
      'Minimum standard-step reach length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumReachLength,
    ) ||
    input.maximumReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_MAXIMUM_REACH',
      'Maximum standard-step reach length must be positive and finite.',
    )
  }

  if (
    input.minimumReachLength >
      input.initialReachLength ||
    input.initialReachLength >
      input.maximumReachLength
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'INVALID_RELATIVE_TOLERANCE',
      'Relative depth tolerance must be positive and finite.',
    )
  }
}


function solveStandardStep(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
  initialFlowDepth: number,
  signedReachLength: number,
): PartiallyFullCircularChannelStandardStepResult {
  return (
    calculatePartiallyFullCircularChannelStandardStep({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      manningRoughness:
        input.manningRoughness,

      channelSlope:
        input.channelSlope,

      initialFlowDepth,

      signedReachLength,
    })
  )
}


interface AdaptiveTrial {
  coarse:
    PartiallyFullCircularChannelStandardStepResult

  firstHalf:
    PartiallyFullCircularChannelStandardStepResult

  secondHalf:
    PartiallyFullCircularChannelStandardStepResult

  acceptedDepth: number

  localErrorEstimate: number

  errorRatio: number

  signedFrictionHeadChange: number

  energyResidual: number

  rootIterations: number

  rootCandidatesFound: number
}


function adaptiveTrial(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
  initialFlowDepth: number,
  signedReachLength: number,
): AdaptiveTrial {
  const coarse =
    solveStandardStep(
      input,
      initialFlowDepth,
      signedReachLength,
    )

  const firstHalf =
    solveStandardStep(
      input,
      initialFlowDepth,
      signedReachLength /
        2,
    )

  const secondHalf =
    solveStandardStep(
      input,
      firstHalf.solvedState.flowDepth,
      signedReachLength /
        2,
    )

  const acceptedDepth =
    secondHalf.solvedState.flowDepth

  const localErrorEstimate =
    Math.abs(
      acceptedDepth -
      coarse.solvedState.flowDepth,
    ) /
    3

  const errorScale =
    input.absoluteTolerance +
    input.relativeTolerance *
    Math.max(
      Math.abs(
        initialFlowDepth,
      ),
      Math.abs(
        acceptedDepth,
      ),
    )

  const errorRatio =
    localErrorEstimate /
    errorScale

  return {
    coarse,

    firstHalf,

    secondHalf,

    acceptedDepth,

    localErrorEstimate,

    errorRatio,

    signedFrictionHeadChange:
      firstHalf.signedFrictionHeadChange +
      secondHalf.signedFrictionHeadChange,

    energyResidual:
      firstHalf.energyResidual +
      secondHalf.energyResidual,

    rootIterations:
      coarse.rootIterations +
      firstHalf.rootIterations +
      secondHalf.rootIterations,

    rootCandidatesFound:
      Math.max(
        coarse.rootCandidatesFound,
        firstHalf.rootCandidatesFound,
        secondHalf.rootCandidatesFound,
      ),
  }
}


function createInitialPoint(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
): PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint {
  const local =
    calculatePartiallyFullCircularChannelGvfSlope({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      manningRoughness:
        input.manningRoughness,

      channelSlope:
        input.channelSlope,

      flowDepth:
        input.initialFlowDepth,
    })

  return {
    index:
      0,

    distance:
      0,

    flowDepth:
      input.initialFlowDepth,

    bedElevation:
      0,

    waterSurfaceElevation:
      input.initialFlowDepth,

    meanVelocity:
      local.meanVelocity,

    froudeNumber:
      local.froudeNumber,

    frictionSlope:
      local.frictionSlope,

    specificEnergy:
      local.specificEnergy,

    totalHead:
      local.specificEnergy,

    acceptedReachLength:
      0,

    localErrorEstimate:
      0,

    errorRatio:
      0,

    trialRootIterations:
      0,

    rootCandidatesFound:
      0,
  }
}


function createAcceptedPoint(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
  index: number,
  distance: number,
  signedReachLength: number,
  trial:
    AdaptiveTrial,
): PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint {
  const state =
    trial.secondHalf.solvedState

  const bedElevation =
    -input.channelSlope *
    distance

  const waterSurfaceElevation =
    bedElevation +
    state.flowDepth

  const totalHead =
    bedElevation +
    state.specificEnergy

  return {
    index,

    distance,

    flowDepth:
      state.flowDepth,

    bedElevation,

    waterSurfaceElevation,

    meanVelocity:
      state.meanVelocity,

    froudeNumber:
      state.froudeNumber,

    frictionSlope:
      state.frictionSlope,

    specificEnergy:
      state.specificEnergy,

    totalHead,

    acceptedReachLength:
      signedReachLength,

    localErrorEstimate:
      trial.localErrorEstimate,

    errorRatio:
      trial.errorRatio,

    trialRootIterations:
      trial.rootIterations,

    rootCandidatesFound:
      trial.rootCandidatesFound,
  }
}


export function calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
): PartiallyFullCircularChannelAdaptiveStandardStepProfileResult {
  validateInput(
    input,
  )

  const initialPoint =
    createInitialPoint(
      input,
    )

  const initialLocal =
    calculatePartiallyFullCircularChannelGvfSlope({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      manningRoughness:
        input.manningRoughness,

      channelSlope:
        input.channelSlope,

      flowDepth:
        input.initialFlowDepth,
    })

  const profilePoints:
    PartiallyFullCircularChannelAdaptiveStandardStepProfilePoint[] = [
      initialPoint,
    ]

  const targetDistance =
    input.signedProfileLength

  const direction =
    Math.sign(
      targetDistance,
    )

  let currentDistance =
    0

  let currentDepth =
    input.initialFlowDepth

  let reachMagnitude =
    clamp(
      input.initialReachLength,
      input.minimumReachLength,
      input.maximumReachLength,
    )

  let acceptedReaches =
    0

  let rejectedTrials =
    0

  let attemptedTrials =
    0

  let completedStandardStepSolves =
    0

  let totalRootIterations =
    0

  let signedFrictionHeadChange =
    0

  let minimumAcceptedReachLength =
    Number.POSITIVE_INFINITY

  let maximumAcceptedReachLength =
    0

  let maximumAcceptedErrorRatio =
    0

  const distanceTolerance =
    Math.max(
      1e-12,
      Math.abs(
        targetDistance,
      ) *
      1e-12,
    )

  while (
    Math.abs(
      targetDistance -
      currentDistance,
    ) >
      distanceTolerance
  ) {
    attemptedTrials +=
      1

    if (
      attemptedTrials >
        MAXIMUM_ATTEMPTED_TRIALS ||
      acceptedReaches >
        MAXIMUM_ACCEPTED_REACHES
    ) {
      throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
        'TOO_MANY_TRIALS',
        'Adaptive standard-step integration exceeded its permitted trial or accepted-reach count.',
      )
    }

    const remainingMagnitude =
      Math.abs(
        targetDistance -
        currentDistance,
      )

    const trialMagnitude =
      Math.min(
        reachMagnitude,
        remainingMagnitude,
      )

    const signedTrialReach =
      direction *
      trialMagnitude

    let trial:
      AdaptiveTrial

    try {
      trial =
        adaptiveTrial(
          input,
          currentDepth,
          signedTrialReach,
        )
    } catch (error) {
      if (
        error instanceof
          PartiallyFullCircularChannelStandardStepError
      ) {
        rejectedTrials +=
          1

        const allowedMinimum =
          Math.min(
            input.minimumReachLength,
            remainingMagnitude,
          )

        if (
          trialMagnitude <=
          allowedMinimum *
          (
            1 +
            1e-12
          )
        ) {
          throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
            'STANDARD_STEP_FAILURE',
            `Standard-step solution failed at the minimum permitted reach: ${error.message}`,
          )
        }

        reachMagnitude =
          Math.max(
            allowedMinimum,
            trialMagnitude /
            2,
          )

        continue
      }

      throw error
    }

    completedStandardStepSolves +=
      3

    totalRootIterations +=
      trial.rootIterations

    if (
      !Number.isFinite(
        trial.errorRatio,
      ) ||
      !Number.isFinite(
        trial.acceptedDepth,
      )
    ) {
      throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
        'NUMERICAL_FAILURE',
        'Adaptive standard-step trial produced a non-finite error estimate.',
      )
    }

    if (
      trial.errorRatio <=
        1
    ) {
      const nextDistance =
        (
          remainingMagnitude <=
          trialMagnitude +
          distanceTolerance
        )
          ? targetDistance
          : currentDistance +
            signedTrialReach

      const acceptedSignedReach =
        nextDistance -
        currentDistance

      acceptedReaches +=
        1

      signedFrictionHeadChange +=
        trial.signedFrictionHeadChange

      minimumAcceptedReachLength =
        Math.min(
          minimumAcceptedReachLength,
          trialMagnitude,
        )

      maximumAcceptedReachLength =
        Math.max(
          maximumAcceptedReachLength,
          trialMagnitude,
        )

      maximumAcceptedErrorRatio =
        Math.max(
          maximumAcceptedErrorRatio,
          trial.errorRatio,
        )

      profilePoints.push(
        createAcceptedPoint(
          input,
          acceptedReaches,
          nextDistance,
          acceptedSignedReach,
          trial,
        ),
      )

      currentDistance =
        nextDistance

      currentDepth =
        trial.acceptedDepth

      const growthFactor =
        trial.errorRatio ===
          0
          ? MAXIMUM_GROWTH_FACTOR
          : clamp(
              SAFETY_FACTOR *
              trial.errorRatio **
                (
                  -1 /
                  3
                ),
              MINIMUM_GROWTH_FACTOR,
              MAXIMUM_GROWTH_FACTOR,
            )

      reachMagnitude =
        clamp(
          trialMagnitude *
          growthFactor,
          input.minimumReachLength,
          input.maximumReachLength,
        )
    } else {
      rejectedTrials +=
        1

      const allowedMinimum =
        Math.min(
          input.minimumReachLength,
          remainingMagnitude,
        )

      if (
        trialMagnitude <=
        allowedMinimum *
        (
          1 +
          1e-12
        )
      ) {
        throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
          'TOLERANCE_NOT_ACHIEVABLE',
          'The requested depth tolerance cannot be achieved at the permitted minimum standard-step reach length.',
        )
      }

      const shrinkFactor =
        clamp(
          SAFETY_FACTOR *
          trial.errorRatio **
            (
              -1 /
              3
            ),
          0.1,
          0.5,
        )

      reachMagnitude =
        Math.max(
          allowedMinimum,
          trialMagnitude *
          shrinkFactor,
        )
    }
  }

  if (
    acceptedReaches <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive standard-step integration completed without an accepted reach.',
    )
  }

  const finalPoint =
    profilePoints[
      profilePoints.length -
      1
    ]

  let minimumDepth =
    initialPoint.flowDepth

  let maximumDepth =
    initialPoint.flowDepth

  for (
    const point of
      profilePoints
  ) {
    minimumDepth =
      Math.min(
        minimumDepth,
        point.flowDepth,
      )

    maximumDepth =
      Math.max(
        maximumDepth,
        point.flowDepth,
      )
  }

  const totalDepthChange =
    finalPoint.flowDepth -
    initialPoint.flowDepth

  const waterSurfaceElevationChange =
    finalPoint.waterSurfaceElevation -
    initialPoint.waterSurfaceElevation

  const totalHeadChange =
    finalPoint.totalHead -
    initialPoint.totalHead

  const frictionHeadLossMagnitude =
    Math.abs(
      signedFrictionHeadChange,
    )

  const energyClosureResidual =
    totalHeadChange +
    signedFrictionHeadChange

  const meanAcceptedReachLength =
    Math.abs(
      input.signedProfileLength,
    ) /
    acceptedReaches

  const closureTolerance =
    Math.max(
      1e-6,
      frictionHeadLossMagnitude *
      1e-5,
    )

  const finiteValues = [
    initialLocal.criticalDepth,
    minimumAcceptedReachLength,
    maximumAcceptedReachLength,
    meanAcceptedReachLength,
    maximumAcceptedErrorRatio,
    totalDepthChange,
    minimumDepth,
    maximumDepth,
    waterSurfaceElevationChange,
    signedFrictionHeadChange,
    frictionHeadLossMagnitude,
    totalHeadChange,
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
      acceptedReaches +
      1 ||
    attemptedTrials !==
      acceptedReaches +
      rejectedTrials ||
    Math.abs(
      finalPoint.distance -
      targetDistance,
    ) >
      distanceTolerance *
      10 ||
    Math.abs(
      energyClosureResidual,
    ) >
      closureTolerance
  ) {
    throw new PartiallyFullCircularChannelAdaptiveStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive standard-step profile failed its endpoint, accounting or energy-closure checks.',
    )
  }

  return {
    initialState:
      initialPoint,

    finalState:
      finalPoint,

    profilePoints,

    signedProfileLength:
      input.signedProfileLength,

    profileDirection:
      input.signedProfileLength >
        0
        ? 'Downstream adaptive profile'
        : 'Upstream adaptive profile',

    criticalDepth:
      initialLocal.criticalDepth,

    flowRegime:
      initialLocal.flowRegime,

    acceptedReaches,

    rejectedTrials,

    attemptedTrials,

    completedStandardStepSolves,

    totalRootIterations,

    minimumAcceptedReachLength,

    maximumAcceptedReachLength,

    meanAcceptedReachLength,

    maximumAcceptedErrorRatio,

    totalDepthChange,

    minimumDepth,

    maximumDepth,

    waterSurfaceElevationChange,

    signedFrictionHeadChange,

    frictionHeadLossMagnitude,

    totalHeadChange,

    energyClosureResidual,

    modelName:
      'Partially Full Circular Channel Adaptive Standard-Step GVF Profile',

    limitationDescription:
      'The solver compares one full standard-step reach with two half reaches. Their endpoint-depth difference provides a second-order Richardson error estimate, and reach length is automatically reduced or enlarged to satisfy absolute and relative depth tolerances. The accepted solution uses the two-half-reach path.',
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


export function createPartiallyFullCircularChannelAdaptiveStandardStepProfileCsv(
  input:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
  result:
    PartiallyFullCircularChannelAdaptiveStandardStepProfileResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Adaptive Standard-Step GVF Profile',
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
      'Initial Flow Depth',
      input.initialFlowDepth,
      'm',
    ],
    [
      'Signed Profile Length',
      input.signedProfileLength,
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
      'Final Flow Depth',
      result.finalState.flowDepth,
      'm',
    ],
    [
      'Total Depth Change',
      result.totalDepthChange,
      'm',
    ],
    [
      'Friction Head Loss',
      result.frictionHeadLossMagnitude,
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
      'Distance',
      'Flow Depth',
      'Bed Elevation',
      'Water Surface Elevation',
      'Velocity',
      'Froude Number',
      'Friction Slope',
      'Specific Energy',
      'Total Head',
      'Accepted Reach',
      'Local Error Estimate',
      'Error Ratio',
      'Trial Root Iterations',
      'Root Candidates',
    ],
  ]

  for (
    const point of
      result.profilePoints
  ) {
    rows.push([
      point.index,
      point.distance,
      point.flowDepth,
      point.bedElevation,
      point.waterSurfaceElevation,
      point.meanVelocity,
      point.froudeNumber,
      point.frictionSlope,
      point.specificEnergy,
      point.totalHead,
      point.acceptedReachLength,
      point.localErrorEstimate,
      point.errorRatio,
      point.trialRootIterations,
      point.rootCandidatesFound,
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
