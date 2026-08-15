import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfSlope,
} from '../partially-full-circular-channel-gvf-slope/engine.ts'

import type {
  PartiallyFullCircularChannelStandardStepInput,
  PartiallyFullCircularChannelStandardStepResult,
  PartiallyFullCircularChannelStandardStepState,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_STANDARD_STEP_ENGINE_VERSION =
  'partially-full-circular-channel-standard-step-v1'


export type PartiallyFullCircularChannelStandardStepErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_REACH_LENGTH'
  | 'INITIAL_STATE_NEAR_CRITICAL'
  | 'NO_PHYSICAL_ROOT'
  | 'NEAR_UNIFORM_REACH'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelStandardStepError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelStandardStepErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelStandardStepErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelStandardStepError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665

const ROOT_SCAN_SEGMENTS =
  1600

const MAXIMUM_BISECTION_ITERATIONS =
  140


function stateAtDepth(
  input:
    PartiallyFullCircularChannelStandardStepInput,
  flowDepth: number,
): PartiallyFullCircularChannelStandardStepState {
  const radius =
    input.pipeDiameter /
    2

  const theta =
    2 *
    Math.acos(
      Math.min(
        1,
        Math.max(
          -1,
          (
            radius -
            flowDepth
          ) /
          radius,
        ),
      ),
    )

  const flowArea =
    radius *
    radius /
    2 *
    (
      theta -
      Math.sin(theta)
    )

  const centerElevation =
    flowDepth -
    radius

  const halfTopWidth =
    Math.sqrt(
      Math.max(
        0,
        radius *
        radius -
        centerElevation *
        centerElevation,
      ),
    )

  const topWidth =
    2 *
    halfTopWidth

  const wettedPerimeter =
    radius *
    theta

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const meanVelocity =
    input.volumetricFlowRate /
    flowArea

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

  const specificEnergy =
    flowDepth +
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  return {
    flowDepth,

    depthRatio:
      flowDepth /
      input.pipeDiameter,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    froudeNumber,

    frictionSlope,

    specificEnergy,
  }
}


function validateInput(
  input:
    PartiallyFullCircularChannelStandardStepInput,
) {
  if (
    !Number.isFinite(input.pipeDiameter) ||
    input.pipeDiameter <= 0
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(input.volumetricFlowRate) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(input.manningRoughness) ||
    input.manningRoughness <= 0
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(input.channelSlope) ||
    input.channelSlope <= 0
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(input.initialFlowDepth) ||
    input.initialFlowDepth <= 0 ||
    input.initialFlowDepth >= input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INVALID_INITIAL_DEPTH',
      'Initial flow depth must satisfy 0 < y1 < D.',
    )
  }

  if (
    !Number.isFinite(input.signedReachLength) ||
    input.signedReachLength === 0
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INVALID_REACH_LENGTH',
      'Signed reach length must be finite and non-zero.',
    )
  }
}


