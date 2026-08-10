import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalChannelAlternateDepthInput,
  TrapezoidalChannelAlternateDepthResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_ALTERNATE_DEPTH_ENGINE_VERSION =
  'trapezoidal-channel-alternate-depth-v1'

export type TrapezoidalChannelAlternateDepthErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'INSUFFICIENT_SPECIFIC_ENERGY'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelAlternateDepthError
  extends Error {
  readonly code:
    TrapezoidalChannelAlternateDepthErrorCode

  constructor(
    code:
      TrapezoidalChannelAlternateDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelAlternateDepthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface DepthState {
  depth: number

  flowArea: number

  topWidth: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  momentumFunction: number
}

function stateAtDepth(
  input:
    TrapezoidalChannelAlternateDepthInput,
  depth: number,
): DepthState {
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

    momentumFunction,
  }
}

function solveEnergyRoot(
  input:
    TrapezoidalChannelAlternateDepthInput,
  lowerInitial: number,
  upperInitial: number,
): {
  state: DepthState
  iterations: number
} {
  let lower =
    lowerInitial

  let upper =
    upperInitial

  let lowerState =
    stateAtDepth(
      input,
      lower,
    )

  let upperState =
    stateAtDepth(
      input,
      upper,
    )

  let lowerResidual =
    lowerState.specificEnergy -
    input.specificEnergy

  let upperResidual =
    upperState.specificEnergy -
    input.specificEnergy

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
    throw new TrapezoidalChannelAlternateDepthError(
      'BRACKETING_FAILURE',
      'Could not establish an alternate-depth energy root bracket.',
    )
  }

  const energyTolerance =
    Math.max(
      1e-12,
      input.specificEnergy *
      1e-11,
    )

  for (
    let iteration = 1;
    iteration <= 200;
    iteration += 1
  ) {
    const depth =
      (
        lower +
        upper
      ) /
      2

    const state =
      stateAtDepth(
        input,
        depth,
      )

    const residual =
      state.specificEnergy -
      input.specificEnergy

    if (
      Math.abs(
        residual,
      ) <=
      energyTolerance
    ) {
      return {
        state,
        iterations:
          iteration,
      }
    }

    if (
      lowerResidual *
      residual >
      0
    ) {
      lower =
        depth

      lowerState =
        state

      lowerResidual =
        residual
    } else {
      upper =
        depth

      upperState =
        state

      upperResidual =
        residual
    }
  }

  throw new TrapezoidalChannelAlternateDepthError(
    'CONVERGENCE_FAILURE',
    'Alternate-depth energy solver did not converge within 200 iterations.',
  )
}

