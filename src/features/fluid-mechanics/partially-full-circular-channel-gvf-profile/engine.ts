import {
  PartiallyFullCircularChannelGvfSlopeError,
  calculatePartiallyFullCircularChannelGvfSlope,
} from '../partially-full-circular-channel-gvf-slope/engine.ts'

import type {
  PartiallyFullCircularChannelGvfSlopeResult,
} from '../partially-full-circular-channel-gvf-slope/types.ts'

import type {
  PartiallyFullCircularChannelGvfProfileInput,
  PartiallyFullCircularChannelGvfProfilePoint,
  PartiallyFullCircularChannelGvfProfileResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_GVF_PROFILE_ENGINE_VERSION =
  'partially-full-circular-channel-gvf-profile-rk4-v1'


export type PartiallyFullCircularChannelGvfProfileErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_INTEGRATION_DISTANCE'
  | 'INVALID_STEP_LENGTH'
  | 'TOO_MANY_STEPS'
  | 'PROFILE_APPROACHES_CRITICAL_FLOW'
  | 'PROFILE_CROSSES_CRITICAL_DEPTH'
  | 'PROFILE_LEAVES_PARTIAL_DEPTH_RANGE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelGvfProfileError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelGvfProfileErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelGvfProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelGvfProfileError'

    this.code =
      code
  }
}


const MAXIMUM_PROFILE_STEPS =
  5000


