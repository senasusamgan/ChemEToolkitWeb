import type {
  PartiallyFullCircularChannelCriticalDepthInput,
  PartiallyFullCircularChannelCriticalDepthResult,
} from './types.ts'

export const PARTIALLY_FULL_CIRCULAR_CHANNEL_CRITICAL_DEPTH_ENGINE_VERSION =
  'partially-full-circular-channel-critical-depth-v1'

export type PartiallyFullCircularChannelCriticalDepthErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_DENSITY'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class PartiallyFullCircularChannelCriticalDepthError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelCriticalDepthErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelCriticalDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelCriticalDepthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665


interface CircularSectionState {
  radius: number

  centralAngleRadians: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  waveCelerity: number

  criticalConditionResidual: number
}


function sectionState(
  input:
    PartiallyFullCircularChannelCriticalDepthInput,
  flowDepth: number,
): CircularSectionState {
  const radius =
    input.pipeDiameter /
    2

  const cosineArgument =
    (
      radius -
      flowDepth
    ) /
    radius

  const boundedCosineArgument =
    Math.min(
      1,
      Math.max(
        -1,
        cosineArgument,
      ),
    )

  const centralAngleRadians =
    2 *
    Math.acos(
      boundedCosineArgument,
    )

  const flowArea =
    radius *
    radius /
    2 *
    (
      centralAngleRadians -
      Math.sin(
        centralAngleRadians,
      )
    )

  const topWidth =
    2 *
    radius *
    Math.sin(
      centralAngleRadians /
      2
    )

  const wettedPerimeter =
    radius *
    centralAngleRadians

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const velocity =
    input.volumetricFlowRate /
    flowArea

  const waveCelerity =
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const froudeNumber =
    velocity /
    waveCelerity

  const velocityHead =
    velocity *
    velocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergy =
    flowDepth +
    velocityHead

  const criticalConditionResidual =
    (
      input.volumetricFlowRate *
      input.volumetricFlowRate *
      topWidth
    ) /
    (
      GRAVITATIONAL_ACCELERATION *
      flowArea *
      flowArea *
      flowArea
    ) -
    1

  return {
    radius,

    centralAngleRadians,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    velocity,

    froudeNumber,

    specificEnergy,

    waveCelerity,

    criticalConditionResidual,
  }
}


function solveCriticalDepth(
  input:
    PartiallyFullCircularChannelCriticalDepthInput,
): number {
  let lower =
    input.pipeDiameter *
    1e-8

  let upper =
    input.pipeDiameter *
    (
      1 -
      1e-8
    )

  let lowerResidual =
    sectionState(
      input,
      lower,
    ).criticalConditionResidual

  let upperResidual =
    sectionState(
      input,
      upper,
    ).criticalConditionResidual

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual <=
      0 ||
    upperResidual >=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalDepthError(
      'ROOT_BRACKETING_FAILURE',
      'Critical-depth root could not be bracketed between zero and the conduit diameter.',
    )
  }

  const residualTolerance =
    1e-13

  const depthTolerance =
    Math.max(
      1e-13,
      input.pipeDiameter *
      1e-12,
    )

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
      sectionState(
        input,
        middle,
      ).criticalConditionResidual

    if (
      !Number.isFinite(
        middleResidual,
      )
    ) {
      throw new PartiallyFullCircularChannelCriticalDepthError(
        'ROOT_CONVERGENCE_FAILURE',
        'Critical-depth residual became non-finite.',
      )
    }

    if (
      Math.abs(
        middleResidual,
      ) <=
        residualTolerance ||
      upper -
      lower <=
        depthTolerance
    ) {
      return middle
    }

    if (
      middleResidual >
      0
    ) {
      lower =
        middle

      lowerResidual =
        middleResidual
    } else {
      upper =
        middle

      upperResidual =
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
    sectionState(
      input,
      depth,
    ).criticalConditionResidual

  if (
    Math.abs(
      residual,
    ) >
      1e-9
  ) {
    throw new PartiallyFullCircularChannelCriticalDepthError(
      'ROOT_CONVERGENCE_FAILURE',
      'Circular-channel critical-depth solver did not converge.',
    )
  }

  return depth
}


