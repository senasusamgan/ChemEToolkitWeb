import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
} from '../npsh-available-cavitation-margin/engine.ts'

import type {
  NpshAvailableCavitationMarginInput,
} from '../npsh-available-cavitation-margin/types.ts'

import type {
  MaximumSuctionLineLengthNpshMarginInput,
  MaximumSuctionLineLengthNpshMarginResult,
} from './types.ts'

export {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
}

export const MAXIMUM_SUCTION_LINE_LENGTH_NPSH_MARGIN_ENGINE_VERSION =
  'maximum-suction-line-length-npsh-margin-v1'

export type MaximumSuctionLineLengthNpshMarginErrorCode =
  | 'INVALID_TARGET_NPSH_MARGIN'
  | 'TARGET_NOT_ACHIEVABLE'
  | 'INVALID_LENGTH_SENSITIVITY'
  | 'NUMERICAL_FAILURE'

export class MaximumSuctionLineLengthNpshMarginError
  extends Error {
  readonly code:
    MaximumSuctionLineLengthNpshMarginErrorCode

  constructor(
    code:
      MaximumSuctionLineLengthNpshMarginErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MaximumSuctionLineLengthNpshMarginError'

    this.code =
      code
  }
}

const REFERENCE_LENGTH_ONE =
  1

const REFERENCE_LENGTH_TWO =
  2

function createNpshInput(
  input:
    MaximumSuctionLineLengthNpshMarginInput,
  suctionPipeLength: number,
): NpshAvailableCavitationMarginInput {
  return {
    suctionPipeDiameter:
      input.suctionPipeDiameter,

    volumetricFlowRate:
      input.volumetricFlowRate,

    suctionPipeLength,

    fluidDensity:
      input.fluidDensity,

    dynamicViscosity:
      input.dynamicViscosity,

    absoluteRoughness:
      input.absoluteRoughness,

    suctionMinorLossCoefficient:
      input.suctionMinorLossCoefficient,

    liquidSurfaceAbsolutePressure:
      input.liquidSurfaceAbsolutePressure,

    vaporPressure:
      input.vaporPressure,

    staticLiquidLevelAbovePump:
      input.staticLiquidLevelAbovePump,

    requiredNpsh:
      input.requiredNpsh,
  }
}

function evaluate(
  input:
    MaximumSuctionLineLengthNpshMarginInput,
  suctionPipeLength: number,
) {
  return calculateNpshAvailableCavitationMargin(
    createNpshInput(
      input,
      suctionPipeLength,
    ),
  )
}

