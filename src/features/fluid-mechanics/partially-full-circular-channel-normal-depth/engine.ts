import {
  calculatePartiallyFullCircularChannelManningFlow,
} from '../partially-full-circular-channel-manning-flow/engine.ts'

import type {
  PartiallyFullCircularChannelNormalDepthInput,
  PartiallyFullCircularChannelNormalDepthResult,
  PartiallyFullCircularChannelNormalDepthSolution,
} from './types.ts'

export const PARTIALLY_FULL_CIRCULAR_CHANNEL_NORMAL_DEPTH_ENGINE_VERSION =
  'partially-full-circular-channel-normal-depth-v1'

export type PartiallyFullCircularChannelNormalDepthErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_DENSITY'
  | 'FLOW_EXCEEDS_MAXIMUM_CAPACITY'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class PartiallyFullCircularChannelNormalDepthError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelNormalDepthErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelNormalDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelNormalDepthError'

    this.code =
      code
  }
}


function evaluateDepth(
  input:
    PartiallyFullCircularChannelNormalDepthInput,
  flowDepth: number,
) {
  return calculatePartiallyFullCircularChannelManningFlow({
    pipeDiameter:
      input.pipeDiameter,

    flowDepth,

    manningRoughness:
      input.manningRoughness,

    channelSlope:
      input.channelSlope,

    fluidDensity:
      input.fluidDensity,
  })
}


function findMaximumCapacityDepth(
  input:
    PartiallyFullCircularChannelNormalDepthInput,
): number {
  const minimumDepth =
    input.pipeDiameter *
    1e-8

  const maximumDepth =
    input.pipeDiameter *
    (
      1 -
      1e-8
    )

  let lower =
    minimumDepth

  let upper =
    maximumDepth

  for (
    let iteration = 0;
    iteration < 180;
    iteration += 1
  ) {
    const first =
      lower +
      (
        upper -
        lower
      ) /
      3

    const second =
      upper -
      (
        upper -
        lower
      ) /
      3

    const firstFlow =
      evaluateDepth(
        input,
        first,
      ).volumetricFlowRate

    const secondFlow =
      evaluateDepth(
        input,
        second,
      ).volumetricFlowRate

    if (
      firstFlow <
      secondFlow
    ) {
      lower =
        first
    } else {
      upper =
        second
    }
  }

  return (
    lower +
    upper
  ) /
  2
}


function solveDepthByBisection(
  input:
    PartiallyFullCircularChannelNormalDepthInput,
  lowerDepth: number,
  upperDepth: number,
): number {
  let lower =
    lowerDepth

  let upper =
    upperDepth

  let lowerResidual =
    evaluateDepth(
      input,
      lower,
    ).volumetricFlowRate -
    input.volumetricFlowRate

  let upperResidual =
    evaluateDepth(
      input,
      upper,
    ).volumetricFlowRate -
    input.volumetricFlowRate

  const flowTolerance =
    Math.max(
      1e-12,
      input.volumetricFlowRate *
      1e-11,
    )

  if (
    Math.abs(
      lowerResidual,
    ) <=
    flowTolerance
  ) {
    return lower
  }

  if (
    Math.abs(
      upperResidual,
    ) <=
    flowTolerance
  ) {
    return upper
  }

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual *
    upperResidual >
      0
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
      'ROOT_BRACKETING_FAILURE',
      'The requested circular-channel normal depth could not be bracketed.',
    )
  }

  for (
    let iteration = 1;
    iteration <= 240;
    iteration += 1
  ) {
    const middle =
      (
        lower +
        upper
      ) /
      2

    const middleResidual =
      evaluateDepth(
        input,
        middle,
      ).volumetricFlowRate -
      input.volumetricFlowRate

    if (
      Math.abs(
        middleResidual,
      ) <=
      flowTolerance
    ) {
      return middle
    }

    if (
      lowerResidual *
      middleResidual <=
      0
    ) {
      upper =
        middle

      upperResidual =
        middleResidual
    } else {
      lower =
        middle

      lowerResidual =
        middleResidual
    }
  }

  const depth =
    (
      lower +
      upper
    ) /
    2

  const residual =
    evaluateDepth(
      input,
      depth,
    ).volumetricFlowRate -
    input.volumetricFlowRate

  if (
    Math.abs(
      residual,
    ) >
    Math.max(
      1e-9,
      input.volumetricFlowRate *
      1e-8,
    )
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
      'ROOT_CONVERGENCE_FAILURE',
      'Circular-channel normal-depth solver did not converge.',
    )
  }

  return depth
}


