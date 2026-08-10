import type {
  RectangularChannelAlternateDepthInput,
  RectangularChannelAlternateDepthResult,
} from './types.ts'

export const RECTANGULAR_CHANNEL_ALTERNATE_DEPTH_ENGINE_VERSION =
  'rectangular-channel-alternate-depth-v1'

export type RectangularChannelAlternateDepthErrorCode =
  | 'INVALID_CHANNEL_WIDTH'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'INSUFFICIENT_SPECIFIC_ENERGY'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class RectangularChannelAlternateDepthError
  extends Error {
  readonly code:
    RectangularChannelAlternateDepthErrorCode

  constructor(
    code:
      RectangularChannelAlternateDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'RectangularChannelAlternateDepthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

function specificEnergyAtDepth(
  unitDischarge: number,
  depth: number,
): number {
  return (
    depth +
    (
      unitDischarge *
      unitDischarge
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION *
      depth *
      depth
    )
  )
}

function solveRoot(
  unitDischarge: number,
  targetEnergy: number,
  lowerInitial: number,
  upperInitial: number,
): {
  depth: number
  iterations: number
} {
  let lower =
    lowerInitial

  let upper =
    upperInitial

  let lowerResidual =
    specificEnergyAtDepth(
      unitDischarge,
      lower,
    ) -
    targetEnergy

  let upperResidual =
    specificEnergyAtDepth(
      unitDischarge,
      upper,
    ) -
    targetEnergy

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
    throw new RectangularChannelAlternateDepthError(
      'BRACKETING_FAILURE',
      'Could not establish a valid alternate-depth root bracket.',
    )
  }

  const tolerance =
    Math.max(
      1e-12,
      targetEnergy *
      1e-11,
    )

  let depth =
    (
      lower +
      upper
    ) /
    2

  let residual =
    specificEnergyAtDepth(
      unitDischarge,
      depth,
    ) -
    targetEnergy

  for (
    let iteration = 1;
    iteration <= 200;
    iteration += 1
  ) {
    depth =
      (
        lower +
        upper
      ) /
      2

    residual =
      specificEnergyAtDepth(
        unitDischarge,
        depth,
      ) -
      targetEnergy

    if (
      Math.abs(
        residual,
      ) <=
      tolerance
    ) {
      return {
        depth,
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

      lowerResidual =
        residual
    } else {
      upper =
        depth

      upperResidual =
        residual
    }
  }

  throw new RectangularChannelAlternateDepthError(
    'CONVERGENCE_FAILURE',
    'Alternate-depth bisection did not converge within 200 iterations.',
  )
}

export function calculateRectangularChannelAlternateDepth(
  input:
    RectangularChannelAlternateDepthInput,
): RectangularChannelAlternateDepthResult {
  if (
    !Number.isFinite(
      input.channelWidth,
    ) ||
    input.channelWidth <= 0
  ) {
    throw new RectangularChannelAlternateDepthError(
      'INVALID_CHANNEL_WIDTH',
      'Rectangular channel width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new RectangularChannelAlternateDepthError(
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
    throw new RectangularChannelAlternateDepthError(
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
    throw new RectangularChannelAlternateDepthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const unitDischarge =
    input.volumetricFlowRate /
    input.channelWidth

  const criticalDepth =
    (
      (
        unitDischarge *
        unitDischarge
      ) /
      GRAVITATIONAL_ACCELERATION
    ) **
    (
      1 / 3
    )

  const minimumSpecificEnergy =
    1.5 *
    criticalDepth

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
    throw new RectangularChannelAlternateDepthError(
      'INSUFFICIENT_SPECIFIC_ENERGY',
      'Specific energy must exceed the minimum critical specific energy to produce two alternate depths.',
    )
  }

  const lowerShallowDepth =
    Math.max(
      1e-12,
      criticalDepth *
      1e-12,
    )

  const shallowSolution =
    solveRoot(
      unitDischarge,
      input.specificEnergy,
      lowerShallowDepth,
      criticalDepth,
    )

  let deepUpper =
    Math.max(
      input.specificEnergy *
      2,
      criticalDepth *
      2,
      1,
    )

  let deepUpperResidual =
    specificEnergyAtDepth(
      unitDischarge,
      deepUpper,
    ) -
    input.specificEnergy

  let expansionCount =
    0

  while (
    deepUpperResidual <=
    0
  ) {
    deepUpper *=
      2

    expansionCount +=
      1

    if (
      expansionCount >
      100 ||
      deepUpper >
      1e8
    ) {
      throw new RectangularChannelAlternateDepthError(
        'BRACKETING_FAILURE',
        'Could not establish the deep alternate-depth bracket.',
      )
    }

    deepUpperResidual =
      specificEnergyAtDepth(
        unitDischarge,
        deepUpper,
      ) -
      input.specificEnergy
  }

  const deepSolution =
    solveRoot(
      unitDischarge,
      input.specificEnergy,
      criticalDepth,
      deepUpper,
    )

  const shallowDepth =
    shallowSolution.depth

  const deepDepth =
    deepSolution.depth

  const alternateDepthRatio =
    deepDepth /
    shallowDepth

  const shallowVelocity =
    unitDischarge /
    shallowDepth

  const deepVelocity =
    unitDischarge /
    deepDepth

  const shallowFroudeNumber =
    shallowVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      shallowDepth,
    )

  const deepFroudeNumber =
    deepVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      deepDepth,
    )

  const shallowVelocityHead =
    (
      shallowVelocity *
      shallowVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const deepVelocityHead =
    (
      deepVelocity *
      deepVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const shallowRecoveredSpecificEnergy =
    shallowDepth +
    shallowVelocityHead

  const deepRecoveredSpecificEnergy =
    deepDepth +
    deepVelocityHead

  const shallowEnergyResidual =
    shallowRecoveredSpecificEnergy -
    input.specificEnergy

  const deepEnergyResidual =
    deepRecoveredSpecificEnergy -
    input.specificEnergy

  const shallowMomentumFunction =
    (
      shallowDepth *
      shallowDepth /
      2
    ) +
    (
      unitDischarge *
      unitDischarge /
      (
        GRAVITATIONAL_ACCELERATION *
        shallowDepth
      )
    )

  const deepMomentumFunction =
    (
      deepDepth *
      deepDepth /
      2
    ) +
    (
      unitDischarge *
      unitDischarge /
      (
        GRAVITATIONAL_ACCELERATION *
        deepDepth
      )
    )

  const momentumFunctionDifference =
    deepMomentumFunction -
    shallowMomentumFunction

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
    unitDischarge,

    criticalDepth,

    minimumSpecificEnergy,

    energyAboveMinimum,

    shallowDepth,

    deepDepth,

    alternateDepthRatio,

    shallowVelocity,

    deepVelocity,

    shallowFroudeNumber,

    deepFroudeNumber,

    shallowVelocityHead,

    deepVelocityHead,

    shallowRecoveredSpecificEnergy,

    deepRecoveredSpecificEnergy,

    shallowMomentumFunction,

    deepMomentumFunction,

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
    shallowDepth >=
      criticalDepth ||
    deepDepth <=
      criticalDepth ||
    shallowFroudeNumber <=
      1 ||
    deepFroudeNumber >=
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
    throw new RectangularChannelAlternateDepthError(
      'NUMERICAL_FAILURE',
      'The alternate-depth solution failed its energy or Froude closure checks.',
    )
  }

  return {
    channelWidth:
      input.channelWidth,

    volumetricFlowRate:
      input.volumetricFlowRate,

    unitDischarge,

    specificEnergy:
      input.specificEnergy,

    criticalDepth,

    minimumSpecificEnergy,

    energyAboveMinimum,

    shallowDepth,

    deepDepth,

    alternateDepthRatio,

    shallowVelocity,

    deepVelocity,

    shallowFroudeNumber,

    deepFroudeNumber,

    shallowVelocityHead,

    deepVelocityHead,

    shallowRecoveredSpecificEnergy,

    deepRecoveredSpecificEnergy,

    shallowEnergyResidual,

    deepEnergyResidual,

    shallowMomentumFunction,

    deepMomentumFunction,

    momentumFunctionDifference,

    massFlowRate,

    shallowSolverIterations:
      shallowSolution.iterations,

    deepSolverIterations:
      deepSolution.iterations,

    modelName:
      'Rectangular Channel Alternate Depths from Specific Energy',

    limitationDescription:
      'One-dimensional rectangular open-channel specific-energy model. Two alternate depths exist only when the specified energy exceeds the minimum critical specific energy. The calculation assumes hydrostatic pressure distribution and neglects local losses between the two hypothetical states.',
  }
}

export function createRectangularChannelAlternateDepthCsv(
  input:
    RectangularChannelAlternateDepthInput,
  result:
    RectangularChannelAlternateDepthResult,
): string {
  const rows = [
    [
      'Rectangular Channel Alternate Depths from Specific Energy',
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
      'Unit discharge',
      result.unitDischarge,
      'm2/s',
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
      'm2',
    ],
    [
      'Deep momentum function',
      result.deepMomentumFunction,
      'm2',
    ],
    [
      'Momentum function difference',
      result.momentumFunctionDifference,
      'm2',
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
