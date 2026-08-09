import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
} from '../npsh-available-cavitation-margin/engine.ts'

import type {
  NpshAvailableCavitationMarginInput,
} from '../npsh-available-cavitation-margin/types.ts'

import type {
  RequiredStaticLiquidLevelNpshMarginInput,
  RequiredStaticLiquidLevelNpshMarginResult,
  RequiredSuctionConfiguration,
} from './types.ts'

export {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
}

export const REQUIRED_STATIC_LIQUID_LEVEL_NPSH_MARGIN_ENGINE_VERSION =
  'required-static-liquid-level-npsh-margin-v1'

export type RequiredStaticLiquidLevelNpshMarginErrorCode =
  | 'INVALID_TARGET_NPSH_MARGIN'
  | 'NUMERICAL_FAILURE'

export class RequiredStaticLiquidLevelNpshMarginError
  extends Error {
  readonly code:
    RequiredStaticLiquidLevelNpshMarginErrorCode

  constructor(
    code:
      RequiredStaticLiquidLevelNpshMarginErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'RequiredStaticLiquidLevelNpshMarginError'

    this.code =
      code
  }
}

function createNpshInput(
  input:
    RequiredStaticLiquidLevelNpshMarginInput,
  staticLiquidLevelAbovePump: number,
): NpshAvailableCavitationMarginInput {
  return {
    suctionPipeDiameter:
      input.suctionPipeDiameter,

    volumetricFlowRate:
      input.volumetricFlowRate,

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

    staticLiquidLevelAbovePump,

    requiredNpsh:
      input.requiredNpsh,
  }
}

export function calculateRequiredStaticLiquidLevelNpshMargin(
  input:
    RequiredStaticLiquidLevelNpshMarginInput,
): RequiredStaticLiquidLevelNpshMarginResult {
  if (
    !Number.isFinite(
      input.targetNpshMargin,
    ) ||
    input.targetNpshMargin < 0
  ) {
    throw new RequiredStaticLiquidLevelNpshMarginError(
      'INVALID_TARGET_NPSH_MARGIN',
      'Target NPSH margin must be a non-negative finite value.',
    )
  }

  /*
   Use Calculator 405 at pump centerline.

   z = 0 gives the NPSH margin created only by:
   - absolute surface pressure
   - vapor pressure
   - suction-line losses
   - NPSHr
  */

  const zeroLevelState =
    calculateNpshAvailableCavitationMargin(
      createNpshInput(
        input,
        0,
      ),
    )

  const zeroLevelNpshMargin =
    zeroLevelState.npshMargin

  /*
   NPSH margin changes exactly one metre
   for every one metre of static liquid level.

   Positive z:
   liquid surface above pump centerline.

   Negative z:
   pump above liquid surface, i.e. suction lift.
  */

  const requiredStaticLiquidLevelAbovePump =
    input.targetNpshMargin -
    zeroLevelNpshMargin

  const minimumFloodedSuctionHead =
    Math.max(
      requiredStaticLiquidLevelAbovePump,
      0,
    )

  const maximumSuctionLift =
    Math.max(
      -requiredStaticLiquidLevelAbovePump,
      0,
    )

  let requiredSuctionConfiguration:
    RequiredSuctionConfiguration

  if (
    requiredStaticLiquidLevelAbovePump >
    1e-12
  ) {
    requiredSuctionConfiguration =
      'flooded-suction'
  } else if (
    requiredStaticLiquidLevelAbovePump <
    -1e-12
  ) {
    requiredSuctionConfiguration =
      'suction-lift'
  } else {
    requiredSuctionConfiguration =
      'pump-at-liquid-level'
  }

  /*
   Verify the explicit inverse solution
   with Calculator 405 itself.
  */

  const solved =
    calculateNpshAvailableCavitationMargin(
      createNpshInput(
        input,
        requiredStaticLiquidLevelAbovePump,
      ),
    )

  const marginResidual =
    solved.npshMargin -
    input.targetNpshMargin

  const values = [
    zeroLevelNpshMargin,

    requiredStaticLiquidLevelAbovePump,

    minimumFloodedSuctionHead,
    maximumSuctionLift,

    solved.availableNpsh,
    solved.npshMargin,

    marginResidual,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    Math.abs(
      marginResidual,
    ) >
      1e-9
  ) {
    throw new RequiredStaticLiquidLevelNpshMarginError(
      'NUMERICAL_FAILURE',
      'The required static liquid-level solution failed the NPSH-margin closure check.',
    )
  }

  return {
    ...solved,

    targetNpshMargin:
      input.targetNpshMargin,

    zeroLevelNpshMargin,

    requiredStaticLiquidLevelAbovePump,

    minimumFloodedSuctionHead,

    maximumSuctionLift,

    requiredSuctionConfiguration,

    marginResidual,

    modelName:
      'Required Static Liquid Level / Maximum Suction Lift for NPSH Margin',

    limitationDescription:
      'Inverse-design wrapper around Calculator 405. All pump, fluid and suction-line properties remain fixed while the static liquid level relative to pump centerline is solved explicitly. Positive level means flooded suction; negative level represents allowable suction lift.',
  }
}

export function createRequiredStaticLiquidLevelNpshMarginCsv(
  input:
    RequiredStaticLiquidLevelNpshMarginInput,
  result:
    RequiredStaticLiquidLevelNpshMarginResult,
): string {
  const rows = [
    [
      'Required Static Liquid Level / Maximum Suction Lift for NPSH Margin',
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
      'Required static liquid level above pump',
      result.requiredStaticLiquidLevelAbovePump,
      'm',
    ],
    [
      'Minimum flooded suction head',
      result.minimumFloodedSuctionHead,
      'm',
    ],
    [
      'Maximum suction lift',
      result.maximumSuctionLift,
      'm',
    ],
    [
      'Required suction configuration',
      result.requiredSuctionConfiguration,
      '-',
    ],
    [
      'Zero-level NPSH margin',
      result.zeroLevelNpshMargin,
      'm',
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
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