function solutionFromDepth(
  input:
    PartiallyFullCircularChannelNormalDepthInput,
  flowDepth: number,
): PartiallyFullCircularChannelNormalDepthSolution {
  const state =
    evaluateDepth(
      input,
      flowDepth,
    )

  return {
    flowDepth,

    depthRatio:
      state.depthRatio,

    centralAngleDegrees:
      state.centralAngleDegrees,

    flowArea:
      state.flowArea,

    wettedPerimeter:
      state.wettedPerimeter,

    topWidth:
      state.topWidth,

    hydraulicRadius:
      state.hydraulicRadius,

    hydraulicDepth:
      state.hydraulicDepth,

    meanVelocity:
      state.meanVelocity,

    froudeNumber:
      state.froudeNumber,

    flowRegime:
      state.flowRegime,

    averageBoundaryShearStress:
      state.averageBoundaryShearStress,

    hydraulicPowerDissipationPerUnitLength:
      state.hydraulicPowerDissipationPerUnitLength,
  }
}


export function calculatePartiallyFullCircularChannelNormalDepth(
  input:
    PartiallyFullCircularChannelNormalDepthInput,
): PartiallyFullCircularChannelNormalDepthResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
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
    throw new PartiallyFullCircularChannelNormalDepthError(
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
    throw new PartiallyFullCircularChannelNormalDepthError(
      'INVALID_CHANNEL_SLOPE',
      'Channel slope must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }

  const reference =
    evaluateDepth(
      input,
      input.pipeDiameter /
      2,
    )

  const fullFlowCapacity =
    reference.fullFlowVolumetricFlowRate

  const maximumCapacityDepth =
    findMaximumCapacityDepth(
      input,
    )

  const maximumState =
    evaluateDepth(
      input,
      maximumCapacityDepth,
    )

  const maximumPartialFlowCapacity =
    maximumState.volumetricFlowRate

  const maximumCapacityDepthRatio =
    maximumCapacityDepth /
    input.pipeDiameter

  const maximumCapacityRatioToFull =
    maximumPartialFlowCapacity /
    fullFlowCapacity

  const requestedFlowToFullCapacityRatio =
    input.volumetricFlowRate /
    fullFlowCapacity

  const requestedFlowToMaximumCapacityRatio =
    input.volumetricFlowRate /
    maximumPartialFlowCapacity

  const maximumCapacityMargin =
    maximumPartialFlowCapacity -
    input.volumetricFlowRate

  const capacityTolerance =
    Math.max(
      1e-10,
      maximumPartialFlowCapacity *
      1e-9,
    )

  if (
    input.volumetricFlowRate >
    maximumPartialFlowCapacity +
    capacityTolerance
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
      'FLOW_EXCEEDS_MAXIMUM_CAPACITY',
      'Requested flow exceeds the maximum free-surface Manning capacity of this circular conduit.',
    )
  }

  const lowerDepth =
    input.pipeDiameter *
    1e-8

  const upperDepth =
    input.pipeDiameter *
    (
      1 -
      1e-8
    )

  let shallowDepth:
    number

  let deepDepth:
    number |
    null =
    null

  if (
    Math.abs(
      input.volumetricFlowRate -
      maximumPartialFlowCapacity
    ) <=
    capacityTolerance
  ) {
    shallowDepth =
      maximumCapacityDepth
  } else {
    shallowDepth =
      solveDepthByBisection(
        input,
        lowerDepth,
        maximumCapacityDepth,
      )

    const fullCapacityTolerance =
      Math.max(
        1e-10,
        fullFlowCapacity *
        1e-9,
      )

    if (
      input.volumetricFlowRate >
      fullFlowCapacity +
      fullCapacityTolerance
    ) {
      deepDepth =
        solveDepthByBisection(
          input,
          maximumCapacityDepth,
          upperDepth,
        )
    }
  }

  const shallowSolution =
    solutionFromDepth(
      input,
      shallowDepth,
    )

  const deepSolution =
    deepDepth ===
    null
      ? null
      : solutionFromDepth(
          input,
          deepDepth,
        )

  const solutionMultiplicity =
    deepSolution
      ? 'Two normal depths'
      : 'Single normal depth'

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    shallowSolution.flowDepth,

    shallowSolution.depthRatio,

    shallowSolution.flowArea,

    shallowSolution.wettedPerimeter,

    shallowSolution.topWidth,

    shallowSolution.hydraulicRadius,

    shallowSolution.hydraulicDepth,

    shallowSolution.meanVelocity,

    shallowSolution.froudeNumber,

    fullFlowCapacity,

    maximumPartialFlowCapacity,

    maximumCapacityDepth,

    maximumCapacityDepthRatio,

    maximumCapacityRatioToFull,

    requestedFlowToFullCapacityRatio,

    requestedFlowToMaximumCapacityRatio,

    massFlowRate,
  ]

  if (
    deepSolution
  ) {
    positiveValues.push(
      deepSolution.flowDepth,

      deepSolution.depthRatio,

      deepSolution.flowArea,

      deepSolution.wettedPerimeter,

      deepSolution.topWidth,

      deepSolution.hydraulicRadius,

      deepSolution.hydraulicDepth,

      deepSolution.meanVelocity,

      deepSolution.froudeNumber,
    )
  }

  const closureTolerance =
    Math.max(
      1e-9,
      input.volumetricFlowRate *
      1e-8,
    )

  const shallowClosure =
    Math.abs(
      evaluateDepth(
        input,
        shallowSolution.flowDepth,
      ).volumetricFlowRate -
      input.volumetricFlowRate
    )

  const deepClosure =
    deepSolution
      ? Math.abs(
          evaluateDepth(
            input,
            deepSolution.flowDepth,
          ).volumetricFlowRate -
          input.volumetricFlowRate
        )
      : 0

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
    shallowSolution.flowDepth >=
      input.pipeDiameter ||
    (
      deepSolution &&
      (
        deepSolution.flowDepth <=
        shallowSolution.flowDepth ||
        deepSolution.flowDepth >=
        input.pipeDiameter
      )
    ) ||
    maximumCapacityDepth >=
      input.pipeDiameter ||
    maximumCapacityRatioToFull <=
      1 ||
    shallowClosure >
      closureTolerance ||
    deepClosure >
      closureTolerance ||
    maximumCapacityMargin <
      -capacityTolerance
  ) {
    throw new PartiallyFullCircularChannelNormalDepthError(
      'NUMERICAL_FAILURE',
      'Circular-channel normal-depth solution failed its capacity, ordering or forward-flow closure checks.',
    )
  }

  return {
    solutionMultiplicity,

    shallowSolution,

    deepSolution,

    fullFlowCapacity,

    maximumPartialFlowCapacity,

    maximumCapacityDepth,

    maximumCapacityDepthRatio,

    maximumCapacityRatioToFull,

    requestedFlowToFullCapacityRatio,

    requestedFlowToMaximumCapacityRatio,

    maximumCapacityMargin,

    massFlowRate,

    modelName:
      'Manning Normal Depth in a Partially Full Circular Channel',

    limitationDescription:
      'Steady uniform free-surface flow in a circular conduit. For flows above the nominal full-flow Manning capacity but below the maximum partially full capacity, two open-channel normal depths can exist. Pressurized full-pipe flow is outside this model.',
  }
}


