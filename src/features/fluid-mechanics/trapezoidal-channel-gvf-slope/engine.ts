import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalChannelGvfSlopeInput,
  TrapezoidalChannelGvfSlopeResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_GVF_SLOPE_ENGINE_VERSION =
  'trapezoidal-channel-gvf-slope-v1'

export type TrapezoidalChannelGvfSlopeErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_FLOW_DEPTH'
  | 'INVALID_DENSITY'
  | 'NORMAL_DEPTH_FAILURE'
  | 'AT_CRITICAL_DEPTH'
  | 'AT_NORMAL_DEPTH'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelGvfSlopeError
  extends Error {
  readonly code:
    TrapezoidalChannelGvfSlopeErrorCode

  constructor(
    code:
      TrapezoidalChannelGvfSlopeErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelGvfSlopeError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface SectionState {
  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  meanVelocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number
}

function sectionState(
  input:
    TrapezoidalChannelGvfSlopeInput,
  depth: number,
): SectionState {
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

  const meanVelocity =
    input.volumetricFlowRate /
    flowArea

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const specificEnergy =
    depth +
    (
      meanVelocity *
      meanVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const frictionSlope =
    (
      input.volumetricFlowRate *
      input.manningRoughness /
      (
        flowArea *
        hydraulicRadius **
          (
            2 / 3
          )
      )
    ) **
    2

  return {
    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    froudeNumber,

    specificEnergy,

    frictionSlope,
  }
}

function manningFlowAtDepth(
  input:
    TrapezoidalChannelGvfSlopeInput,
  depth: number,
): number {
  const state =
    sectionState(
      input,
      depth,
    )

  return (
    1 /
    input.manningRoughness
  ) *
  state.flowArea *
  state.hydraulicRadius **
    (
      2 / 3
    ) *
  Math.sqrt(
    input.channelSlope,
  )
}

function solveNormalDepth(
  input:
    TrapezoidalChannelGvfSlopeInput,
): {
  normalDepth: number
  iterations: number
} {
  let lower =
    1e-10

  let upper =
    Math.max(
      1,
      input.flowDepth,
    )

  let upperFlow =
    manningFlowAtDepth(
      input,
      upper,
    )

  let expansions =
    0

  while (
    upperFlow <
    input.volumetricFlowRate
  ) {
    upper *=
      2

    expansions +=
      1

    if (
      expansions >
      100 ||
      !Number.isFinite(
        upper,
      ) ||
      upper >
      1e12
    ) {
      throw new TrapezoidalChannelGvfSlopeError(
        'NORMAL_DEPTH_FAILURE',
        'Could not bracket the Manning normal depth.',
      )
    }

    upperFlow =
      manningFlowAtDepth(
        input,
        upper,
      )
  }

  const flowTolerance =
    Math.max(
      1e-12,
      input.volumetricFlowRate *
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

    const flow =
      manningFlowAtDepth(
        input,
        depth,
      )

    const residual =
      flow -
      input.volumetricFlowRate

    if (
      Math.abs(
        residual,
      ) <=
      flowTolerance
    ) {
      return {
        normalDepth:
          depth,

        iterations:
          iteration,
      }
    }

    if (
      residual <
      0
    ) {
      lower =
        depth
    } else {
      upper =
        depth
    }
  }

  throw new TrapezoidalChannelGvfSlopeError(
    'NORMAL_DEPTH_FAILURE',
    'Manning normal-depth solver did not converge within 200 iterations.',
  )
}

function classifyProfile(
  depth: number,
  normalDepth: number,
  criticalDepth: number,
  channelSlopeClass: string,
): string {
  if (
    channelSlopeClass ===
    'mild'
  ) {
    if (
      depth >
      normalDepth
    ) {
      return 'M1'
    }

    if (
      depth >
      criticalDepth
    ) {
      return 'M2'
    }

    return 'M3'
  }

  if (
    channelSlopeClass ===
    'steep'
  ) {
    if (
      depth >
      criticalDepth
    ) {
      return 'S1'
    }

    if (
      depth >
      normalDepth
    ) {
      return 'S2'
    }

    return 'S3'
  }

  if (
    depth >
    criticalDepth
  ) {
    return 'C1'
  }

  return 'C3'
}

export function calculateTrapezoidalChannelGvfSlope(
  input:
    TrapezoidalChannelGvfSlopeInput,
): TrapezoidalChannelGvfSlopeResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
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
    throw new TrapezoidalChannelGvfSlopeError(
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
    throw new TrapezoidalChannelGvfSlopeError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <= 0
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <= 0
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.flowDepth,
    ) ||
    input.flowDepth <= 0
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'INVALID_FLOW_DEPTH',
      'Flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const state =
    sectionState(
      input,
      input.flowDepth,
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

  const criticalDepth =
    critical.criticalDepth

  const normal =
    solveNormalDepth(
      input,
    )

  const normalDepth =
    normal.normalDepth

  const depthScale =
    Math.max(
      input.flowDepth,
      criticalDepth,
      normalDepth,
    )

  const depthTolerance =
    Math.max(
      1e-10,
      depthScale *
      1e-8,
    )

  if (
    Math.abs(
      input.flowDepth -
      criticalDepth,
    ) <=
    depthTolerance
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'AT_CRITICAL_DEPTH',
      'The GVF differential equation becomes singular at critical depth.',
    )
  }

  if (
    Math.abs(
      input.flowDepth -
      normalDepth,
    ) <=
    depthTolerance
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'AT_NORMAL_DEPTH',
      'At normal depth the local GVF depth gradient approaches zero; use the normal-depth result directly.',
    )
  }

  const channelSlopeClass =
    Math.abs(
      normalDepth -
      criticalDepth,
    ) <=
    depthTolerance
      ? 'critical'
      : normalDepth >
        criticalDepth
        ? 'mild'
        : 'steep'

  const profileClassification =
    classifyProfile(
      input.flowDepth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  const flowRegime =
    state.froudeNumber <
    1
      ? 'subcritical'
      : 'supercritical'

  const froudeDenominator =
    1 -
    state.froudeNumber *
    state.froudeNumber

  const energyGradient =
    input.channelSlope -
    state.frictionSlope

  const depthGradient =
    energyGradient /
    froudeDenominator

  const waterSurfaceElevationGradient =
    depthGradient -
    input.channelSlope

  const energyGradeLineGradient =
    -state.frictionSlope

  const depthChangePer100m =
    depthGradient *
    100

  const waterSurfaceElevationChangePer100m =
    waterSurfaceElevationGradient *
    100

  const bedElevationChangePer100m =
    -input.channelSlope *
    100

  const frictionHeadLossPer100m =
    state.frictionSlope *
    100

  const energyGradeLineChangePer100m =
    energyGradeLineGradient *
    100

  const differentialEquationResidual =
    (
      froudeDenominator *
      depthGradient
    ) -
    energyGradient

  const boundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    state.hydraulicRadius *
    state.frictionSlope

  const hydraulicPowerDissipationPerLength =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    state.frictionSlope

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    state.flowArea,

    state.topWidth,

    state.wettedPerimeter,

    state.hydraulicRadius,

    state.hydraulicDepth,

    state.meanVelocity,

    state.froudeNumber,

    state.specificEnergy,

    state.frictionSlope,

    criticalDepth,

    normalDepth,

    boundaryShearStress,

    hydraulicPowerDissipationPerLength,

    massFlowRate,
  ]

  const closureTolerance =
    Math.max(
      1e-14,
      Math.abs(
        energyGradient,
      ) *
      1e-10,
    )

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      froudeDenominator,
    ) ||
    Math.abs(
      froudeDenominator,
    ) <=
      1e-10 ||
    !Number.isFinite(
      energyGradient,
    ) ||
    !Number.isFinite(
      depthGradient,
    ) ||
    !Number.isFinite(
      waterSurfaceElevationGradient,
    ) ||
    !Number.isFinite(
      energyGradeLineGradient,
    ) ||
    !Number.isFinite(
      differentialEquationResidual,
    ) ||
    Math.abs(
      differentialEquationResidual,
    ) >
      closureTolerance
  ) {
    throw new TrapezoidalChannelGvfSlopeError(
      'NUMERICAL_FAILURE',
      'The GVF differential calculation failed its geometry, criticality or equation-closure checks.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    flowDepth:
      input.flowDepth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    volumetricFlowRate:
      input.volumetricFlowRate,

    manningRoughness:
      input.manningRoughness,

    channelSlope:
      input.channelSlope,

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

    froudeNumber:
      state.froudeNumber,

    flowRegime,

    specificEnergy:
      state.specificEnergy,

    frictionSlope:
      state.frictionSlope,

    criticalDepth,

    normalDepth,

    channelSlopeClass,

    profileClassification,

    froudeDenominator,

    energyGradient,

    depthGradient,

    waterSurfaceElevationGradient,

    energyGradeLineGradient,

    depthChangePer100m,

    waterSurfaceElevationChangePer100m,

    bedElevationChangePer100m,

    frictionHeadLossPer100m,

    energyGradeLineChangePer100m,

    differentialEquationResidual,

    boundaryShearStress,

    hydraulicPowerDissipationPerLength,

    massFlowRate,

    normalDepthSolverIterations:
      normal.iterations,

    modelName:
      'Trapezoidal Channel GVF Differential Slope',

    limitationDescription:
      'Local one-dimensional gradually varied flow analysis using Manning friction and dy/dx = (S0 − Sf)/(1 − Fr²). The result is a local differential slope rather than a finite-reach integration. The equation becomes singular near critical depth and approaches zero depth gradient near normal depth. Rapid transitions, hydraulic jumps, lateral inflow and spatially varying section geometry are excluded.',
  }
}