export function calculatePartiallyFullCircularChannelCriticalDepth(
  input:
    PartiallyFullCircularChannelCriticalDepthInput,
): PartiallyFullCircularChannelCriticalDepthResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalDepthError(
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
    throw new PartiallyFullCircularChannelCriticalDepthError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalDepthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const criticalDepth =
    solveCriticalDepth(
      input,
    )

  const state =
    sectionState(
      input,
      criticalDepth,
    )

  const criticalDepthRatio =
    criticalDepth /
    input.pipeDiameter

  const centralAngleDegrees =
    state.centralAngleRadians *
    180 /
    Math.PI

  const velocityHead =
    state.velocity *
    state.velocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const dischargePerUnitTopWidth =
    input.volumetricFlowRate /
    state.topWidth

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    criticalDepth,

    criticalDepthRatio,

    state.radius,

    state.centralAngleRadians,

    centralAngleDegrees,

    state.flowArea,

    state.topWidth,

    state.wettedPerimeter,

    state.hydraulicRadius,

    state.hydraulicDepth,

    state.velocity,

    state.waveCelerity,

    state.froudeNumber,

    state.specificEnergy,

    velocityHead,

    dischargePerUnitTopWidth,

    massFlowRate,
  ]

  const criticalTolerance =
    1e-9

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
    criticalDepth >=
      input.pipeDiameter ||
    criticalDepthRatio >=
      1 ||
    Math.abs(
      state.criticalConditionResidual,
    ) >
      criticalTolerance ||
    Math.abs(
      state.froudeNumber -
      1
    ) >
      criticalTolerance ||
    Math.abs(
      state.velocity -
      state.waveCelerity
    ) >
      Math.max(
        1e-9,
        state.velocity *
        1e-9,
      )
  ) {
    throw new PartiallyFullCircularChannelCriticalDepthError(
      'NUMERICAL_FAILURE',
      'Circular-channel critical state failed its Froude, wave-speed or critical-condition closure checks.',
    )
  }

  return {
    criticalDepth,

    criticalDepthRatio,

    radius:
      state.radius,

    centralAngleRadians:
      state.centralAngleRadians,

    centralAngleDegrees,

    criticalFlowArea:
      state.flowArea,

    criticalTopWidth:
      state.topWidth,

    criticalWettedPerimeter:
      state.wettedPerimeter,

    criticalHydraulicRadius:
      state.hydraulicRadius,

    criticalHydraulicDepth:
      state.hydraulicDepth,

    criticalVelocity:
      state.velocity,

    criticalWaveCelerity:
      state.waveCelerity,

    criticalFroudeNumber:
      state.froudeNumber,

    criticalSpecificEnergy:
      state.specificEnergy,

    velocityHead,

    dischargePerUnitTopWidth,

    criticalConditionResidual:
      state.criticalConditionResidual,

    massFlowRate,

    modelName:
      'Critical Flow in a Partially Full Circular Channel',

    limitationDescription:
      'Critical depth is obtained from Q²T/(gA³) = 1 for a free-surface circular section with 0 < y < D. The solution is independent of Manning roughness and channel slope. Pressurized full-pipe flow is outside the model.',
  }
}


export function createPartiallyFullCircularChannelCriticalDepthCsv(
  input:
    PartiallyFullCircularChannelCriticalDepthInput,
  result:
    PartiallyFullCircularChannelCriticalDepthResult,
): string {
  const rows = [
    [
      'Partially Full Circular Channel Critical Depth',
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
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Critical State',
      'Value',
      'Unit',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical depth ratio y/D',
      result.criticalDepthRatio,
      '-',
    ],
    [
      'Central angle',
      result.centralAngleDegrees,
      'deg',
    ],
    [
      'Critical flow area',
      result.criticalFlowArea,
      'm2',
    ],
    [
      'Critical top width',
      result.criticalTopWidth,
      'm',
    ],
    [
      'Critical wetted perimeter',
      result.criticalWettedPerimeter,
      'm',
    ],
    [
      'Critical hydraulic radius',
      result.criticalHydraulicRadius,
      'm',
    ],
    [
      'Critical hydraulic depth',
      result.criticalHydraulicDepth,
      'm',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Critical wave celerity',
      result.criticalWaveCelerity,
      'm/s',
    ],
    [
      'Critical Froude number',
      result.criticalFroudeNumber,
      '-',
    ],
    [
      'Minimum specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Velocity head',
      result.velocityHead,
      'm',
    ],
    [
      'Discharge per unit top width',
      result.dischargePerUnitTopWidth,
      'm2/s',
    ],
    [
      'Critical-condition residual',
      result.criticalConditionResidual,
      '-',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
