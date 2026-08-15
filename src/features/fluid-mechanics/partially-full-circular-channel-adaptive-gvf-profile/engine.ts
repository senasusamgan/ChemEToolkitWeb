import {
  PartiallyFullCircularChannelGvfSlopeError,
  calculatePartiallyFullCircularChannelGvfSlope,
} from '../partially-full-circular-channel-gvf-slope/engine.ts'

import type {
  PartiallyFullCircularChannelGvfSlopeResult,
} from '../partially-full-circular-channel-gvf-slope/types.ts'

import type {
  PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  PartiallyFullCircularChannelAdaptiveGvfProfilePoint,
  PartiallyFullCircularChannelAdaptiveGvfProfileResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_ADAPTIVE_GVF_PROFILE_ENGINE_VERSION =
  'partially-full-circular-channel-adaptive-gvf-profile-v1'


export type PartiallyFullCircularChannelAdaptiveGvfProfileErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_INTEGRATION_DISTANCE'
  | 'INVALID_INITIAL_STEP'
  | 'INVALID_MINIMUM_STEP'
  | 'INVALID_MAXIMUM_STEP'
  | 'INVALID_STEP_RANGE'
  | 'INVALID_ABSOLUTE_TOLERANCE'
  | 'INVALID_RELATIVE_TOLERANCE'
  | 'TOO_MANY_STEPS'
  | 'TOLERANCE_NOT_ACHIEVABLE'
  | 'PROFILE_APPROACHES_CRITICAL_FLOW'
  | 'PROFILE_CROSSES_CRITICAL_DEPTH'
  | 'PROFILE_LEAVES_PARTIAL_DEPTH_RANGE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelAdaptiveGvfProfileError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelAdaptiveGvfProfileErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelAdaptiveGvfProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelAdaptiveGvfProfileError'

    this.code =
      code
  }
}


const MAXIMUM_ATTEMPTED_STEPS =
  20000

const MAXIMUM_ACCEPTED_STEPS =
  5000

const STEP_SAFETY_FACTOR =
  0.9

const MINIMUM_STEP_FACTOR =
  0.2

const MAXIMUM_STEP_FACTOR =
  5


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
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_INITIAL_DEPTH',
      'Initial flow depth must satisfy 0 < y0 < D.',
    )
  }

  if (
    !Number.isFinite(
      input.integrationDistance,
    ) ||
    input.integrationDistance ===
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_INTEGRATION_DISTANCE',
      'Integration distance must be finite and non-zero.',
    )
  }

  if (
    !Number.isFinite(
      input.initialStepLength,
    ) ||
    input.initialStepLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_INITIAL_STEP',
      'Initial adaptive step length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.minimumStepLength,
    ) ||
    input.minimumStepLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_MINIMUM_STEP',
      'Minimum adaptive step length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumStepLength,
    ) ||
    input.maximumStepLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_MAXIMUM_STEP',
      'Maximum adaptive step length must be positive and finite.',
    )
  }

  if (
    input.minimumStepLength >
      input.maximumStepLength ||
    input.initialStepLength <
      input.minimumStepLength ||
    input.initialStepLength >
      input.maximumStepLength
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_STEP_RANGE',
      'Adaptive step lengths must satisfy minimum ≤ initial ≤ maximum.',
    )
  }

  if (
    !Number.isFinite(
      input.absoluteTolerance,
    ) ||
    input.absoluteTolerance <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
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
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'INVALID_RELATIVE_TOLERANCE',
      'Relative depth tolerance must be positive and finite.',
    )
  }
}


function evaluateState(
  input:
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  flowDepth: number,
  criticalDepth: number | null,
  initialCriticalSide: number | null,
): PartiallyFullCircularChannelGvfSlopeResult {
  const depthMargin =
    Math.max(
      1e-10,
      input.pipeDiameter *
      1e-9,
    )

  if (
    !Number.isFinite(
      flowDepth,
    ) ||
    flowDepth <=
      depthMargin ||
    flowDepth >=
      input.pipeDiameter -
      depthMargin
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'PROFILE_LEAVES_PARTIAL_DEPTH_RANGE',
      'The adaptive profile leaves the valid partially full range 0 < y < D.',
    )
  }

  if (
    criticalDepth !==
      null &&
    initialCriticalSide !==
      null
  ) {
    const criticalOffset =
      flowDepth -
      criticalDepth

    const criticalMargin =
      Math.max(
        1e-8,
        input.pipeDiameter *
        1e-7,
      )

    if (
      Math.abs(
        criticalOffset,
      ) <=
        criticalMargin
    ) {
      throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
        'PROFILE_APPROACHES_CRITICAL_FLOW',
        'The adaptive profile approaches critical flow, where 1 − Fr² tends to zero.',
      )
    }

    if (
      criticalOffset *
      initialCriticalSide <=
        0
    ) {
      throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
        'PROFILE_CROSSES_CRITICAL_DEPTH',
        'A continuous GVF profile cannot cross the critical-flow singularity.',
      )
    }
  }

  try {
    return (
      calculatePartiallyFullCircularChannelGvfSlope({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          input.channelSlope,

        flowDepth,
      })
    )
  } catch (error) {
    if (
      error instanceof
        PartiallyFullCircularChannelGvfSlopeError
    ) {
      if (
        error.code ===
          'NEAR_CRITICAL_FLOW'
      ) {
        throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
          'PROFILE_APPROACHES_CRITICAL_FLOW',
          'The adaptive RK4 stages approach the critical-flow singularity.',
        )
      }

      if (
        error.code ===
          'INVALID_FLOW_DEPTH'
      ) {
        throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
          'PROFILE_LEAVES_PARTIAL_DEPTH_RANGE',
          'The adaptive profile leaves the partially full circular-flow domain.',
        )
      }
    }

    throw error
  }
}


