import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import type {
  PartiallyFullCircularChannelAlternateDepthsInput,
  PartiallyFullCircularChannelAlternateDepthsResult,
  PartiallyFullCircularChannelAlternateDepthSolution,
} from './types.ts'

export const PARTIALLY_FULL_CIRCULAR_CHANNEL_ALTERNATE_DEPTHS_ENGINE_VERSION =
  'partially-full-circular-channel-alternate-depths-v1'

export type PartiallyFullCircularChannelAlternateDepthsErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'SPECIFIC_ENERGY_BELOW_CRITICAL'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class PartiallyFullCircularChannelAlternateDepthsError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelAlternateDepthsErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelAlternateDepthsErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelAlternateDepthsError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665


interface CircularState {
  centralAngleRadians: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  velocityHead: number

  froudeNumber: number

  specificEnergy: number
}


function sectionState(
  input:
    PartiallyFullCircularChannelAlternateDepthsInput,
  flowDepth: number,
): CircularState {
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

  const meanVelocity =
    input.volumetricFlowRate /
    flowArea

  const velocityHead =
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergy =
    flowDepth +
    velocityHead

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  return {
    centralAngleRadians,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    velocityHead,

    froudeNumber,

    specificEnergy,
  }
}


function solveEnergyRoot(
  input:
    PartiallyFullCircularChannelAlternateDepthsInput,
  lowerDepth: number,
  upperDepth: number,
): number {
  let lower =
    lowerDepth

  let upper =
    upperDepth

  let lowerResidual =
    sectionState(
      input,
      lower,
    ).specificEnergy -
    input.specificEnergy

  let upperResidual =
    sectionState(
      input,
      upper,
    ).specificEnergy -
    input.specificEnergy

  const energyTolerance =
    Math.max(
      1e-12,
      input.specificEnergy *
      1e-11,
    )

  if (
    Math.abs(
      lowerResidual,
    ) <=
    energyTolerance
  ) {
    return lower
  }

  if (
    Math.abs(
      upperResidual,
    ) <=
    energyTolerance
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
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'ROOT_BRACKETING_FAILURE',
      'Specific-energy alternate-depth root could not be bracketed.',
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
      sectionState(
        input,
        middle,
      ).specificEnergy -
      input.specificEnergy

    if (
      !Number.isFinite(
        middleResidual,
      )
    ) {
      throw new PartiallyFullCircularChannelAlternateDepthsError(
        'ROOT_CONVERGENCE_FAILURE',
        'Specific-energy residual became non-finite.',
      )
    }

    if (
      Math.abs(
        middleResidual,
      ) <=
      energyTolerance
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

  const finalResidual =
    sectionState(
      input,
      depth,
    ).specificEnergy -
    input.specificEnergy

  if (
    Math.abs(
      finalResidual,
    ) >
    Math.max(
      1e-9,
      input.specificEnergy *
      1e-8,
    )
  ) {
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'ROOT_CONVERGENCE_FAILURE',
      'Circular-channel alternate-depth solver did not converge.',
    )
  }

  return depth
}


function createSolution(
  input:
    PartiallyFullCircularChannelAlternateDepthsInput,
  flowDepth: number,
): PartiallyFullCircularChannelAlternateDepthSolution {
  const state =
    sectionState(
      input,
      flowDepth,
    )

  const flowRegime =
    Math.abs(
      state.froudeNumber -
      1
    ) <=
    1e-7
      ? 'Critical'
      : state.froudeNumber <
        1
        ? 'Subcritical'
        : 'Supercritical'

  return {
    flowDepth,

    depthRatio:
      flowDepth /
      input.pipeDiameter,

    centralAngleDegrees:
      state.centralAngleRadians *
      180 /
      Math.PI,

    flowArea:
      state.flowArea,

    topWidth:
      state.topWidth,

    wettedPerimeter:
      state.wettedPerimeter,

    hydraulicRadius:
      state.hydraulicRadius,

    hydraulicDepth:
      state.hydraulicDepth,

    meanVelocity:
      state.meanVelocity,

    velocityHead:
      state.velocityHead,

    froudeNumber:
      state.froudeNumber,

    flowRegime,

    recoveredSpecificEnergy:
      state.specificEnergy,

    specificEnergyResidual:
      state.specificEnergy -
      input.specificEnergy,
  }
}


export function calculatePartiallyFullCircularChannelAlternateDepths(
  input:
    PartiallyFullCircularChannelAlternateDepthsInput,
): PartiallyFullCircularChannelAlternateDepthsResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelAlternateDepthsError(
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
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.specificEnergy,
    ) ||
    input.specificEnergy <=
      0
  ) {
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'INVALID_SPECIFIC_ENERGY',
      'Specific energy must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const critical =
    calculatePartiallyFullCircularChannelCriticalDepth({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      fluidDensity:
        input.fluidDensity,
    })

  const criticalDepth =
    critical.criticalDepth

  const criticalDepthRatio =
    critical.criticalDepthRatio

  const criticalSpecificEnergy =
    critical.criticalSpecificEnergy

  const energyTolerance =
    Math.max(
      1e-10,
      criticalSpecificEnergy *
      1e-9,
    )

  if (
    input.specificEnergy <
    criticalSpecificEnergy -
    energyTolerance
  ) {
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'SPECIFIC_ENERGY_BELOW_CRITICAL',
      'Requested specific energy is below the minimum specific energy for this circular-channel discharge.',
    )
  }

  const fullFlowArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

  const fullDepthVelocity =
    input.volumetricFlowRate /
    fullFlowArea

  const fullDepthLimitSpecificEnergy =
    input.pipeDiameter +
    fullDepthVelocity *
    fullDepthVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

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

  let solutionMultiplicity:
    string

  if (
    Math.abs(
      input.specificEnergy -
      criticalSpecificEnergy
    ) <=
    energyTolerance
  ) {
    shallowDepth =
      criticalDepth

    solutionMultiplicity =
      'Critical depth only'
  } else {
    shallowDepth =
      solveEnergyRoot(
        input,
        lowerDepth,
        criticalDepth,
      )

    const fullDepthEnergyTolerance =
      Math.max(
        1e-10,
        fullDepthLimitSpecificEnergy *
        1e-9,
      )

    if (
      input.specificEnergy <
      fullDepthLimitSpecificEnergy -
      fullDepthEnergyTolerance
    ) {
      deepDepth =
        solveEnergyRoot(
          input,
          criticalDepth,
          upperDepth,
        )

      solutionMultiplicity =
        'Two alternate depths'
    } else {
      solutionMultiplicity =
        'Single partial-depth solution'
    }
  }

  const shallowSolution =
    createSolution(
      input,
      shallowDepth,
    )

  const deepSolution =
    deepDepth ===
    null
      ? null
      : createSolution(
          input,
          deepDepth,
        )

  const energyExcessAboveCritical =
    input.specificEnergy -
    criticalSpecificEnergy

  const requestedEnergyToCriticalRatio =
    input.specificEnergy /
    criticalSpecificEnergy

  const requestedEnergyToFullDepthLimitRatio =
    input.specificEnergy /
    fullDepthLimitSpecificEnergy

  const alternateDepthSeparation =
    deepSolution
      ? (
          deepSolution.flowDepth -
          shallowSolution.flowDepth
        )
      : null

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    shallowSolution.flowDepth,

    shallowSolution.depthRatio,

    shallowSolution.flowArea,

    shallowSolution.topWidth,

    shallowSolution.wettedPerimeter,

    shallowSolution.hydraulicRadius,

    shallowSolution.hydraulicDepth,

    shallowSolution.meanVelocity,

    shallowSolution.velocityHead,

    shallowSolution.froudeNumber,

    shallowSolution.recoveredSpecificEnergy,

    criticalDepth,

    criticalDepthRatio,

    criticalSpecificEnergy,

    requestedEnergyToCriticalRatio,

    fullDepthLimitSpecificEnergy,

    requestedEnergyToFullDepthLimitRatio,

    massFlowRate,
  ]

  if (
    deepSolution
  ) {
    positiveValues.push(
      deepSolution.flowDepth,

      deepSolution.depthRatio,

      deepSolution.flowArea,

      deepSolution.topWidth,

      deepSolution.wettedPerimeter,

      deepSolution.hydraulicRadius,

      deepSolution.hydraulicDepth,

      deepSolution.meanVelocity,

      deepSolution.velocityHead,

      deepSolution.froudeNumber,

      deepSolution.recoveredSpecificEnergy,
    )
  }

  const finiteValues = [
    energyExcessAboveCritical,

    shallowSolution.specificEnergyResidual,

    deepSolution
      ? deepSolution.specificEnergyResidual
      : 0,

    alternateDepthSeparation
      ?? 0,
  ]

  const closureTolerance =
    Math.max(
      1e-9,
      input.specificEnergy *
      1e-8,
    )

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
    !finiteValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    shallowSolution.flowDepth >=
      input.pipeDiameter ||
    shallowSolution.flowDepth >
      criticalDepth +
      Math.max(
        1e-9,
        criticalDepth *
        1e-8,
      ) ||
    (
      deepSolution &&
      (
        deepSolution.flowDepth <=
        criticalDepth ||
        deepSolution.flowDepth >=
        input.pipeDiameter ||
        deepSolution.flowDepth <=
        shallowSolution.flowDepth
      )
    ) ||
    Math.abs(
      shallowSolution.specificEnergyResidual,
    ) >
      closureTolerance ||
    (
      deepSolution &&
      Math.abs(
        deepSolution.specificEnergyResidual,
      ) >
        closureTolerance
    ) ||
    (
      solutionMultiplicity ===
      'Two alternate depths' &&
      !deepSolution
    )
  ) {
    throw new PartiallyFullCircularChannelAlternateDepthsError(
      'NUMERICAL_FAILURE',
      'Circular-channel alternate-depth solution failed its energy, ordering or free-surface closure checks.',
    )
  }

  return {
    solutionMultiplicity,

    shallowSolution,

    deepSolution,

    criticalDepth,

    criticalDepthRatio,

    criticalSpecificEnergy,

    energyExcessAboveCritical,

    requestedEnergyToCriticalRatio,

    fullDepthLimitSpecificEnergy,

    requestedEnergyToFullDepthLimitRatio,

    alternateDepthSeparation,

    massFlowRate,

    modelName:
      'Alternate Depths from Specific Energy in a Partially Full Circular Channel',

    limitationDescription:
      'The solver finds free-surface circular-channel depths satisfying E = y + V²/(2g) at fixed discharge. For E above the critical minimum, a shallow supercritical solution always exists. A second deep subcritical solution exists only while that root remains below the conduit crown; pressure-flow states are excluded.',
  }
}


export function createPartiallyFullCircularChannelAlternateDepthsCsv(
  input:
    PartiallyFullCircularChannelAlternateDepthsInput,
  result:
    PartiallyFullCircularChannelAlternateDepthsResult,
): string {
  const rows = [
    [
      'Partially Full Circular Channel Alternate Depths from Specific Energy',
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
      'Summary',
      'Value',
      'Unit',
    ],
    [
      'Solution multiplicity',
      result.solutionMultiplicity,
      '-',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Energy excess above critical',
      result.energyExcessAboveCritical,
      'm',
    ],
    [
      'Full-depth limit specific energy',
      result.fullDepthLimitSpecificEnergy,
      'm',
    ],
    [
      'Alternate depth separation',
      result.alternateDepthSeparation ?? '',
      'm',
    ],
    [],
    [
      'Shallow Solution',
      'Value',
      'Unit',
    ],
    [
      'Flow depth',
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
      'Recovered specific energy',
      result.shallowSolution.recoveredSpecificEnergy,
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
        'Flow depth',
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
        'Recovered specific energy',
        result.deepSolution.recoveredSpecificEnergy,
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
