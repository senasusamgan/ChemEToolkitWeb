import {
  PartiallyFullCircularChannelStandardStepError,
  calculatePartiallyFullCircularChannelStandardStep,
} from '../partially-full-circular-channel-standard-step/engine.ts'

import type {
  PartiallyFullCircularChannelStandardStepResult,
} from '../partially-full-circular-channel-standard-step/types.ts'

import type {
  PartiallyFullCircularChannelStandardStepProfileInput,
  PartiallyFullCircularChannelStandardStepProfilePoint,
  PartiallyFullCircularChannelStandardStepProfileResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'partially-full-circular-channel-standard-step-profile-v1'


export type PartiallyFullCircularChannelStandardStepProfileErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_PROFILE_LENGTH'
  | 'INVALID_REACH_LENGTH'
  | 'TOO_MANY_REACHES'
  | 'STANDARD_STEP_FAILURE'
  | 'REGIME_CHANGE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelStandardStepProfileError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelStandardStepProfileErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelStandardStepProfileError'

    this.code =
      code
  }
}


const MAXIMUM_REACHES =
  5000


function validateInput(
  input:
    PartiallyFullCircularChannelStandardStepProfileInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelStandardStepProfileError(
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
    throw new PartiallyFullCircularChannelStandardStepProfileError(
      'INVALID_PROFILE_LENGTH',
      'Signed profile length must be finite and non-zero.',
    )
  }

  if (
    !Number.isFinite(
      input.maximumReachLength,
    ) ||
    input.maximumReachLength <=
      0
  ) {
    throw new PartiallyFullCircularChannelStandardStepProfileError(
      'INVALID_REACH_LENGTH',
      'Maximum standard-step reach length must be positive and finite.',
    )
  }
}


function createInitialPoint(
  firstStep:
    PartiallyFullCircularChannelStandardStepResult,
): PartiallyFullCircularChannelStandardStepProfilePoint {
  return {
    index:
      0,

    distance:
      0,

    flowDepth:
      firstStep.initialState.flowDepth,

    bedElevation:
      0,

    waterSurfaceElevation:
      firstStep.initialState.flowDepth,

    meanVelocity:
      firstStep.initialState.meanVelocity,

    froudeNumber:
      firstStep.initialState.froudeNumber,

    frictionSlope:
      firstStep.initialState.frictionSlope,

    specificEnergy:
      firstStep.initialState.specificEnergy,

    totalHead:
      firstStep.initialState.specificEnergy,

    segmentLength:
      0,

    segmentDepthChange:
      0,

    segmentFrictionHeadChange:
      0,

    segmentEnergyResidual:
      0,

    rootIterations:
      0,

    rootCandidatesFound:
      0,
  }
}


function createSolvedPoint(
  input:
    PartiallyFullCircularChannelStandardStepProfileInput,
  index: number,
  distance: number,
  step:
    PartiallyFullCircularChannelStandardStepResult,
): PartiallyFullCircularChannelStandardStepProfilePoint {
  const bedElevation =
    -input.channelSlope *
    distance

  const waterSurfaceElevation =
    bedElevation +
    step.solvedState.flowDepth

  const totalHead =
    bedElevation +
    step.solvedState.specificEnergy

  return {
    index,

    distance,

    flowDepth:
      step.solvedState.flowDepth,

    bedElevation,

    waterSurfaceElevation,

    meanVelocity:
      step.solvedState.meanVelocity,

    froudeNumber:
      step.solvedState.froudeNumber,

    frictionSlope:
      step.solvedState.frictionSlope,

    specificEnergy:
      step.solvedState.specificEnergy,

    totalHead,

    segmentLength:
      step.signedReachLength,

    segmentDepthChange:
      step.solvedDepthChange,

    segmentFrictionHeadChange:
      step.signedFrictionHeadChange,

    segmentEnergyResidual:
      step.energyResidual,

    rootIterations:
      step.rootIterations,

    rootCandidatesFound:
      step.rootCandidatesFound,
  }
}