interface Rk4StepResult {
  flowDepth: number

  functionEvaluations: number
}


function rk4Step(
  input:
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  flowDepth: number,
  stepLength: number,
  criticalDepth: number,
  initialCriticalSide: number,
): Rk4StepResult {
  const state1 =
    evaluateState(
      input,
      flowDepth,
      criticalDepth,
      initialCriticalSide,
    )

  const k1 =
    state1.depthGradient

  const state2 =
    evaluateState(
      input,
      flowDepth +
      stepLength *
      k1 /
      2,
      criticalDepth,
      initialCriticalSide,
    )

  const k2 =
    state2.depthGradient

  const state3 =
    evaluateState(
      input,
      flowDepth +
      stepLength *
      k2 /
      2,
      criticalDepth,
      initialCriticalSide,
    )

  const k3 =
    state3.depthGradient

  const state4 =
    evaluateState(
      input,
      flowDepth +
      stepLength *
      k3,
      criticalDepth,
      initialCriticalSide,
    )

  const k4 =
    state4.depthGradient

  const nextDepth =
    flowDepth +
    stepLength *
    (
      k1 +
      2 *
      k2 +
      2 *
      k3 +
      k4
    ) /
    6

  evaluateState(
    input,
    nextDepth,
    criticalDepth,
    initialCriticalSide,
  )

  return {
    flowDepth:
      nextDepth,

    functionEvaluations:
      5,
  }
}


interface AdaptiveTrialResult {
  acceptedDepth: number

  errorEstimate: number

  errorRatio: number

  functionEvaluations: number
}


function adaptiveTrial(
  input:
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  flowDepth: number,
  stepLength: number,
  criticalDepth: number,
  initialCriticalSide: number,
): AdaptiveTrialResult {
  const coarse =
    rk4Step(
      input,
      flowDepth,
      stepLength,
      criticalDepth,
      initialCriticalSide,
    )

  const firstHalf =
    rk4Step(
      input,
      flowDepth,
      stepLength /
      2,
      criticalDepth,
      initialCriticalSide,
    )

  const secondHalf =
    rk4Step(
      input,
      firstHalf.flowDepth,
      stepLength /
      2,
      criticalDepth,
      initialCriticalSide,
    )

  const difference =
    secondHalf.flowDepth -
    coarse.flowDepth

  const errorEstimate =
    Math.abs(
      difference,
    ) /
    15

  const richardsonDepth =
    secondHalf.flowDepth +
    difference /
    15

  evaluateState(
    input,
    richardsonDepth,
    criticalDepth,
    initialCriticalSide,
  )

  const errorScale =
    input.absoluteTolerance +
    input.relativeTolerance *
    Math.max(
      Math.abs(
        flowDepth,
      ),
      Math.abs(
        richardsonDepth,
      ),
    )

  const errorRatio =
    errorEstimate /
    errorScale

  return {
    acceptedDepth:
      richardsonDepth,

    errorEstimate,

    errorRatio,

    functionEvaluations:
      coarse.functionEvaluations +
      firstHalf.functionEvaluations +
      secondHalf.functionEvaluations +
      1,
  }
}


function createProfilePoint(
  input:
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  index: number,
  distance: number,
  state:
    PartiallyFullCircularChannelGvfSlopeResult,
  acceptedStepLength: number,
  localErrorEstimate: number,
  errorRatio: number,
): PartiallyFullCircularChannelAdaptiveGvfProfilePoint {
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

    depthGradient:
      state.depthGradient,

    acceptedStepLength,

    localErrorEstimate,

    errorRatio,
  }
}


