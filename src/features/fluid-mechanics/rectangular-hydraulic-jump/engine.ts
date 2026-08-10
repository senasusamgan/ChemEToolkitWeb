import type {
  RectangularHydraulicJumpInput,
  RectangularHydraulicJumpResult,
} from './types.ts'

export const RECTANGULAR_HYDRAULIC_JUMP_ENGINE_VERSION =
  'rectangular-hydraulic-jump-v1'

export type RectangularHydraulicJumpErrorCode =
  | 'INVALID_CHANNEL_WIDTH'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_FLOW_NOT_SUPERCRITICAL'
  | 'NUMERICAL_FAILURE'

export class RectangularHydraulicJumpError
  extends Error {
  readonly code:
    RectangularHydraulicJumpErrorCode

  constructor(
    code:
      RectangularHydraulicJumpErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'RectangularHydraulicJumpError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateRectangularHydraulicJump(
  input:
    RectangularHydraulicJumpInput,
): RectangularHydraulicJumpResult {
  if (
    !Number.isFinite(
      input.channelWidth,
    ) ||
    input.channelWidth <= 0
  ) {
    throw new RectangularHydraulicJumpError(
      'INVALID_CHANNEL_WIDTH',
      'Rectangular channel width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamDepth,
    ) ||
    input.upstreamDepth <= 0
  ) {
    throw new RectangularHydraulicJumpError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new RectangularHydraulicJumpError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new RectangularHydraulicJumpError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const unitDischarge =
    input.volumetricFlowRate /
    input.channelWidth

  const upstreamFlowArea =
    input.channelWidth *
    input.upstreamDepth

  const upstreamVelocity =
    input.volumetricFlowRate /
    upstreamFlowArea

  const upstreamFroudeNumber =
    upstreamVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      input.upstreamDepth,
    )

  if (
    upstreamFroudeNumber <= 1
  ) {
    throw new RectangularHydraulicJumpError(
      'UPSTREAM_FLOW_NOT_SUPERCRITICAL',
      'A classical hydraulic jump requires supercritical upstream flow with Fr1 greater than 1.',
    )
  }

  const sequentDepthRatio =
    0.5 *
    (
      Math.sqrt(
        1 +
        8 *
        upstreamFroudeNumber *
        upstreamFroudeNumber,
      ) -
      1
    )

  const downstreamDepth =
    input.upstreamDepth *
    sequentDepthRatio

  const downstreamFlowArea =
    input.channelWidth *
    downstreamDepth

  const downstreamVelocity =
    input.volumetricFlowRate /
    downstreamFlowArea

  const downstreamFroudeNumber =
    downstreamVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      downstreamDepth,
    )

  const upstreamSpecificEnergy =
    input.upstreamDepth +
    upstreamVelocity *
    upstreamVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const downstreamSpecificEnergy =
    downstreamDepth +
    downstreamVelocity *
    downstreamVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const energyLoss =
    (
      (
        downstreamDepth -
        input.upstreamDepth
      ) **
      3
    ) /
    (
      4 *
      input.upstreamDepth *
      downstreamDepth
    )

  const energyLossPercentage =
    energyLoss /
    upstreamSpecificEnergy *
    100

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const dissipatedPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    energyLoss

  const upstreamMomentumFunction =
    (
      input.upstreamDepth *
      input.upstreamDepth /
      2
    ) +
    (
      unitDischarge *
      unitDischarge /
      (
        GRAVITATIONAL_ACCELERATION *
        input.upstreamDepth
      )
    )

  const downstreamMomentumFunction =
    (
      downstreamDepth *
      downstreamDepth /
      2
    ) +
    (
      unitDischarge *
      unitDischarge /
      (
        GRAVITATIONAL_ACCELERATION *
        downstreamDepth
      )
    )

  const momentumClosureResidual =
    downstreamMomentumFunction -
    upstreamMomentumFunction

  const upstreamRegime =
    upstreamFroudeNumber > 1
      ? 'supercritical'
      : 'subcritical'

  const downstreamRegime =
    downstreamFroudeNumber < 1
      ? 'subcritical'
      : 'supercritical'

  const positiveValues = [
    unitDischarge,

    upstreamFlowArea,

    downstreamFlowArea,

    upstreamVelocity,

    downstreamVelocity,

    upstreamFroudeNumber,

    downstreamFroudeNumber,

    sequentDepthRatio,

    downstreamDepth,

    upstreamSpecificEnergy,

    downstreamSpecificEnergy,

    energyLoss,

    energyLossPercentage,

    massFlowRate,

    dissipatedPower,

    upstreamMomentumFunction,

    downstreamMomentumFunction,
  ]

  const momentumTolerance =
    Math.max(
      1e-12,
      Math.abs(
        upstreamMomentumFunction,
      ) *
      1e-10,
    )

  const energyClosureResidual =
    (
      upstreamSpecificEnergy -
      downstreamSpecificEnergy
    ) -
    energyLoss

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    downstreamDepth <=
      input.upstreamDepth ||
    downstreamFroudeNumber >=
      1 ||
    !Number.isFinite(
      momentumClosureResidual,
    ) ||
    Math.abs(
      momentumClosureResidual,
    ) >
      momentumTolerance ||
    !Number.isFinite(
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      Math.max(
        1e-12,
        energyLoss *
        1e-10,
      )
  ) {
    throw new RectangularHydraulicJumpError(
      'NUMERICAL_FAILURE',
      'The hydraulic-jump calculation failed its momentum or energy closure check.',
    )
  }

  return {
    channelWidth:
      input.channelWidth,

    upstreamDepth:
      input.upstreamDepth,

    downstreamDepth,

    sequentDepthRatio,

    volumetricFlowRate:
      input.volumetricFlowRate,

    massFlowRate,

    unitDischarge,

    upstreamFlowArea,

    downstreamFlowArea,

    upstreamVelocity,

    downstreamVelocity,

    upstreamFroudeNumber,

    downstreamFroudeNumber,

    upstreamSpecificEnergy,

    downstreamSpecificEnergy,

    energyLoss,

    energyLossPercentage,

    dissipatedPower,

    upstreamMomentumFunction,

    downstreamMomentumFunction,

    momentumClosureResidual,

    upstreamRegime,

    downstreamRegime,

    modelName:
      'Rectangular Hydraulic Jump — Sequent Depth & Energy Loss',

    limitationDescription:
      'Classical one-dimensional hydraulic-jump model for a horizontal rectangular channel. Hydrostatic pressure distributions are assumed on both sides of the jump, momentum losses to channel boundaries are neglected across the short jump region, and the incoming flow must be supercritical.',
  }
}