export function createPartiallyFullCircularChannelNormalDepthCsv(
  input:
    PartiallyFullCircularChannelNormalDepthInput,
  result:
    PartiallyFullCircularChannelNormalDepthResult,
): string {
  const rows = [
    [
      'Partially Full Circular Channel Normal Depth - Manning',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe diameter',
      input.pipeDiameter,
      'm',
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
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Capacity',
      'Value',
      'Unit',
    ],
    [
      'Solution multiplicity',
      result.solutionMultiplicity,
      '-',
    ],
    [
      'Full-flow Manning capacity',
      result.fullFlowCapacity,
      'm3/s',
    ],
    [
      'Maximum partial-flow capacity',
      result.maximumPartialFlowCapacity,
      'm3/s',
    ],
    [
      'Maximum-capacity depth',
      result.maximumCapacityDepth,
      'm',
    ],
    [
      'Maximum-capacity depth ratio',
      result.maximumCapacityDepthRatio,
      '-',
    ],
    [
      'Maximum partial/full capacity ratio',
      result.maximumCapacityRatioToFull,
      '-',
    ],
    [
      'Maximum capacity margin',
      result.maximumCapacityMargin,
      'm3/s',
    ],
    [],
    [
      'Shallow Solution',
      'Value',
      'Unit',
    ],
    [
      'Normal depth',
      result.shallowSolution.flowDepth,
      'm',
    ],
    [
      'Depth ratio',
      result.shallowSolution.depthRatio,
      '-',
    ],
    [
      'Mean velocity',
      result.shallowSolution.meanVelocity,
      'm/s',
    ],
    [
      'Froude number',
      result.shallowSolution.froudeNumber,
      '-',
    ],
    [
      'Flow regime',
      result.shallowSolution.flowRegime,
      '-',
    ],
    [
      'Hydraulic radius',
      result.shallowSolution.hydraulicRadius,
      'm',
    ],
  ]

  if (
    result.deepSolution
  ) {
    rows.push(
      [],
      [
        'Deep Solution',
        'Value',
        'Unit',
      ],
      [
        'Normal depth',
        result.deepSolution.flowDepth,
        'm',
      ],
      [
        'Depth ratio',
        result.deepSolution.depthRatio,
        '-',
      ],
      [
        'Mean velocity',
        result.deepSolution.meanVelocity,
        'm/s',
      ],
      [
        'Froude number',
        result.deepSolution.froudeNumber,
        '-',
      ],
      [
        'Flow regime',
        result.deepSolution.flowRegime,
        '-',
      ],
      [
        'Hydraulic radius',
        result.deepSolution.hydraulicRadius,
        'm',
      ],
    )
  }

  rows.push(
    [],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
  )

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