export function calculateTrapezoidalChannelAlternateDepth(
  input:
    TrapezoidalChannelAlternateDepthInput,
): TrapezoidalChannelAlternateDepthResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
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
    throw new TrapezoidalChannelAlternateDepthError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.specificEnergy,
    ) ||
    input.specificEnergy <= 0
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
      'INVALID_SPECIFIC_ENERGY',
      'Specific energy must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

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

  const criticalDepth =
    critical.criticalDepth

  const minimumSpecificEnergy =
    critical.specificEnergy

  const energyAboveMinimum =
    input.specificEnergy -
    minimumSpecificEnergy

  if (
    energyAboveMinimum <=
    Math.max(
      1e-12,
      minimumSpecificEnergy *
      1e-12,
    )
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
      'INSUFFICIENT_SPECIFIC_ENERGY',
      'Specific energy must exceed the minimum critical specific energy to produce two distinct alternate depths.',
    )
  }

  let shallowLower =
    Math.max(
      1e-12,
      criticalDepth *
      1e-10,
    )

  let shallowLowerState =
    stateAtDepth(
      input,
      shallowLower,
    )

  let shallowLowerResidual =
    shallowLowerState.specificEnergy -
    input.specificEnergy

  let shallowContractions =
    0

  while (
    shallowLowerResidual <= 0
  ) {
    shallowLower /=
      10

    shallowContractions +=
      1

    if (
      shallowContractions >
      100 ||
      shallowLower <=
      Number.MIN_VALUE
    ) {
      throw new TrapezoidalChannelAlternateDepthError(
        'BRACKETING_FAILURE',
        'Could not establish the shallow alternate-depth bracket.',
      )
    }

    shallowLowerState =
      stateAtDepth(
        input,
        shallowLower,
      )

    shallowLowerResidual =
      shallowLowerState.specificEnergy -
      input.specificEnergy
  }

  const shallowSolution =
    solveEnergyRoot(
      input,
      shallowLower,
      criticalDepth,
    )

  let deepUpper =
    Math.max(
      criticalDepth *
      2,
      input.specificEnergy *
      2,
      1,
    )

  if (
    !Number.isFinite(
      deepUpper,
    )
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
      'BRACKETING_FAILURE',
      'Could not establish a finite deep alternate-depth upper bound.',
    )
  }

  let deepUpperState =
    stateAtDepth(
      input,
      deepUpper,
    )

  let deepUpperResidual =
    deepUpperState.specificEnergy -
    input.specificEnergy

  let deepExpansions =
    0

  while (
    deepUpperResidual <= 0
  ) {
    deepUpper *=
      2

    deepExpansions +=
      1

    if (
      deepExpansions >
      100 ||
      !Number.isFinite(
        deepUpper,
      ) ||
      deepUpper >
      1e12
    ) {
      throw new TrapezoidalChannelAlternateDepthError(
        'BRACKETING_FAILURE',
        'Could not establish the deep alternate-depth bracket.',
      )
    }

    deepUpperState =
      stateAtDepth(
        input,
        deepUpper,
      )

    deepUpperResidual =
      deepUpperState.specificEnergy -
      input.specificEnergy
  }

  const deepSolution =
    solveEnergyRoot(
      input,
      criticalDepth,
      deepUpper,
    )

  const shallow =
    shallowSolution.state

  const deep =
    deepSolution.state

  const alternateDepthRatio =
    deep.depth /
    shallow.depth

  const shallowEnergyResidual =
    shallow.specificEnergy -
    input.specificEnergy

  const deepEnergyResidual =
    deep.specificEnergy -
    input.specificEnergy

  const momentumFunctionDifference =
    deep.momentumFunction -
    shallow.momentumFunction

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const energyTolerance =
    Math.max(
      1e-12,
      input.specificEnergy *
      1e-10,
    )

  const positiveValues = [
    criticalDepth,

    minimumSpecificEnergy,

    energyAboveMinimum,

    shallow.depth,

    deep.depth,

    alternateDepthRatio,

    shallow.flowArea,

    deep.flowArea,

    shallow.topWidth,

    deep.topWidth,

    shallow.hydraulicDepth,

    deep.hydraulicDepth,

    shallow.velocity,

    deep.velocity,

    shallow.froudeNumber,

    deep.froudeNumber,

    shallow.specificEnergy,

    deep.specificEnergy,

    shallow.momentumFunction,

    deep.momentumFunction,

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
    shallow.depth >=
      criticalDepth ||
    deep.depth <=
      criticalDepth ||
    shallow.froudeNumber <=
      1 ||
    deep.froudeNumber >=
      1 ||
    !Number.isFinite(
      shallowEnergyResidual,
    ) ||
    !Number.isFinite(
      deepEnergyResidual,
    ) ||
    Math.abs(
      shallowEnergyResidual,
    ) >
      energyTolerance ||
    Math.abs(
      deepEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      momentumFunctionDifference,
    )
  ) {
    throw new TrapezoidalChannelAlternateDepthError(
      'NUMERICAL_FAILURE',
      'The trapezoidal alternate-depth solution failed its energy or Froude closure checks.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    volumetricFlowRate:
      input.volumetricFlowRate,

    specificEnergy:
      input.specificEnergy,

    criticalDepth,

    minimumSpecificEnergy,

    energyAboveMinimum,

    shallowDepth:
      shallow.depth,

    deepDepth:
      deep.depth,

    alternateDepthRatio,

    shallowFlowArea:
      shallow.flowArea,

    deepFlowArea:
      deep.flowArea,

    shallowTopWidth:
      shallow.topWidth,

    deepTopWidth:
      deep.topWidth,

    shallowHydraulicDepth:
      shallow.hydraulicDepth,

    deepHydraulicDepth:
      deep.hydraulicDepth,

    shallowVelocity:
      shallow.velocity,

    deepVelocity:
      deep.velocity,

    shallowFroudeNumber:
      shallow.froudeNumber,

    deepFroudeNumber:
      deep.froudeNumber,

    shallowRecoveredSpecificEnergy:
      shallow.specificEnergy,

    deepRecoveredSpecificEnergy:
      deep.specificEnergy,

    shallowEnergyResidual,

    deepEnergyResidual,

    shallowMomentumFunction:
      shallow.momentumFunction,

    deepMomentumFunction:
      deep.momentumFunction,

    momentumFunctionDifference,

    massFlowRate,

    shallowSolverIterations:
      shallowSolution.iterations,

    deepSolverIterations:
      deepSolution.iterations,

    modelName:
      'Trapezoidal Channel Alternate Depths from Specific Energy',

    limitationDescription:
      'One-dimensional trapezoidal open-channel specific-energy analysis. Two alternate depths exist only when the specified energy exceeds the minimum critical specific energy. The model assumes a prismatic symmetric section and hydrostatic pressure distribution, and it does not represent local energy losses between the two hypothetical states.',
  }
}