export function createRectangularHydraulicJumpCsv(
  input:
    RectangularHydraulicJumpInput,
  result:
    RectangularHydraulicJumpResult,
): string {
  const rows = [
    [
      'Rectangular Hydraulic Jump — Sequent Depth & Energy Loss',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Channel width',
      input.channelWidth,
      'm',
    ],
    [
      'Upstream depth',
      input.upstreamDepth,
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
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Unit discharge',
      result.unitDischarge,
      'm2/s',
    ],
    [
      'Upstream velocity',
      result.upstreamVelocity,
      'm/s',
    ],
    [
      'Upstream Froude number',
      result.upstreamFroudeNumber,
      '-',
    ],
    [
      'Sequent depth',
      result.downstreamDepth,
      'm',
    ],
    [
      'Sequent depth ratio',
      result.sequentDepthRatio,
      '-',
    ],
    [
      'Downstream velocity',
      result.downstreamVelocity,
      'm/s',
    ],
    [
      'Downstream Froude number',
      result.downstreamFroudeNumber,
      '-',
    ],
    [
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Downstream specific energy',
      result.downstreamSpecificEnergy,
      'm',
    ],
    [
      'Hydraulic-jump energy loss',
      result.energyLoss,
      'm',
    ],
    [
      'Energy loss percentage',
      result.energyLossPercentage,
      '%',
    ],
    [
      'Dissipated hydraulic power',
      result.dissipatedPower,
      'W',
    ],
    [
      'Upstream momentum function',
      result.upstreamMomentumFunction,
      'm2',
    ],
    [
      'Downstream momentum function',
      result.downstreamMomentumFunction,
      'm2',
    ],
    [
      'Momentum closure residual',
      result.momentumClosureResidual,
      'm2',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