export function calculateMaximumSuctionLineLengthNpshMargin(
  input:
    MaximumSuctionLineLengthNpshMarginInput,
): MaximumSuctionLineLengthNpshMarginResult {
  if (
    !Number.isFinite(
      input.targetNpshMargin,
    ) ||
    input.targetNpshMargin < 0
  ) {
    throw new MaximumSuctionLineLengthNpshMarginError(
      'INVALID_TARGET_NPSH_MARGIN',
      'Target NPSH margin must be a non-negative finite value.',
    )
  }

  const stateAtOneMeter =
    evaluate(
      input,
      REFERENCE_LENGTH_ONE,
    )

  const stateAtTwoMeters =
    evaluate(
      input,
      REFERENCE_LENGTH_TWO,
    )

  /*
   At fixed Q and D, the distributed Darcy
   friction loss grows linearly with length.

   Minor losses remain unchanged because ΣK,
   velocity and density remain unchanged.
  */

  const marginLossPerUnitLength =
    stateAtOneMeter.npshMargin -
    stateAtTwoMeters.npshMargin

  const distributedHeadLossPerUnitLength =
    stateAtTwoMeters.suctionLineHeadLoss -
    stateAtOneMeter.suctionLineHeadLoss

  if (
    !Number.isFinite(
      marginLossPerUnitLength,
    ) ||
    marginLossPerUnitLength <= 0 ||
    !Number.isFinite(
      distributedHeadLossPerUnitLength,
    ) ||
    distributedHeadLossPerUnitLength <= 0
  ) {
    throw new MaximumSuctionLineLengthNpshMarginError(
      'INVALID_LENGTH_SENSITIVITY',
      'The suction-line hydraulic model did not produce a positive distributed head-loss sensitivity to pipe length.',
    )
  }

  const zeroLengthNpshMargin =
    stateAtOneMeter.npshMargin +
    marginLossPerUnitLength

  if (
    zeroLengthNpshMargin <=
    input.targetNpshMargin
  ) {
    throw new MaximumSuctionLineLengthNpshMarginError(
      'TARGET_NOT_ACHIEVABLE',
      'The requested NPSH margin leaves no positive allowable suction-line length under the specified operating conditions.',
    )
  }

  const maximumSuctionPipeLength =
    (
      zeroLengthNpshMargin -
      input.targetNpshMargin
    ) /
    marginLossPerUnitLength

  if (
    !Number.isFinite(
      maximumSuctionPipeLength,
    ) ||
    maximumSuctionPipeLength <= 0
  ) {
    throw new MaximumSuctionLineLengthNpshMarginError(
      'NUMERICAL_FAILURE',
      'The calculated maximum suction-line length is not positive and finite.',
    )
  }

  /*
   Verify the explicit inverse solution
   through Calculator 405 itself.
  */

  const solved =
    evaluate(
      input,
      maximumSuctionPipeLength,
    )

  const marginResidual =
    solved.npshMargin -
    input.targetNpshMargin

  const values = [
    maximumSuctionPipeLength,

    zeroLengthNpshMargin,

    distributedHeadLossPerUnitLength,

    marginLossPerUnitLength,

    marginResidual,

    solved.availableNpsh,

    solved.npshMargin,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    solved.npshMargin <
      input.targetNpshMargin -
        1e-8 ||
    Math.abs(
      marginResidual,
    ) >
      1e-8
  ) {
    throw new MaximumSuctionLineLengthNpshMarginError(
      'NUMERICAL_FAILURE',
      'The solved suction-line length failed the NPSH-margin closure check.',
    )
  }

  return {
    ...solved,

    maximumSuctionPipeLength,

    targetNpshMargin:
      input.targetNpshMargin,

    zeroLengthNpshMargin,

    distributedHeadLossPerUnitLength,

    marginLossPerUnitLength,

    marginResidual,

    modelName:
      'Maximum Suction-Line Length for Required NPSH Margin',

    limitationDescription:
      'Inverse-design wrapper around Calculator 405. Flow rate, suction diameter, fluid properties, vessel pressure, static level and minor-loss coefficient remain fixed. Because velocity, Reynolds number and Darcy friction factor remain constant, distributed suction-line loss is linear with pipe length and the maximum allowable length is solved explicitly.',
  }
}

export function createMaximumSuctionLineLengthNpshMarginCsv(
  input:
    MaximumSuctionLineLengthNpshMarginInput,
  result:
    MaximumSuctionLineLengthNpshMarginResult,
): string {
  const rows = [
    [
      'Maximum Suction-Line Length for Required NPSH Margin',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Suction pipe diameter',
      input.suctionPipeDiameter,
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
    [
      'Dynamic viscosity',
      input.dynamicViscosity,
      'Pa s',
    ],
    [
      'Absolute roughness',
      input.absoluteRoughness,
      'm',
    ],
    [
      'Suction minor-loss coefficient',
      input.suctionMinorLossCoefficient,
      '-',
    ],
    [
      'Liquid-surface absolute pressure',
      input.liquidSurfaceAbsolutePressure,
      'Pa abs',
    ],
    [
      'Vapor pressure',
      input.vaporPressure,
      'Pa abs',
    ],
    [
      'Static liquid level above pump',
      input.staticLiquidLevelAbovePump,
      'm',
    ],
    [
      'Required NPSH',
      input.requiredNpsh,
      'm',
    ],
    [
      'Target NPSH margin',
      input.targetNpshMargin,
      'm',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Maximum suction-line length',
      result.maximumSuctionPipeLength,
      'm',
    ],
    [
      'NPSH available',
      result.availableNpsh,
      'm',
    ],
    [
      'Required NPSH',
      result.requiredNpsh,
      'm',
    ],
    [
      'Achieved NPSH margin',
      result.npshMargin,
      'm',
    ],
    [
      'Zero-length NPSH margin',
      result.zeroLengthNpshMargin,
      'm',
    ],
    [
      'Distributed head loss per unit length',
      result.distributedHeadLossPerUnitLength,
      'm/m',
    ],
    [
      'Suction-line head loss',
      result.suctionLineHeadLoss,
      'm',
    ],
    [
      'Suction velocity',
      result.velocity,
      'm/s',
    ],
    [
      'Reynolds number',
      result.reynoldsNumber,
      '-',
    ],
    [
      'Darcy friction factor',
      result.frictionFactor,
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