export function createTrapezoidalChannelGvfSlopeCsv(
  input:
    TrapezoidalChannelGvfSlopeInput,
  result:
    TrapezoidalChannelGvfSlopeResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel GVF Differential Slope',
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
      'Manning roughness',
      input.manningRoughness,
      's/m^(1/3)',
    ],
    [
      'Channel slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'Local flow depth',
      input.flowDepth,
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
      'Flow area',
      result.flowArea,
      'm2',
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
      'Mean velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Froude number',
      result.froudeNumber,
      '-',
    ],
    [
      'Specific energy',
      result.specificEnergy,
      'm',
    ],
    [
      'Friction slope',
      result.frictionSlope,
      'm/m',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Normal depth',
      result.normalDepth,
      'm',
    ],
    [
      'Channel slope class',
      result.channelSlopeClass,
      '-',
    ],
    [
      'GVF profile classification',
      result.profileClassification,
      '-',
    ],
    [
      '1 minus Froude number squared',
      result.froudeDenominator,
      '-',
    ],
    [
      'Specific-energy gradient',
      result.energyGradient,
      'm/m',
    ],
    [
      'Depth gradient dy/dx',
      result.depthGradient,
      'm/m',
    ],
    [
      'Water-surface elevation gradient',
      result.waterSurfaceElevationGradient,
      'm/m',
    ],
    [
      'Energy-grade-line gradient',
      result.energyGradeLineGradient,
      'm/m',
    ],
    [
      'Depth change per 100 m',
      result.depthChangePer100m,
      'm/100m',
    ],
    [
      'Water-surface elevation change per 100 m',
      result.waterSurfaceElevationChangePer100m,
      'm/100m',
    ],
    [
      'Bed elevation change per 100 m',
      result.bedElevationChangePer100m,
      'm/100m',
    ],
    [
      'Friction head loss per 100 m',
      result.frictionHeadLossPer100m,
      'm/100m',
    ],
    [
      'Energy-grade-line change per 100 m',
      result.energyGradeLineChangePer100m,
      'm/100m',
    ],
    [
      'Differential equation residual',
      result.differentialEquationResidual,
      'm/m',
    ],
    [
      'Boundary shear stress',
      result.boundaryShearStress,
      'Pa',
    ],
    [
      'Hydraulic power dissipation per length',
      result.hydraulicPowerDissipationPerLength,
      'W/m',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Normal-depth solver iterations',
      result.normalDepthSolverIterations,
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