export function calculatePartiallyFullCircularChannelStandardStep(
  input:
    PartiallyFullCircularChannelStandardStepInput,
): PartiallyFullCircularChannelStandardStepResult {
  validateInput(input)

  const initialState =
    stateAtDepth(
      input,
      input.initialFlowDepth,
    )

  const critical =
    calculatePartiallyFullCircularChannelCriticalDepth({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      fluidDensity:
        1000,
    })

  const criticalDepth =
    critical.criticalDepth

  const criticalMargin =
    Math.max(
      1e-7,
      input.pipeDiameter *
      1e-6,
    )

  const initialCriticalOffset =
    input.initialFlowDepth -
    criticalDepth

  if (
    Math.abs(initialCriticalOffset) <=
    criticalMargin
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'INITIAL_STATE_NEAR_CRITICAL',
      'Initial depth is too close to the critical-flow singularity.',
    )
  }

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

  const localDepthGradient =
    local.depthGradient

  const localLinearDepthPrediction =
    input.initialFlowDepth +
    localDepthGradient *
    input.signedReachLength

  const initialIsSubcritical =
    initialCriticalOffset >
    0

  const lowerDepth =
    initialIsSubcritical
      ? criticalDepth +
        criticalMargin
      : Math.max(
          criticalMargin,
          input.pipeDiameter *
          1e-7,
        )

  const upperDepth =
    initialIsSubcritical
      ? input.pipeDiameter -
        criticalMargin
      : criticalDepth -
        criticalMargin

  const energyTolerance =
    Math.max(
      1e-11,
      Math.abs(
        input.signedReachLength
      ) *
      1e-13,
    )

  const depthTolerance =
    Math.max(
      1e-10,
      input.pipeDiameter *
      1e-10,
    )

  function residual(
    flowDepth: number,
  ): number {
    const state =
      stateAtDepth(
        input,
        flowDepth,
      )

    const averageFrictionSlope =
      (
        initialState.frictionSlope +
        state.frictionSlope
      ) /
      2

    return (
      state.specificEnergy -
      initialState.specificEnergy +
      (
        averageFrictionSlope -
        input.channelSlope
      ) *
      input.signedReachLength
    )
  }

  const brackets:
    Array<
      [
        number,
        number,
      ]
    > = []

  let previousDepth =
    lowerDepth

  let previousResidual =
    residual(
      previousDepth,
    )

  for (
    let index = 1;
    index <= ROOT_SCAN_SEGMENTS;
    index += 1
  ) {
    const fraction =
      index /
      ROOT_SCAN_SEGMENTS

    const currentDepth =
      lowerDepth +
      (
        upperDepth -
        lowerDepth
      ) *
      fraction

    const currentResidual =
      residual(
        currentDepth,
      )

    if (
      Number.isFinite(previousResidual) &&
      Number.isFinite(currentResidual)
    ) {
      if (
        previousResidual === 0
      ) {
        brackets.push([
          previousDepth -
          depthTolerance,
          previousDepth +
          depthTolerance,
        ])
      } else if (
        previousResidual *
        currentResidual <
        0
      ) {
        brackets.push([
          previousDepth,
          currentDepth,
        ])
      }
    }

    previousDepth =
      currentDepth

    previousResidual =
      currentResidual
  }

  const roots:
    Array<{
      depth: number
      iterations: number
    }> = []

  for (
    const bracket of
      brackets
  ) {
    let lower =
      Math.max(
        lowerDepth,
        bracket[0],
      )

    let upper =
      Math.min(
        upperDepth,
        bracket[1],
      )

    let lowerResidual =
      residual(lower)

    let upperResidual =
      residual(upper)

    if (
      !Number.isFinite(lowerResidual) ||
      !Number.isFinite(upperResidual)
    ) {
      continue
    }

    let root =
      (
        lower +
        upper
      ) /
      2

    let iterations =
      0

    for (
      iterations = 1;
      iterations <=
        MAXIMUM_BISECTION_ITERATIONS;
      iterations += 1
    ) {
      root =
        (
          lower +
          upper
        ) /
        2

      const rootResidual =
        residual(root)

      if (
        Math.abs(rootResidual) <=
          energyTolerance ||
        Math.abs(
          upper -
          lower
        ) <=
          depthTolerance
      ) {
        break
      }

      if (
        lowerResidual *
        rootResidual <=
        0
      ) {
        upper =
          root

        upperResidual =
          rootResidual
      } else {
        lower =
          root

        lowerResidual =
          rootResidual
      }
    }

    if (
      iterations >
      MAXIMUM_BISECTION_ITERATIONS
    ) {
      throw new PartiallyFullCircularChannelStandardStepError(
        'ROOT_CONVERGENCE_FAILURE',
        'Standard-step bisection failed to converge.',
      )
    }

    if (
      !roots.some(
        candidate =>
          Math.abs(
            candidate.depth -
            root,
          ) <
          depthTolerance *
          20,
      )
    ) {
      roots.push({
        depth:
          root,

        iterations,
      })
    }
  }

  if (roots.length === 0) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'NO_PHYSICAL_ROOT',
      'No same-regime partially full standard-step depth satisfies the specified reach.',
    )
  }

  const predictedChange =
    localLinearDepthPrediction -
    input.initialFlowDepth

  const changeTolerance =
    Math.max(
      1e-9,
      input.pipeDiameter *
      1e-8,
    )

  const directionalRoots =
    Math.abs(predictedChange) <=
      changeTolerance
      ? roots
      : roots.filter(
          candidate =>
            (
              candidate.depth -
              input.initialFlowDepth
            ) *
            predictedChange >
            0,
        )

  const selectionPool =
    directionalRoots.length >
      0
      ? directionalRoots
      : roots

  selectionPool.sort(
    (
      first,
      second,
    ) =>
      Math.abs(
        first.depth -
        localLinearDepthPrediction
      ) -
      Math.abs(
        second.depth -
        localLinearDepthPrediction
      ),
  )

  const selected =
    selectionPool[0]

  const solvedState =
    stateAtDepth(
      input,
      selected.depth,
    )

  const solvedIsSubcritical =
    solvedState.flowDepth >
    criticalDepth

  if (
    solvedIsSubcritical !==
    initialIsSubcritical
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'NO_PHYSICAL_ROOT',
      'Solved depth lies across the critical-flow control.',
    )
  }

  const averageFrictionSlope =
    (
      initialState.frictionSlope +
      solvedState.frictionSlope
    ) /
    2

  const standardStepDenominator =
    input.channelSlope -
    averageFrictionSlope

  if (
    Math.abs(
      standardStepDenominator
    ) <
    1e-13
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'NEAR_UNIFORM_REACH',
      'The reach approaches uniform-flow conditions, making the standard-step distance ill-conditioned.',
    )
  }

  const equivalentDirectStepDistance =
    (
      solvedState.specificEnergy -
      initialState.specificEnergy
    ) /
    standardStepDenominator

  const distanceClosureResidual =
    equivalentDirectStepDistance -
    input.signedReachLength

  const signedFrictionHeadChange =
    averageFrictionSlope *
    input.signedReachLength

  const frictionHeadLossMagnitude =
    Math.abs(
      signedFrictionHeadChange
    )

  const bedElevationChange =
    -input.channelSlope *
    input.signedReachLength

  const solvedDepthChange =
    solvedState.flowDepth -
    initialState.flowDepth

  const waterSurfaceElevationChange =
    bedElevationChange +
    solvedDepthChange

  const totalHeadChange =
    bedElevationChange +
    (
      solvedState.specificEnergy -
      initialState.specificEnergy
    )

  const energyResidual =
    totalHeadChange +
    signedFrictionHeadChange

  const finiteValues = [
    selected.depth,
    averageFrictionSlope,
    equivalentDirectStepDistance,
    distanceClosureResidual,
    signedFrictionHeadChange,
    frictionHeadLossMagnitude,
    bedElevationChange,
    solvedDepthChange,
    waterSurfaceElevationChange,
    totalHeadChange,
    energyResidual,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    Math.abs(
      energyResidual
    ) >
      Math.max(
        1e-8,
        frictionHeadLossMagnitude *
        1e-7,
      )
  ) {
    throw new PartiallyFullCircularChannelStandardStepError(
      'NUMERICAL_FAILURE',
      'Standard-step solution failed its finite-value or energy-closure checks.',
    )
  }

  return {
    initialState,

    solvedState,

    signedReachLength:
      input.signedReachLength,

    reachDirection:
      input.signedReachLength >
      0
        ? 'Downstream standard step'
        : 'Upstream standard step',

    criticalDepth,

    flowRegime:
      initialIsSubcritical
        ? 'Subcritical'
        : 'Supercritical',

    localDepthGradient,

    localLinearDepthPrediction,

    solvedDepthChange,

    averageFrictionSlope,

    signedFrictionHeadChange,

    frictionHeadLossMagnitude,

    bedElevationChange,

    waterSurfaceElevationChange,

    totalHeadChange,

    energyResidual,

    equivalentDirectStepDistance,

    distanceClosureResidual,

    rootCandidatesFound:
      roots.length,

    directionalCandidatesFound:
      directionalRoots.length,

    rootIterations:
      selected.iterations,

    modelName:
      'Partially Full Circular Channel Standard-Step Method',

    limitationDescription:
      'The standard-step method solves E₂ − E₁ + (S̄f − S₀)Δx = 0 using circular open-channel geometry and the arithmetic mean of endpoint Manning friction slopes. Multiple mathematical roots may exist; the solution closest to the local GVF prediction and consistent with the initial flow regime is selected.',
  }
}


