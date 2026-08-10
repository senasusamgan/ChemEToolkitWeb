import {
  calculateTrapezoidalChannelManningFlow,
} from '../trapezoidal-channel-manning-flow/engine.ts'

import type {
  TrapezoidalChannelNormalDepthInput,
  TrapezoidalChannelNormalDepthResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_NORMAL_DEPTH_ENGINE_VERSION =
  'trapezoidal-channel-normal-depth-v1'

export type TrapezoidalChannelNormalDepthErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_TARGET_FLOW'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_DENSITY'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelNormalDepthError
  extends Error {
  readonly code:
    TrapezoidalChannelNormalDepthErrorCode

  constructor(
    code:
      TrapezoidalChannelNormalDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelNormalDepthError'

    this.code =
      code
  }
}

function validateInput(
  input:
    TrapezoidalChannelNormalDepthInput,
): void {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.targetVolumetricFlowRate,
    ) ||
    input.targetVolumetricFlowRate <= 0
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'INVALID_TARGET_FLOW',
      'Target volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <= 0
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'INVALID_CHANNEL_SLOPE',
      'Channel energy slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <= 0
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }
}

function calculateAtDepth(
  input:
    TrapezoidalChannelNormalDepthInput,
  depth: number,
) {
  return calculateTrapezoidalChannelManningFlow({
    bottomWidth:
      input.bottomWidth,

    flowDepth:
      depth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    channelSlope:
      input.channelSlope,

    manningRoughness:
      input.manningRoughness,

    fluidDensity:
      input.fluidDensity,
  })
}

export function calculateTrapezoidalChannelNormalDepth(
  input:
    TrapezoidalChannelNormalDepthInput,
): TrapezoidalChannelNormalDepthResult {
  validateInput(
    input,
  )

  const target =
    input.targetVolumetricFlowRate

  const flowTolerance =
    Math.max(
      1e-12,
      target *
      1e-10,
    )

  let lowerDepth =
    1e-9

  let upperDepth =
    Math.max(
      1,
      input.bottomWidth,
    )

  let upperState =
    calculateAtDepth(
      input,
      upperDepth,
    )

  let bracketExpansions =
    0

  while (
    upperState.volumetricFlowRate <
    target
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
      throw new TrapezoidalChannelNormalDepthError(
        'BRACKETING_FAILURE',
        'Could not establish a finite upper depth that carries the target Manning flow.',
      )
    }

    upperState =
      calculateAtDepth(
        input,
        upperDepth,
      )
  }

  let solvedState =
    upperState

  let normalDepth =
    upperDepth

  let dischargeResidual =
    solvedState.volumetricFlowRate -
    target

  let solverIterations =
    0

  let converged =
    Math.abs(
      dischargeResidual,
    ) <=
    flowTolerance

  for (
    let iteration = 1;
    iteration <= 200 &&
    !converged;
    iteration += 1
  ) {
    solverIterations =
      iteration

    normalDepth =
      (
        lowerDepth +
        upperDepth
      ) /
      2

    solvedState =
      calculateAtDepth(
        input,
        normalDepth,
      )

    dischargeResidual =
      solvedState.volumetricFlowRate -
      target

    converged =
      Math.abs(
        dischargeResidual,
      ) <=
      flowTolerance

    if (
      converged
    ) {
      break
    }

    if (
      dischargeResidual <
      0
    ) {
      lowerDepth =
        normalDepth
    } else {
      upperDepth =
        normalDepth
    }
  }

  if (
    !converged
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'CONVERGENCE_FAILURE',
      'Normal-depth bisection did not converge within 200 iterations.',
    )
  }

  const relativeDischargeResidual =
    dischargeResidual /
    target

  const positiveValues = [
    normalDepth,

    solvedState.volumetricFlowRate,

    solvedState.volumetricFlowRateCubicMetersPerHour,

    solvedState.volumetricFlowRateLitersPerSecond,

    solvedState.massFlowRate,

    solvedState.flowArea,

    solvedState.wettedPerimeter,

    solvedState.hydraulicRadius,

    solvedState.topWidth,

    solvedState.hydraulicDepth,

    solvedState.meanVelocity,

    solvedState.froudeNumber,

    solvedState.boundaryShearStress,

    solvedState.velocityHead,

    solvedState.specificEnergy,
  ]

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      dischargeResidual,
    ) ||
    !Number.isFinite(
      relativeDischargeResidual,
    ) ||
    Math.abs(
      dischargeResidual,
    ) >
      flowTolerance
  ) {
    throw new TrapezoidalChannelNormalDepthError(
      'NUMERICAL_FAILURE',
      'The solved normal depth failed the target-discharge closure check.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    targetVolumetricFlowRate:
      input.targetVolumetricFlowRate,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    channelSlope:
      input.channelSlope,

    manningRoughness:
      input.manningRoughness,

    normalDepth,

    calculatedVolumetricFlowRate:
      solvedState.volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour:
      solvedState.volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond:
      solvedState.volumetricFlowRateLitersPerSecond,

    massFlowRate:
      solvedState.massFlowRate,

    flowArea:
      solvedState.flowArea,

    wettedPerimeter:
      solvedState.wettedPerimeter,

    hydraulicRadius:
      solvedState.hydraulicRadius,

    topWidth:
      solvedState.topWidth,

    hydraulicDepth:
      solvedState.hydraulicDepth,

    meanVelocity:
      solvedState.meanVelocity,

    froudeNumber:
      solvedState.froudeNumber,

    flowRegime:
      solvedState.flowRegime,

    boundaryShearStress:
      solvedState.boundaryShearStress,

    velocityHead:
      solvedState.velocityHead,

    specificEnergy:
      solvedState.specificEnergy,

    dischargeResidual,

    relativeDischargeResidual,

    solverIterations,

    modelName:
      'Trapezoidal Channel Normal Depth — Manning Inverse',

    limitationDescription:
      'The normal depth is solved numerically from the SI Manning equation for uniform steady flow in a prismatic trapezoidal channel. The supplied channel slope is treated as the energy slope. Backwater, rapidly varied flow, controls, transitions and spatially varying roughness are outside this model.',
  }
}

export function createTrapezoidalChannelNormalDepthCsv(
  input:
    TrapezoidalChannelNormalDepthInput,
  result:
    TrapezoidalChannelNormalDepthResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Normal Depth — Manning Inverse',
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
      'Target volumetric flow rate',
      input.targetVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Channel slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'Manning roughness',
      input.manningRoughness,
      's/m^(1/3)',
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
      'Normal depth',
      result.normalDepth,
      'm',
    ],
    [
      'Calculated volumetric flow rate',
      result.calculatedVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Flow area',
      result.flowArea,
      'm2',
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
      'Top width',
      result.topWidth,
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
      'Flow regime',
      result.flowRegime,
      '-',
    ],
    [
      'Boundary shear stress',
      result.boundaryShearStress,
      'Pa',
    ],
    [
      'Specific energy',
      result.specificEnergy,
      'm',
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