export function calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
  input:
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
): PartiallyFullCircularChannelAdaptiveGvfProfileResult {
  validateInput(
    input,
  )

  const initialRawState =
    evaluateState(
      input,
      input.initialFlowDepth,
      null,
      null,
    )

  const criticalDepth =
    initialRawState.criticalDepth

  const initialCriticalSide =
    Math.sign(
      input.initialFlowDepth -
      criticalDepth,
    )

  if (
    initialCriticalSide ===
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'PROFILE_APPROACHES_CRITICAL_FLOW',
      'Initial flow depth is at the critical-flow control.',
    )
  }

  const initialState =
    evaluateState(
      input,
      input.initialFlowDepth,
      criticalDepth,
      initialCriticalSide,
    )

  const profilePoints:
    PartiallyFullCircularChannelAdaptiveGvfProfilePoint[] = [
      createProfilePoint(
        input,
        0,
        0,
        initialState,
        0,
        0,
        0,
      ),
    ]

  const targetDistance =
    input.integrationDistance

  const direction =
    Math.sign(
      targetDistance,
    )

  let currentDistance =
    0

  let currentDepth =
    input.initialFlowDepth

  let currentState =
    initialState

  let stepMagnitude =
    clamp(
      input.initialStepLength,
      input.minimumStepLength,
      input.maximumStepLength,
    )

  let acceptedSteps =
    0

  let rejectedSteps =
    0

  let attemptedSteps =
    0

  let functionEvaluations =
    1

  let minimumAcceptedStepLength =
    Number.POSITIVE_INFINITY

  let maximumAcceptedStepLength =
    0

  let maximumAcceptedErrorRatio =
    0

  let signedFrictionHeadChange =
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
    attemptedSteps +=
      1

    if (
      attemptedSteps >
        MAXIMUM_ATTEMPTED_STEPS
    ) {
      throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
        'TOO_MANY_STEPS',
        `Adaptive integration exceeded ${MAXIMUM_ATTEMPTED_STEPS} attempted steps.`,
      )
    }

    if (
      acceptedSteps >
        MAXIMUM_ACCEPTED_STEPS
    ) {
      throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
        'TOO_MANY_STEPS',
        `Adaptive integration exceeded ${MAXIMUM_ACCEPTED_STEPS} accepted profile steps.`,
      )
    }

    const remainingMagnitude =
      Math.abs(
        targetDistance -
        currentDistance,
      )

    const trialMagnitude =
      Math.min(
        stepMagnitude,
        remainingMagnitude,
      )

    const trialStep =
      direction *
      trialMagnitude

    const trial =
      adaptiveTrial(
        input,
        currentDepth,
        trialStep,
        criticalDepth,
        initialCriticalSide,
      )

    functionEvaluations +=
      trial.functionEvaluations

    if (
      !Number.isFinite(
        trial.errorRatio,
      ) ||
      !Number.isFinite(
        trial.acceptedDepth,
      )
    ) {
      throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
        'NUMERICAL_FAILURE',
        'Adaptive RK4 produced a non-finite local error estimate.',
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
            trialStep

      const nextState =
        evaluateState(
          input,
          trial.acceptedDepth,
          criticalDepth,
          initialCriticalSide,
        )

      functionEvaluations +=
        1

      signedFrictionHeadChange +=
        (
          currentState.frictionSlope +
          nextState.frictionSlope
        ) /
        2 *
        (
          nextDistance -
          currentDistance
        )

      acceptedSteps +=
        1

      minimumAcceptedStepLength =
        Math.min(
          minimumAcceptedStepLength,
          trialMagnitude,
        )

      maximumAcceptedStepLength =
        Math.max(
          maximumAcceptedStepLength,
          trialMagnitude,
        )

      maximumAcceptedErrorRatio =
        Math.max(
          maximumAcceptedErrorRatio,
          trial.errorRatio,
        )

      profilePoints.push(
        createProfilePoint(
          input,
          acceptedSteps,
          nextDistance,
          nextState,
          nextDistance -
          currentDistance,
          trial.errorEstimate,
          trial.errorRatio,
        ),
      )

      currentDistance =
        nextDistance

      currentDepth =
        trial.acceptedDepth

      currentState =
        nextState

      const growthFactor =
        trial.errorRatio ===
          0
          ? MAXIMUM_STEP_FACTOR
          : clamp(
              STEP_SAFETY_FACTOR *
              trial.errorRatio **
                (-0.2),
              MINIMUM_STEP_FACTOR,
              MAXIMUM_STEP_FACTOR,
            )

      stepMagnitude =
        clamp(
          trialMagnitude *
          growthFactor,
          input.minimumStepLength,
          input.maximumStepLength,
        )
    } else {
      rejectedSteps +=
        1

      const allowedMinimum =
        Math.min(
          input.minimumStepLength,
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
        throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
          'TOLERANCE_NOT_ACHIEVABLE',
          'The requested adaptive tolerance cannot be achieved at the permitted minimum step length.',
        )
      }

      const shrinkFactor =
        clamp(
          STEP_SAFETY_FACTOR *
          trial.errorRatio **
            (-0.2),
          0.1,
          0.5,
        )

      stepMagnitude =
        Math.max(
          allowedMinimum,
          trialMagnitude *
          shrinkFactor,
        )
    }
  }

  const initialPoint =
    profilePoints[0]

  const finalPoint =
    profilePoints[
      profilePoints.length -
      1
    ]

  if (
    acceptedSteps <=
      0
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive RK4 completed without an accepted integration step.',
    )
  }

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

  const meanAcceptedStepLength =
    Math.abs(
      input.integrationDistance,
    ) /
    acceptedSteps

  const finiteValues = [
    criticalDepth,
    minimumAcceptedStepLength,
    maximumAcceptedStepLength,
    meanAcceptedStepLength,
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

  const energyClosureTolerance =
    Math.max(
      2e-5,
      frictionHeadLossMagnitude *
      0.005,
    )

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    profilePoints.length !==
      acceptedSteps +
      1 ||
    Math.abs(
      finalPoint.distance -
      targetDistance,
    ) >
      distanceTolerance *
      10 ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyClosureTolerance
  ) {
    throw new PartiallyFullCircularChannelAdaptiveGvfProfileError(
      'NUMERICAL_FAILURE',
      'Adaptive RK4 failed its endpoint, profile-count or longitudinal energy checks.',
    )
  }

  return {
    initialState:
      initialPoint,

    finalState:
      finalPoint,

    profilePoints,

    integrationDistance:
      input.integrationDistance,

    integrationDirection:
      input.integrationDistance >
        0
        ? 'Downstream integration'
        : 'Upstream integration',

    criticalDepth,

    flowRegime:
      initialState.flowRegime,

    acceptedSteps,

    rejectedSteps,

    attemptedSteps,

    functionEvaluations,

    minimumAcceptedStepLength,

    maximumAcceptedStepLength,

    meanAcceptedStepLength,

    maximumAcceptedErrorRatio,

    initialDepthGradient:
      initialState.depthGradient,

    finalDepthGradient:
      currentState.depthGradient,

    totalDepthChange,

    minimumDepth,

    maximumDepth,

    waterSurfaceElevationChange,

    signedFrictionHeadChange,

    frictionHeadLossMagnitude,

    totalHeadChange,

    energyClosureResidual,

    modelName:
      'Partially Full Circular Channel Adaptive GVF Profile — RK4',

    limitationDescription:
      'Adaptive fourth-order Runge–Kutta integration uses step doubling and Richardson error estimation to control local depth error. The solver remains within a single critical-flow regime and the partially full circular domain. Absolute and relative tolerances control numerical accuracy; tighter tolerances generally require more accepted or rejected steps.',
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


export function createPartiallyFullCircularChannelAdaptiveGvfProfileCsv(
  input:
    PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  result:
    PartiallyFullCircularChannelAdaptiveGvfProfileResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Adaptive GVF Profile — RK4',
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
      'Integration Distance',
      input.integrationDistance,
      'm',
    ],
    [
      'Initial Step Length',
      input.initialStepLength,
      'm',
    ],
    [
      'Minimum Step Length',
      input.minimumStepLength,
      'm',
    ],
    [
      'Maximum Step Length',
      input.maximumStepLength,
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
      'Accepted Steps',
      result.acceptedSteps,
      '-',
    ],
    [
      'Rejected Steps',
      result.rejectedSteps,
      '-',
    ],
    [
      'Attempted Steps',
      result.attemptedSteps,
      '-',
    ],
    [
      'Function Evaluations',
      result.functionEvaluations,
      '-',
    ],
    [
      'Minimum Accepted Step',
      result.minimumAcceptedStepLength,
      'm',
    ],
    [
      'Maximum Accepted Step',
      result.maximumAcceptedStepLength,
      'm',
    ],
    [
      'Mean Accepted Step',
      result.meanAcceptedStepLength,
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
      'Profile Point',
      'Distance',
      'Flow Depth',
      'Bed Elevation',
      'Water Surface Elevation',
      'Velocity',
      'Froude Number',
      'Friction Slope',
      'Specific Energy',
      'Total Head',
      'dy/dx',
      'Accepted Step',
      'Local Error Estimate',
      'Error Ratio',
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
      point.depthGradient,
      point.acceptedStepLength,
      point.localErrorEstimate,
      point.errorRatio,
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