export function calculatePartiallyFullCircularChannelStandardStepProfile(
  input:
    PartiallyFullCircularChannelStandardStepProfileInput,
): PartiallyFullCircularChannelStandardStepProfileResult {
  validateInput(
    input,
  )

  const numberOfReaches =
    Math.ceil(
      Math.abs(
        input.signedProfileLength,
      ) /
      input.maximumReachLength,
    )

  if (
    numberOfReaches >
      MAXIMUM_REACHES
  ) {
    throw new PartiallyFullCircularChannelStandardStepProfileError(
      'TOO_MANY_REACHES',
      `The requested profile requires ${numberOfReaches} standard-step reaches. Increase the maximum reach length or shorten the profile.`,
    )
  }

  const actualReachLength =
    input.signedProfileLength /
    numberOfReaches

  let currentDepth =
    input.initialFlowDepth

  let currentDistance =
    0

  let criticalDepth =
    Number.NaN

  let initialFlowRegime =
    ''

  const stepResults:
    PartiallyFullCircularChannelStandardStepResult[] = []

  for (
    let reachIndex = 0;
    reachIndex <
      numberOfReaches;
    reachIndex +=
      1
  ) {
    let step:
      PartiallyFullCircularChannelStandardStepResult

    try {
      step =
        calculatePartiallyFullCircularChannelStandardStep({
          pipeDiameter:
            input.pipeDiameter,

          volumetricFlowRate:
            input.volumetricFlowRate,

          manningRoughness:
            input.manningRoughness,

          channelSlope:
            input.channelSlope,

          initialFlowDepth:
            currentDepth,

          signedReachLength:
            actualReachLength,
        })
    } catch (error) {
      if (
        error instanceof
          PartiallyFullCircularChannelStandardStepError
      ) {
        throw new PartiallyFullCircularChannelStandardStepProfileError(
          'STANDARD_STEP_FAILURE',
          `Reach ${reachIndex + 1} failed: ${error.message}`,
        )
      }

      throw error
    }

    if (
      reachIndex ===
      0
    ) {
      criticalDepth =
        step.criticalDepth

      initialFlowRegime =
        step.flowRegime
    } else if (
      step.flowRegime !==
      initialFlowRegime
    ) {
      throw new PartiallyFullCircularChannelStandardStepProfileError(
        'REGIME_CHANGE',
        'The multi-reach profile changed critical-flow regime. Split the profile at its control section.',
      )
    }

    stepResults.push(
      step,
    )

    currentDepth =
      step.solvedState.flowDepth

    currentDistance +=
      actualReachLength
  }

  if (
    stepResults.length ===
    0
  ) {
    throw new PartiallyFullCircularChannelStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'No standard-step reach was generated.',
    )
  }

  const profilePoints:
    PartiallyFullCircularChannelStandardStepProfilePoint[] = [
      createInitialPoint(
        stepResults[0],
      ),
    ]

  currentDistance =
    0

  let signedFrictionHeadChange =
    0

  let cumulativeEnergyResidual =
    0

  let maximumSegmentEnergyResidual =
    0

  let totalRootIterations =
    0

  let maximumRootCandidates =
    0

  for (
    let index = 0;
    index <
      stepResults.length;
    index +=
      1
  ) {
    const step =
      stepResults[index]

    currentDistance +=
      step.signedReachLength

    signedFrictionHeadChange +=
      step.signedFrictionHeadChange

    cumulativeEnergyResidual +=
      step.energyResidual

    maximumSegmentEnergyResidual =
      Math.max(
        maximumSegmentEnergyResidual,
        Math.abs(
          step.energyResidual,
        ),
      )

    totalRootIterations +=
      step.rootIterations

    maximumRootCandidates =
      Math.max(
        maximumRootCandidates,
        step.rootCandidatesFound,
      )

    profilePoints.push(
      createSolvedPoint(
        input,
        index + 1,
        currentDistance,
        step,
      ),
    )
  }

  const initialState =
    profilePoints[0]

  const finalState =
    profilePoints[
      profilePoints.length -
      1
    ]

  let minimumDepth =
    initialState.flowDepth

  let maximumDepth =
    initialState.flowDepth

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
    finalState.flowDepth -
    initialState.flowDepth

  const waterSurfaceElevationChange =
    finalState.waterSurfaceElevation -
    initialState.waterSurfaceElevation

  const totalHeadChange =
    finalState.totalHead -
    initialState.totalHead

  const frictionHeadLossMagnitude =
    Math.abs(
      signedFrictionHeadChange,
    )

  const globalEnergyResidual =
    totalHeadChange +
    signedFrictionHeadChange

  const closureTolerance =
    Math.max(
      1e-7,
      frictionHeadLossMagnitude *
      1e-6,
    )

  const distanceTolerance =
    Math.max(
      1e-10,
      Math.abs(
        input.signedProfileLength,
      ) *
      1e-10,
    )

  const finiteValues = [
    actualReachLength,
    criticalDepth,
    totalDepthChange,
    minimumDepth,
    maximumDepth,
    waterSurfaceElevationChange,
    signedFrictionHeadChange,
    frictionHeadLossMagnitude,
    totalHeadChange,
    cumulativeEnergyResidual,
    globalEnergyResidual,
    maximumSegmentEnergyResidual,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    profilePoints.length !==
      numberOfReaches +
      1 ||
    Math.abs(
      finalState.distance -
      input.signedProfileLength,
    ) >
      distanceTolerance ||
    Math.abs(
      globalEnergyResidual,
    ) >
      closureTolerance
  ) {
    throw new PartiallyFullCircularChannelStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'Multi-reach standard-step profile failed its endpoint, point-count or energy-closure checks.',
    )
  }

  return {
    initialState,

    finalState,

    profilePoints,

    signedProfileLength:
      input.signedProfileLength,

    profileDirection:
      input.signedProfileLength >
        0
        ? 'Downstream profile'
        : 'Upstream profile',

    numberOfReaches,

    actualReachLength,

    criticalDepth,

    flowRegime:
      initialFlowRegime,

    totalDepthChange,

    minimumDepth,

    maximumDepth,

    waterSurfaceElevationChange,

    signedFrictionHeadChange,

    frictionHeadLossMagnitude,

    totalHeadChange,

    cumulativeEnergyResidual:
      globalEnergyResidual,

    maximumSegmentEnergyResidual,

    totalRootIterations,

    maximumRootCandidates,

    modelName:
      'Partially Full Circular Channel Multi-Reach Standard-Step GVF Profile',

    limitationDescription:
      'The profile repeatedly applies Calculator 465 over equal signed reaches. Each reach solves the standard-step energy equation using endpoint Manning friction slopes and remains within one critical-flow regime. Smaller reach lengths generally improve agreement with differential-equation integration.',
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


export function createPartiallyFullCircularChannelStandardStepProfileCsv(
  input:
    PartiallyFullCircularChannelStandardStepProfileInput,
  result:
    PartiallyFullCircularChannelStandardStepProfileResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Multi-Reach Standard-Step GVF Profile',
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
      'Minimum Depth',
      result.minimumDepth,
      'm',
    ],
    [
      'Maximum Depth',
      result.maximumDepth,
      'm',
    ],
    [
      'Friction Head Loss',
      result.frictionHeadLossMagnitude,
      'm',
    ],
    [
      'Total Head Change',
      result.totalHeadChange,
      'm',
    ],
    [
      'Global Energy Residual',
      result.cumulativeEnergyResidual,
      'm',
    ],
    [
      'Maximum Segment Energy Residual',
      result.maximumSegmentEnergyResidual,
      'm',
    ],
    [
      'Total Root Iterations',
      result.totalRootIterations,
      '-',
    ],
    [
      'Maximum Root Candidates',
      result.maximumRootCandidates,
      '-',
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
      'Segment Length',
      'Segment Depth Change',
      'Segment Friction Head',
      'Segment Energy Residual',
      'Root Iterations',
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
      point.segmentLength,
      point.segmentDepthChange,
      point.segmentFrictionHeadChange,
      point.segmentEnergyResidual,
      point.rootIterations,
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
