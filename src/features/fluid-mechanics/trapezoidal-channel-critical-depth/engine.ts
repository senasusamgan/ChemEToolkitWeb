import type {
  TrapezoidalChannelCriticalDepthInput,
  TrapezoidalChannelCriticalDepthResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_CRITICAL_DEPTH_ENGINE_VERSION =
  'trapezoidal-channel-critical-depth-v1'

export type TrapezoidalChannelCriticalDepthErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_DENSITY'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelCriticalDepthError
  extends Error {
  readonly code:
    TrapezoidalChannelCriticalDepthErrorCode

  constructor(
    code:
      TrapezoidalChannelCriticalDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelCriticalDepthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface GeometryState {
  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  criticalResidual: number
}

function geometryAtDepth(
  input:
    TrapezoidalChannelCriticalDepthInput,
  depth: number,
): GeometryState {
  const b =
    input.bottomWidth

  const z =
    input.sideSlopeHorizontalPerVertical

  const flowArea =
    depth *
    (
      b +
      z *
      depth
    )

  const topWidth =
    b +
    2 *
    z *
    depth

  const wettedPerimeter =
    b +
    2 *
    depth *
    Math.sqrt(
      1 +
      z *
      z,
    )

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const velocity =
    input.volumetricFlowRate /
    flowArea

  const froudeNumber =
    velocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const criticalResidual =
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
    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    velocity,

    froudeNumber,

    criticalResidual,
  }
}

export function calculateTrapezoidalChannelCriticalDepth(
  input:
    TrapezoidalChannelCriticalDepthInput,
): TrapezoidalChannelCriticalDepthResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  let lowerDepth =
    1e-9

  let upperDepth =
    Math.max(
      1,
      input.bottomWidth,
    )

  let lowerState =
    geometryAtDepth(
      input,
      lowerDepth,
    )

  if (
    !Number.isFinite(
      lowerState.criticalResidual,
    ) ||
    lowerState.criticalResidual <= 0
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'BRACKETING_FAILURE',
      'Could not establish a supercritical lower-depth bracket.',
    )
  }

  let upperState =
    geometryAtDepth(
      input,
      upperDepth,
    )

  let bracketExpansions =
    0

  while (
    upperState.criticalResidual >
    0
  ) {
    upperDepth *=
      2

    bracketExpansions +=
      1

    if (
      bracketExpansions >
      100 ||
      upperDepth >
      1e8
    ) {
      throw new TrapezoidalChannelCriticalDepthError(
        'BRACKETING_FAILURE',
        'Could not establish a subcritical upper-depth bracket.',
      )
    }

    upperState =
      geometryAtDepth(
        input,
        upperDepth,
      )
  }

  const residualTolerance =
    1e-11

  let criticalDepth =
    upperDepth

  let solvedState =
    upperState

  let solverIterations =
    0

  let converged =
    Math.abs(
      solvedState.criticalResidual,
    ) <=
    residualTolerance

  for (
    let iteration = 1;
    iteration <= 200 &&
    !converged;
    iteration += 1
  ) {
    solverIterations =
      iteration

    criticalDepth =
      (
        lowerDepth +
        upperDepth
      ) /
      2

    solvedState =
      geometryAtDepth(
        input,
        criticalDepth,
      )

    converged =
      Math.abs(
        solvedState.criticalResidual,
      ) <=
      residualTolerance

    if (
      converged
    ) {
      break
    }

    if (
      solvedState.criticalResidual >
      0
    ) {
      lowerDepth =
        criticalDepth

      lowerState =
        solvedState
    } else {
      upperDepth =
        criticalDepth

      upperState =
        solvedState
    }
  }

  if (
    !converged
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'CONVERGENCE_FAILURE',
      'Critical-depth bisection did not converge within 200 iterations.',
    )
  }

  const gravityWaveCelerity =
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      solvedState.hydraulicDepth,
    )

  const velocityHead =
    (
      solvedState.velocity *
      solvedState.velocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergy =
    criticalDepth +
    velocityHead

  const specificEnergyToDepthRatio =
    specificEnergy /
    criticalDepth

  const reconstructedVolumetricFlowRate =
    Math.sqrt(
      (
        GRAVITATIONAL_ACCELERATION *
        solvedState.flowArea **
          3
      ) /
      solvedState.topWidth,
    )

  const dischargeResidual =
    reconstructedVolumetricFlowRate -
    input.volumetricFlowRate

  const relativeDischargeResidual =
    dischargeResidual /
    input.volumetricFlowRate

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    criticalDepth,

    solvedState.flowArea,

    solvedState.topWidth,

    solvedState.wettedPerimeter,

    solvedState.hydraulicRadius,

    solvedState.hydraulicDepth,

    solvedState.velocity,

    gravityWaveCelerity,

    solvedState.froudeNumber,

    velocityHead,

    specificEnergy,

    specificEnergyToDepthRatio,

    reconstructedVolumetricFlowRate,

    massFlowRate,
  ]

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    Math.abs(
      solvedState.froudeNumber -
      1
    ) >
      1e-8 ||
    !Number.isFinite(
      dischargeResidual,
    ) ||
    !Number.isFinite(
      relativeDischargeResidual,
    ) ||
    Math.abs(
      relativeDischargeResidual,
    ) >
      1e-8
  ) {
    throw new TrapezoidalChannelCriticalDepthError(
      'NUMERICAL_FAILURE',
      'The critical-depth solution failed its Froude or discharge closure check.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    volumetricFlowRate:
      input.volumetricFlowRate,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    criticalDepth,

    flowArea:
      solvedState.flowArea,

    topWidth:
      solvedState.topWidth,

    wettedPerimeter:
      solvedState.wettedPerimeter,

    hydraulicRadius:
      solvedState.hydraulicRadius,

    hydraulicDepth:
      solvedState.hydraulicDepth,

    criticalVelocity:
      solvedState.velocity,

    gravityWaveCelerity,

    froudeNumber:
      solvedState.froudeNumber,

    velocityHead,

    specificEnergy,

    specificEnergyToDepthRatio,

    reconstructedVolumetricFlowRate,

    dischargeResidual,

    relativeDischargeResidual,

    massFlowRate,

    solverIterations,

    modelName:
      'Trapezoidal Channel Critical Depth',

    limitationDescription:
      'Critical depth is obtained from the general open-channel condition Q²T/(gA³) = 1 for a prismatic trapezoidal section. The calculation assumes hydrostatic pressure distribution and one-dimensional flow. Local transitions, curvature, nonhydrostatic effects and rapidly varied three-dimensional flow are not represented.',
  }
}

