import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
} from '../npsh-available-cavitation-margin/engine.ts'

import type {
  MinimumSuctionPipeDiameterNpshMarginInput,
  MinimumSuctionPipeDiameterNpshMarginResult,
} from './types.ts'

export {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
}

export const MINIMUM_SUCTION_PIPE_DIAMETER_NPSH_MARGIN_ENGINE_VERSION =
  'minimum-suction-pipe-diameter-npsh-margin-v1'

export type MinimumSuctionPipeDiameterNpshMarginErrorCode =
  | 'INVALID_TARGET_NPSH_MARGIN'
  | 'TARGET_BELOW_DIAMETER_SEARCH_FLOOR'
  | 'TARGET_NOT_ACHIEVABLE'
  | 'NUMERICAL_FAILURE'

export class MinimumSuctionPipeDiameterNpshMarginError
  extends Error {
  readonly code:
    MinimumSuctionPipeDiameterNpshMarginErrorCode

  constructor(
    code:
      MinimumSuctionPipeDiameterNpshMarginErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MinimumSuctionPipeDiameterNpshMarginError'

    this.code =
      code
  }
}

const MINIMUM_DIAMETER =
  0.005

const MAXIMUM_DIAMETER =
  5

const BISECTION_ITERATIONS =
  100

function evaluate(
  input:
    MinimumSuctionPipeDiameterNpshMarginInput,
  suctionPipeDiameter: number,
) {
  return calculateNpshAvailableCavitationMargin({
    ...input,

    suctionPipeDiameter,
  })
}

export function calculateMinimumSuctionPipeDiameterNpshMargin(
  input:
    MinimumSuctionPipeDiameterNpshMarginInput,
): MinimumSuctionPipeDiameterNpshMarginResult {
  if (
    !Number.isFinite(
      input.targetNpshMargin,
    ) ||
    input.targetNpshMargin < 0
  ) {
    throw new MinimumSuctionPipeDiameterNpshMarginError(
      'INVALID_TARGET_NPSH_MARGIN',
      'Target NPSH margin must be a non-negative finite value.',
    )
  }

  /*
   Calculator 405 remains the source of truth.

   Increasing suction diameter reduces suction
   velocity and suction-line head loss, thereby
   increasing NPSHa and the NPSH margin.
  */

  const minimumDiameterState =
    evaluate(
      input,
      MINIMUM_DIAMETER,
    )

  const maximumDiameterState =
    evaluate(
      input,
      MAXIMUM_DIAMETER,
    )

  if (
    minimumDiameterState.npshMargin >=
    input.targetNpshMargin
  ) {
    throw new MinimumSuctionPipeDiameterNpshMarginError(
      'TARGET_BELOW_DIAMETER_SEARCH_FLOOR',
      'The requested NPSH margin is already satisfied at the minimum supported suction-pipe diameter of 5 mm.',
    )
  }

  if (
    maximumDiameterState.npshMargin <
    input.targetNpshMargin
  ) {
    throw new MinimumSuctionPipeDiameterNpshMarginError(
      'TARGET_NOT_ACHIEVABLE',
      `The target NPSH margin of ${input.targetNpshMargin} m cannot be reached within the supported suction-pipe diameter range. Maximum modeled margin is ${maximumDiameterState.npshMargin} m.`,
    )
  }

  let lowerDiameter =
    MINIMUM_DIAMETER

  let upperDiameter =
    MAXIMUM_DIAMETER

  for (
    let iteration = 0;
    iteration <
      BISECTION_ITERATIONS;
    iteration += 1
  ) {
    const midpoint =
      (
        lowerDiameter +
        upperDiameter
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
      upperDiameter =
        midpoint
    } else {
      lowerDiameter =
        midpoint
    }
  }

  const requiredSuctionPipeDiameter =
    upperDiameter

  const solved =
    evaluate(
      input,
      requiredSuctionPipeDiameter,
    )

  const requiredSuctionPipeDiameterMillimeters =
    requiredSuctionPipeDiameter *
    1000

  const requiredSuctionPipeDiameterInches =
    requiredSuctionPipeDiameter /
    0.0254

  const marginResidual =
    solved.npshMargin -
    input.targetNpshMargin

  const values = [
    requiredSuctionPipeDiameter,
    requiredSuctionPipeDiameterMillimeters,
    requiredSuctionPipeDiameterInches,

    marginResidual,

    solved.npshMargin,
    solved.availableNpsh,

    maximumDiameterState.npshMargin,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    requiredSuctionPipeDiameter <= 0 ||
    solved.npshMargin <
      input.targetNpshMargin ||
    Math.abs(
      marginResidual,
    ) >
      1e-8
  ) {
    throw new MinimumSuctionPipeDiameterNpshMarginError(
      'NUMERICAL_FAILURE',
      'The suction-pipe diameter solver did not converge to the requested NPSH margin.',
    )
  }

  return {
    ...solved,

    requiredSuctionPipeDiameter,

    requiredSuctionPipeDiameterMillimeters,

    requiredSuctionPipeDiameterInches,

    targetNpshMargin:
      input.targetNpshMargin,

    marginResidual,

    maximumAchievableNpshMargin:
      maximumDiameterState.npshMargin,

    iterationCount:
      BISECTION_ITERATIONS,

    modelName:
      'Minimum Suction Pipe Diameter for Required NPSH Margin',

    limitationDescription:
      'Inverse-design wrapper around Calculator 405. Suction-pipe diameter is varied while pump, fluid, vessel pressure, vapor pressure, suction length and loss coefficients remain fixed. The minimum modeled diameter satisfying the requested NPSHa minus NPSHr margin is returned.',
  }
}

export function createMinimumSuctionPipeDiameterNpshMarginCsv(
  input:
    MinimumSuctionPipeDiameterNpshMarginInput,
  result:
    MinimumSuctionPipeDiameterNpshMarginResult,
): string {
  const rows = [
    [
      'Minimum Suction Pipe Diameter for Required NPSH Margin',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
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
      'Required suction-pipe diameter',
      result.requiredSuctionPipeDiameter,
      'm',
    ],
    [
      'Required suction-pipe diameter',
      result.requiredSuctionPipeDiameterMillimeters,
      'mm',
    ],
    [
      'Required suction-pipe diameter',
      result.requiredSuctionPipeDiameterInches,
      'in',
    ],
    [
      'NPSH available',
      result.availableNpsh,
      'm',
    ],
    [
      'NPSH required',
      result.requiredNpsh,
      'm',
    ],
    [
      'Achieved NPSH margin',
      result.npshMargin,
      'm',
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
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
