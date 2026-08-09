import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
} from '../npsh-available-cavitation-margin/engine.ts'

import type {
  NpshAvailableCavitationMarginInput,
} from '../npsh-available-cavitation-margin/types.ts'

import type {
  MaximumSuctionFlowRateNpshMarginInput,
  MaximumSuctionFlowRateNpshMarginResult,
} from './types.ts'

export {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
}

export const MAXIMUM_SUCTION_FLOW_RATE_NPSH_MARGIN_ENGINE_VERSION =
  'maximum-suction-flow-rate-npsh-margin-v1'

export type MaximumSuctionFlowRateNpshMarginErrorCode =
  | 'INVALID_TARGET_NPSH_MARGIN'
  | 'TARGET_NOT_ACHIEVABLE'
  | 'FLOW_SEARCH_CEILING_REACHED'
  | 'NUMERICAL_FAILURE'

export class MaximumSuctionFlowRateNpshMarginError
  extends Error {
  readonly code:
    MaximumSuctionFlowRateNpshMarginErrorCode

  constructor(
    code:
      MaximumSuctionFlowRateNpshMarginErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MaximumSuctionFlowRateNpshMarginError'

    this.code =
      code
  }
}

const MINIMUM_FLOW_RATE =
  1e-12

const MAXIMUM_FLOW_RATE =
  1000

const BISECTION_ITERATIONS =
  100

function createNpshInput(
  input:
    MaximumSuctionFlowRateNpshMarginInput,
  volumetricFlowRate: number,
): NpshAvailableCavitationMarginInput {
  return {
    suctionPipeDiameter:
      input.suctionPipeDiameter,

    volumetricFlowRate,

    suctionPipeLength:
      input.suctionPipeLength,

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
    MaximumSuctionFlowRateNpshMarginInput,
  volumetricFlowRate: number,
) {
  return calculateNpshAvailableCavitationMargin(
    createNpshInput(
      input,
      volumetricFlowRate,
    ),
  )
}

export function calculateMaximumSuctionFlowRateNpshMargin(
  input:
    MaximumSuctionFlowRateNpshMarginInput,
): MaximumSuctionFlowRateNpshMarginResult {
  if (
    !Number.isFinite(
      input.targetNpshMargin,
    ) ||
    input.targetNpshMargin < 0
  ) {
    throw new MaximumSuctionFlowRateNpshMarginError(
      'INVALID_TARGET_NPSH_MARGIN',
      'Target NPSH margin must be a non-negative finite value.',
    )
  }

  const nearZeroFlowState =
    evaluate(
      input,
      MINIMUM_FLOW_RATE,
    )

  const zeroFlowNpshMargin =
    nearZeroFlowState.npshMargin

  if (
    zeroFlowNpshMargin <
    input.targetNpshMargin
  ) {
    throw new MaximumSuctionFlowRateNpshMarginError(
      'TARGET_NOT_ACHIEVABLE',
      'The requested NPSH margin cannot be achieved even as suction flow approaches zero.',
    )
  }

  const maximumFlowState =
    evaluate(
      input,
      MAXIMUM_FLOW_RATE,
    )

  if (
    maximumFlowState.npshMargin >=
    input.targetNpshMargin
  ) {
    throw new MaximumSuctionFlowRateNpshMarginError(
      'FLOW_SEARCH_CEILING_REACHED',
      'The requested margin remains satisfied at the maximum supported search flow.',
    )
  }

  let lowerFlow =
    MINIMUM_FLOW_RATE

  let upperFlow =
    MAXIMUM_FLOW_RATE

  for (
    let iteration = 0;
    iteration <
      BISECTION_ITERATIONS;
    iteration += 1
  ) {
    const midpoint =
      (
        lowerFlow +
        upperFlow
      ) /
      2

    const candidate =
      evaluate(
        input,
        midpoint,
      )

    if (
      candidate.npshMargin >=
      input.targetNpshMargin
    ) {
      lowerFlow =
        midpoint
    } else {
      upperFlow =
        midpoint
    }
  }

  const maximumVolumetricFlowRate =
    lowerFlow

  const solved =
    evaluate(
      input,
      maximumVolumetricFlowRate,
    )

  const maximumVolumetricFlowRateCubicMetersPerHour =
    maximumVolumetricFlowRate *
    3600

  const maximumVolumetricFlowRateLitersPerSecond =
    maximumVolumetricFlowRate *
    1000

  const maximumMassFlowRate =
    maximumVolumetricFlowRate *
    input.fluidDensity

  const marginResidual =
    solved.npshMargin -
    input.targetNpshMargin

  const values = [
    maximumVolumetricFlowRate,

    maximumVolumetricFlowRateCubicMetersPerHour,

    maximumVolumetricFlowRateLitersPerSecond,

    maximumMassFlowRate,

    zeroFlowNpshMargin,

    marginResidual,

    solved.npshMargin,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    maximumVolumetricFlowRate <= 0 ||
    solved.npshMargin <
      input.targetNpshMargin ||
    Math.abs(
      marginResidual,
    ) >
      1e-8
  ) {
    throw new MaximumSuctionFlowRateNpshMarginError(
      'NUMERICAL_FAILURE',
      'Maximum suction-flow solution failed the NPSH-margin closure check.',
    )
  }

  return {
    ...solved,

    maximumVolumetricFlowRate,

    maximumVolumetricFlowRateCubicMetersPerHour,

    maximumVolumetricFlowRateLitersPerSecond,

    maximumMassFlowRate,

    targetNpshMargin:
      input.targetNpshMargin,

    zeroFlowNpshMargin,

    marginResidual,

    iterationCount:
      BISECTION_ITERATIONS,

    modelName:
      'Maximum Suction Flow Rate for Required NPSH Margin',

    limitationDescription:
      'Inverse-design wrapper around Calculator 405. Pump, fluid, vessel pressure, static liquid level and suction-line geometry remain fixed while volumetric flow rate is increased to the maximum value that satisfies the specified NPSHa minus NPSHr margin.',
  }
}

export function createMaximumSuctionFlowRateNpshMarginCsv(
  input:
    MaximumSuctionFlowRateNpshMarginInput,
  result:
    MaximumSuctionFlowRateNpshMarginResult,
): string {
  const rows = [
    [
      'Maximum Suction Flow Rate for Required NPSH Margin',
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
      'Suction pipe length',
      input.suctionPipeLength,
      'm',
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
      'Maximum volumetric flow rate',
      result.maximumVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Maximum volumetric flow rate',
      result.maximumVolumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Maximum volumetric flow rate',
      result.maximumVolumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Maximum mass flow rate',
      result.maximumMassFlowRate,
      'kg/s',
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
      'Zero-flow NPSH margin',
      result.zeroFlowNpshMargin,
      'm',
    ],
    [
      'Suction-line head loss',
      result.suctionLineHeadLoss,
      'm',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