export function createTrapezoidalChannelCriticalDepthCsv(
  input:
    TrapezoidalChannelCriticalDepthInput,
  result:
    TrapezoidalChannelCriticalDepthResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Critical Depth',
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
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Flow area',
      result.flowArea,
      'm2',
    ],
    [
      'Top width',
      result.topWidth,
      'm',
    ],
    [
      'Wetted perimeter',
      result.wettedPerimeter,
      'm',
    ],
    [
      'Hydraulic radius',
      result.hydraulicRadius,
      'm',
    ],
    [
      'Hydraulic depth',
      result.hydraulicDepth,
      'm',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Gravity-wave celerity',
      result.gravityWaveCelerity,
      'm/s',
    ],
    [
      'Froude number',
      result.froudeNumber,
      '-',
    ],
    [
      'Velocity head',
      result.velocityHead,
      'm',
    ],
    [
      'Critical specific energy',
      result.specificEnergy,
      'm',
    ],
    [
      'Specific-energy/depth ratio',
      result.specificEnergyToDepthRatio,
      '-',
    ],
    [
      'Reconstructed volumetric flow rate',
      result.reconstructedVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Discharge residual',
      result.dischargeResidual,
      'm3/s',
    ],
    [
      'Relative discharge residual',
      result.relativeDischargeResidual,
      '-',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Solver iterations',
      result.solverIterations,
      '-',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