export function createTrapezoidalChannelAlternateDepthCsv(
  input:
    TrapezoidalChannelAlternateDepthInput,
  result:
    TrapezoidalChannelAlternateDepthResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Alternate Depths from Specific Energy',
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
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Specific energy',
      input.specificEnergy,
      'm',
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
      'Minimum specific energy',
      result.minimumSpecificEnergy,
      'm',
    ],
    [
      'Energy above minimum',
      result.energyAboveMinimum,
      'm',
    ],
    [
      'Shallow alternate depth',
      result.shallowDepth,
      'm',
    ],
    [
      'Deep alternate depth',
      result.deepDepth,
      'm',
    ],
    [
      'Alternate depth ratio',
      result.alternateDepthRatio,
      '-',
    ],
    [
      'Shallow flow area',
      result.shallowFlowArea,
      'm2',
    ],
    [
      'Deep flow area',
      result.deepFlowArea,
      'm2',
    ],
    [
      'Shallow velocity',
      result.shallowVelocity,
      'm/s',
    ],
    [
      'Deep velocity',
      result.deepVelocity,
      'm/s',
    ],
    [
      'Shallow Froude number',
      result.shallowFroudeNumber,
      '-',
    ],
    [
      'Deep Froude number',
      result.deepFroudeNumber,
      '-',
    ],
    [
      'Shallow recovered specific energy',
      result.shallowRecoveredSpecificEnergy,
      'm',
    ],
    [
      'Deep recovered specific energy',
      result.deepRecoveredSpecificEnergy,
      'm',
    ],
    [
      'Shallow energy residual',
      result.shallowEnergyResidual,
      'm',
    ],
    [
      'Deep energy residual',
      result.deepEnergyResidual,
      'm',
    ],
    [
      'Shallow momentum function',
      result.shallowMomentumFunction,
      'm3',
    ],
    [
      'Deep momentum function',
      result.deepMomentumFunction,
      'm3',
    ],
    [
      'Momentum function difference',
      result.momentumFunctionDifference,
      'm3',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Shallow solver iterations',
      result.shallowSolverIterations,
      '-',
    ],
    [
      'Deep solver iterations',
      result.deepSolverIterations,
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