function csvCell(
  value:
    string | number,
): string {
  const text =
    String(value)

  if (/[",\n]/.test(text)) {
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


export function createPartiallyFullCircularChannelStandardStepCsv(
  input:
    PartiallyFullCircularChannelStandardStepInput,
  result:
    PartiallyFullCircularChannelStandardStepResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Standard-Step Method',
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
      'Signed Reach Length',
      input.signedReachLength,
      'm',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Solved Flow Depth',
      result.solvedState.flowDepth,
      'm',
    ],
    [
      'Solved Depth Change',
      result.solvedDepthChange,
      'm',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Initial Froude Number',
      result.initialState.froudeNumber,
      '-',
    ],
    [
      'Solved Froude Number',
      result.solvedState.froudeNumber,
      '-',
    ],
    [
      'Local Linear Depth Prediction',
      result.localLinearDepthPrediction,
      'm',
    ],
    [
      'Average Friction Slope',
      result.averageFrictionSlope,
      'm/m',
    ],
    [
      'Equivalent Direct-Step Distance',
      result.equivalentDirectStepDistance,
      'm',
    ],
    [
      'Distance Closure Residual',
      result.distanceClosureResidual,
      'm',
    ],
    [
      'Energy Residual',
      result.energyResidual,
      'm',
    ],
    [
      'Root Candidates Found',
      result.rootCandidatesFound,
      '-',
    ],
    [
      'Directional Candidates Found',
      result.directionalCandidatesFound,
      '-',
    ],
    [
      'Root Iterations',
      result.rootIterations,
      '-',
    ],
    [
      'Flow Regime',
      result.flowRegime,
      '-',
    ],
    [
      'Reach Direction',
      result.reachDirection,
      '-',
    ],
    [],
    [
      'Model',
      result.modelName,
    ],
    [
      'Limitation',
      result.limitationDescription,
    ],
  ]

  return rows
    .map(
      row =>
        row
          .map(csvCell)
          .join(','),
    )
    .join('\n')
}