function validateTopLevelInput(
  input:
    PartiallyFullCircularChannelGvfProfileInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfProfileError(
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
    throw new PartiallyFullCircularChannelGvfProfileError(
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
    throw new PartiallyFullCircularChannelGvfProfileError(
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
    throw new PartiallyFullCircularChannelGvfProfileError(
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
    throw new PartiallyFullCircularChannelGvfProfileError(
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
    throw new PartiallyFullCircularChannelGvfProfileError(
      'INVALID_INTEGRATION_DISTANCE',
      'Integration distance must be finite and non-zero. Positive distance integrates downstream; negative distance integrates upstream.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumStepLength,
    ) ||
    input.maximumStepLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelGvfProfileError(
      'INVALID_STEP_LENGTH',
      'Maximum RK4 step length must be positive and finite.',
    )
  }
}


function evaluateState(
  input:
    PartiallyFullCircularChannelGvfProfileInput,
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
    throw new PartiallyFullCircularChannelGvfProfileError(
      'PROFILE_LEAVES_PARTIAL_DEPTH_RANGE',
      'The integrated profile leaves the valid partially full depth range 0 < y < D.',
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
      throw new PartiallyFullCircularChannelGvfProfileError(
        'PROFILE_APPROACHES_CRITICAL_FLOW',
        'The RK4 profile approaches critical flow, where the GVF differential equation becomes singular.',
      )
    }

    if (
      criticalOffset *
      initialCriticalSide <=
        0
    ) {
      throw new PartiallyFullCircularChannelGvfProfileError(
        'PROFILE_CROSSES_CRITICAL_DEPTH',
        'The requested continuous GVF profile crosses critical depth. Integrate each flow regime separately from its control section.',
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
        throw new PartiallyFullCircularChannelGvfProfileError(
          'PROFILE_APPROACHES_CRITICAL_FLOW',
          'The RK4 profile approaches the critical-flow singularity.',
        )
      }

      if (
        error.code ===
          'INVALID_FLOW_DEPTH'
      ) {
        throw new PartiallyFullCircularChannelGvfProfileError(
          'PROFILE_LEAVES_PARTIAL_DEPTH_RANGE',
          'The RK4 profile leaves the valid partially full depth range.',
        )
      }
    }

    throw error
  }
}


function createProfilePoint(
  input:
    PartiallyFullCircularChannelGvfProfileInput,
  index: number,
  distance: number,
  state:
    PartiallyFullCircularChannelGvfSlopeResult,
): PartiallyFullCircularChannelGvfProfilePoint {
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

    depthRatio:
      state.depthRatio,

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
  }
}


export function calculatePartiallyFullCircularChannelGvfProfile(
  input:
    PartiallyFullCircularChannelGvfProfileInput,
): PartiallyFullCircularChannelGvfProfileResult {
  validateTopLevelInput(
    input,
  )

  const numberOfSteps =
    Math.ceil(
      Math.abs(
        input.integrationDistance,
      ) /
      input.maximumStepLength,
    )

  if (
    numberOfSteps >
      MAXIMUM_PROFILE_STEPS
  ) {
    throw new PartiallyFullCircularChannelGvfProfileError(
      'TOO_MANY_STEPS',
      `The requested RK4 profile requires ${numberOfSteps} steps. Increase the maximum step length or shorten the integration distance; the current limit is ${MAXIMUM_PROFILE_STEPS} steps.`,
    )
  }

  const actualStepLength =
    input.integrationDistance /
    numberOfSteps

  const initialSlope =
    evaluateState(
      input,
      input.initialFlowDepth,
      null,
      null,
    )

  const criticalDepth =
    initialSlope.criticalDepth

  const initialCriticalSide =
    Math.sign(
      input.initialFlowDepth -
      criticalDepth,
    )

  if (
    initialCriticalSide ===
      0
  ) {
    throw new PartiallyFullCircularChannelGvfProfileError(
      'PROFILE_APPROACHES_CRITICAL_FLOW',
      'Initial depth is at the critical-flow control.',
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
    PartiallyFullCircularChannelGvfProfilePoint[] = [
      createProfilePoint(
        input,
        0,
        0,
        initialState,
      ),
    ]

  let currentDistance =
    0

  let currentDepth =
    input.initialFlowDepth

  let currentState =
    initialState

  let signedFrictionHeadChange =
    0

  for (
    let stepIndex = 1;
    stepIndex <=
      numberOfSteps;
    stepIndex +=
      1
  ) {
    const h =
      actualStepLength

    const k1 =
      currentState.depthGradient

    const stage2Depth =
      currentDepth +
      h *
      k1 /
      2

    const stage2 =
      evaluateState(
        input,
        stage2Depth,
        criticalDepth,
        initialCriticalSide,
      )

    const k2 =
      stage2.depthGradient

    const stage3Depth =
      currentDepth +
      h *
      k2 /
      2

    const stage3 =
      evaluateState(
        input,
        stage3Depth,
        criticalDepth,
        initialCriticalSide,
      )

    const k3 =
      stage3.depthGradient

    const stage4Depth =
      currentDepth +
      h *
      k3

    const stage4 =
      evaluateState(
        input,
        stage4Depth,
        criticalDepth,
        initialCriticalSide,
      )

    const k4 =
      stage4.depthGradient

    const nextDepth =
      currentDepth +
      h *
      (
        k1 +
        2 *
        k2 +
        2 *
        k3 +
        k4
      ) /
      6

    const nextDistance =
      currentDistance +
      h

    const nextState =
      evaluateState(
        input,
        nextDepth,
        criticalDepth,
        initialCriticalSide,
      )

    signedFrictionHeadChange +=
      (
        currentState.frictionSlope +
        nextState.frictionSlope
      ) /
      2 *
      h

    profilePoints.push(
      createProfilePoint(
        input,
        stepIndex,
        nextDistance,
        nextState,
      ),
    )

    currentDistance =
      nextDistance

    currentDepth =
      nextDepth

    currentState =
      nextState
  }

  const initialPoint =
    profilePoints[0]

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

  const energyClosureTolerance =
    Math.max(
      1e-6,
      frictionHeadLossMagnitude *
      5e-4,
    )

  const finiteValues = [
    actualStepLength,
    criticalDepth,
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
      numberOfSteps +
      1 ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyClosureTolerance
  ) {
    throw new PartiallyFullCircularChannelGvfProfileError(
      'NUMERICAL_FAILURE',
      'The RK4 GVF profile failed its finite-value, point-count or energy-closure checks.',
    )
  }

  const integrationDirection =
    input.integrationDistance >
      0
      ? 'Downstream integration'
      : 'Upstream integration'

  return {
    initialState:
      initialPoint,

    finalState:
      finalPoint,

    profilePoints,

    integrationDistance:
      input.integrationDistance,

    integrationDirection,

    numberOfSteps,

    actualStepLength,

    criticalDepth,

    flowRegime:
      initialState.flowRegime,

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
      'Partially Full Circular Channel GVF Profile — RK4',

    limitationDescription:
      'The profile integrates Calculator 462 using classical fourth-order Runge–Kutta. Circular open-channel geometry, Manning friction, hydrostatic pressure and gradually varied flow are assumed. The profile cannot cross the critical-flow singularity or the conduit crown, and the step length should be reduced to confirm numerical convergence.',
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


export function createPartiallyFullCircularChannelGvfProfileCsv(
  input:
    PartiallyFullCircularChannelGvfProfileInput,
  result:
    PartiallyFullCircularChannelGvfProfileResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel GVF Profile — RK4',
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
      'Maximum Step Length',
      input.maximumStepLength,
      'm',
    ],
    [],
    [
      'Summary',
      'Value',
      'Unit',
    ],
    [
      'Number of RK4 Steps',
      result.numberOfSteps,
      '-',
    ],
    [
      'Actual Step Length',
      result.actualStepLength,
      'm',
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
      'Minimum Flow Depth',
      result.minimumDepth,
      'm',
    ],
    [
      'Maximum Flow Depth',
      result.maximumDepth,
      'm',
    ],
    [
      'Friction Head Loss Magnitude',
      result.frictionHeadLossMagnitude,
      'm',
    ],
    [
      'Total Head Change',
      result.totalHeadChange,
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
