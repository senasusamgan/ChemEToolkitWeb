import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalHydraulicJumpInput,
  TrapezoidalHydraulicJumpResult,
} from './types.ts'

export const TRAPEZOIDAL_HYDRAULIC_JUMP_ENGINE_VERSION =
  'trapezoidal-hydraulic-jump-v1'

export type TrapezoidalHydraulicJumpErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_FLOW_NOT_SUPERCRITICAL'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalHydraulicJumpError
  extends Error {
  readonly code:
    TrapezoidalHydraulicJumpErrorCode

  constructor(
    code:
      TrapezoidalHydraulicJumpErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalHydraulicJumpError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface HydraulicState {
  depth: number

  flowArea: number

  topWidth: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  hydrostaticMomentumTerm: number

  kineticMomentumTerm: number

  momentumFunction: number
}

function stateAtDepth(
  input:
    TrapezoidalHydraulicJumpInput,
  depth: number,
): HydraulicState {
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

  const specificEnergy =
    depth +
    (
      velocity *
      velocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const hydrostaticMomentumTerm =
    (
      b *
      depth *
      depth /
      2
    ) +
    (
      z *
      depth *
      depth *
      depth /
      3
    )

  const kineticMomentumTerm =
    (
      input.volumetricFlowRate *
      input.volumetricFlowRate
    ) /
    (
      GRAVITATIONAL_ACCELERATION *
      flowArea
    )

  const momentumFunction =
    hydrostaticMomentumTerm +
    kineticMomentumTerm

  return {
    depth,

    flowArea,

    topWidth,

    hydraulicDepth,

    velocity,

    froudeNumber,

    specificEnergy,

    hydrostaticMomentumTerm,

    kineticMomentumTerm,

    momentumFunction,
  }
}

export function calculateTrapezoidalHydraulicJump(
  input:
    TrapezoidalHydraulicJumpInput,
): TrapezoidalHydraulicJumpResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamDepth,
    ) ||
    input.upstreamDepth <= 0
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalHydraulicJumpError(
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
    throw new TrapezoidalHydraulicJumpError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const upstream =
    stateAtDepth(
      input,
      input.upstreamDepth,
    )

  const critical =
    calculateTrapezoidalChannelCriticalDepth({
      bottomWidth:
        input.bottomWidth,

      volumetricFlowRate:
        input.volumetricFlowRate,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  if (
    upstream.froudeNumber <=
      1 + 1e-9 ||
    input.upstreamDepth >=
      critical.criticalDepth
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'UPSTREAM_FLOW_NOT_SUPERCRITICAL',
      'A hydraulic jump requires the specified upstream state to lie on the supercritical branch.',
    )
  }

  const targetMomentum =
    upstream.momentumFunction

  let lowerDepth =
    critical.criticalDepth *
    (
      1 +
      1e-10
    )

  let lowerState =
    stateAtDepth(
      input,
      lowerDepth,
    )

  let lowerResidual =
    lowerState.momentumFunction -
    targetMomentum

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    lowerResidual >= 0
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'BRACKETING_FAILURE',
      'Could not establish the lower subcritical momentum bracket.',
    )
  }

  let upperDepth =
    Math.max(
      critical.criticalDepth *
      2,
      input.upstreamDepth *
      2,
      1,
    )

  let upperState =
    stateAtDepth(
      input,
      upperDepth,
    )

  let upperResidual =
    upperState.momentumFunction -
    targetMomentum

  let bracketExpansions =
    0

  while (
    upperResidual <= 0
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
      throw new TrapezoidalHydraulicJumpError(
        'BRACKETING_FAILURE',
        'Could not establish an upper conjugate-depth momentum bracket.',
      )
    }

    upperState =
      stateAtDepth(
        input,
        upperDepth,
      )

    upperResidual =
      upperState.momentumFunction -
      targetMomentum
  }

  const momentumTolerance =
    Math.max(
      1e-12,
      Math.abs(
        targetMomentum,
      ) *
      1e-10,
    )

  let downstreamDepth =
    (
      lowerDepth +
      upperDepth
    ) /
    2

  let downstream =
    stateAtDepth(
      input,
      downstreamDepth,
    )

  let momentumClosureResidual =
    downstream.momentumFunction -
    targetMomentum

  let solverIterations =
    0

  let converged =
    Math.abs(
      momentumClosureResidual,
    ) <=
    momentumTolerance

  for (
    let iteration = 1;
    iteration <= 200 &&
    !converged;
    iteration += 1
  ) {
    solverIterations =
      iteration

    downstreamDepth =
      (
        lowerDepth +
        upperDepth
      ) /
      2

    downstream =
      stateAtDepth(
        input,
        downstreamDepth,
      )

    momentumClosureResidual =
      downstream.momentumFunction -
      targetMomentum

    converged =
      Math.abs(
        momentumClosureResidual,
      ) <=
      momentumTolerance

    if (
      converged
    ) {
      break
    }

    if (
      momentumClosureResidual <
      0
    ) {
      lowerDepth =
        downstreamDepth

      lowerState =
        downstream

      lowerResidual =
        momentumClosureResidual
    } else {
      upperDepth =
        downstreamDepth

      upperState =
        downstream

      upperResidual =
        momentumClosureResidual
    }
  }

  if (
    !converged
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'CONVERGENCE_FAILURE',
      'Conjugate-depth momentum solver did not converge within 200 iterations.',
    )
  }

  const sequentDepthRatio =
    downstreamDepth /
    input.upstreamDepth

  const energyLoss =
    upstream.specificEnergy -
    downstream.specificEnergy

  const energyLossPercentage =
    energyLoss /
    upstream.specificEnergy *
    100

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const dissipatedPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    energyLoss

  const relativeMomentumClosureResidual =
    momentumClosureResidual /
    targetMomentum

  const positiveValues = [
    critical.criticalDepth,

    upstream.flowArea,

    downstream.flowArea,

    upstream.topWidth,

    downstream.topWidth,

    upstream.hydraulicDepth,

    downstream.hydraulicDepth,

    upstream.velocity,

    downstream.velocity,

    upstream.froudeNumber,

    downstream.froudeNumber,

    upstream.specificEnergy,

    downstream.specificEnergy,

    downstreamDepth,

    sequentDepthRatio,

    energyLoss,

    energyLossPercentage,

    massFlowRate,

    dissipatedPower,

    upstream.hydrostaticMomentumTerm,

    downstream.hydrostaticMomentumTerm,

    upstream.kineticMomentumTerm,

    downstream.kineticMomentumTerm,

    upstream.momentumFunction,

    downstream.momentumFunction,
  ]

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    downstreamDepth <=
      critical.criticalDepth ||
    downstreamDepth <=
      input.upstreamDepth ||
    upstream.froudeNumber <=
      1 ||
    downstream.froudeNumber >=
      1 ||
    !Number.isFinite(
      momentumClosureResidual,
    ) ||
    !Number.isFinite(
      relativeMomentumClosureResidual,
    ) ||
    Math.abs(
      momentumClosureResidual,
    ) >
      momentumTolerance ||
    Math.abs(
      relativeMomentumClosureResidual,
    ) >
      1e-9
  ) {
    throw new TrapezoidalHydraulicJumpError(
      'NUMERICAL_FAILURE',
      'The trapezoidal hydraulic-jump solution failed its momentum, energy or Froude closure checks.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    upstreamDepth:
      input.upstreamDepth,

    downstreamDepth,

    sequentDepthRatio,

    criticalDepth:
      critical.criticalDepth,

    volumetricFlowRate:
      input.volumetricFlowRate,

    massFlowRate,

    upstreamFlowArea:
      upstream.flowArea,

    downstreamFlowArea:
      downstream.flowArea,

    upstreamTopWidth:
      upstream.topWidth,

    downstreamTopWidth:
      downstream.topWidth,

    upstreamHydraulicDepth:
      upstream.hydraulicDepth,

    downstreamHydraulicDepth:
      downstream.hydraulicDepth,

    upstreamVelocity:
      upstream.velocity,

    downstreamVelocity:
      downstream.velocity,

    upstreamFroudeNumber:
      upstream.froudeNumber,

    downstreamFroudeNumber:
      downstream.froudeNumber,

    upstreamSpecificEnergy:
      upstream.specificEnergy,

    downstreamSpecificEnergy:
      downstream.specificEnergy,

    energyLoss,

    energyLossPercentage,

    dissipatedPower,

    upstreamHydrostaticMomentumTerm:
      upstream.hydrostaticMomentumTerm,

    downstreamHydrostaticMomentumTerm:
      downstream.hydrostaticMomentumTerm,

    upstreamKineticMomentumTerm:
      upstream.kineticMomentumTerm,

    downstreamKineticMomentumTerm:
      downstream.kineticMomentumTerm,

    upstreamMomentumFunction:
      upstream.momentumFunction,

    downstreamMomentumFunction:
      downstream.momentumFunction,

    momentumClosureResidual,

    relativeMomentumClosureResidual,

    solverIterations,

    modelName:
      'Trapezoidal Hydraulic Jump — Sequent Depth & Energy Loss',

    limitationDescription:
      'One-dimensional momentum analysis for a hydraulic jump in a horizontal symmetric trapezoidal channel. Hydrostatic pressure distributions are assumed at the upstream and downstream sections, and external momentum losses across the short jump region are neglected. The specified upstream state must be supercritical.',
  }
}

export function createTrapezoidalHydraulicJumpCsv(
  input:
    TrapezoidalHydraulicJumpInput,
  result:
    TrapezoidalHydraulicJumpResult,
): string {
  const rows = [
    [
      'Trapezoidal Hydraulic Jump — Sequent Depth & Energy Loss',
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
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Downstream sequent depth',
      result.downstreamDepth,
      'm',
    ],
    [
      'Sequent depth ratio',
      result.sequentDepthRatio,
      '-',
    ],
    [
      'Upstream velocity',
      result.upstreamVelocity,
      'm/s',
    ],
    [
      'Downstream velocity',
      result.downstreamVelocity,
      'm/s',
    ],
    [
      'Upstream Froude number',
      result.upstreamFroudeNumber,
      '-',
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
      'Energy loss',
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
      'm3',
    ],
    [
      'Downstream momentum function',
      result.downstreamMomentumFunction,
      'm3',
    ],
    [
      'Momentum closure residual',
      result.momentumClosureResidual,
      'm3',
    ],
    [
      'Relative momentum closure residual',
      result.relativeMomentumClosureResidual,
      '-',
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
