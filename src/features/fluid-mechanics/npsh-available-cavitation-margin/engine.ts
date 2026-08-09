import {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
} from '../shared/pipeHydraulicsCore.ts'

import type {
  NpshAvailableCavitationMarginInput,
  NpshAvailableCavitationMarginResult,
} from './types.ts'

export {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
}

export const NPSH_AVAILABLE_CAVITATION_MARGIN_ENGINE_VERSION =
  'npsh-available-cavitation-margin-v1'

export type NpshAvailableCavitationMarginErrorCode =
  | 'INVALID_SURFACE_PRESSURE'
  | 'INVALID_VAPOR_PRESSURE'
  | 'VAPOR_PRESSURE_NOT_BELOW_SURFACE'
  | 'INVALID_STATIC_LEVEL'
  | 'INVALID_REQUIRED_NPSH'
  | 'NUMERICAL_FAILURE'

export class NpshAvailableCavitationMarginError
  extends Error {
  readonly code:
    NpshAvailableCavitationMarginErrorCode

  constructor(
    code:
      NpshAvailableCavitationMarginErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'NpshAvailableCavitationMarginError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateNpshAvailableCavitationMargin(
  input:
    NpshAvailableCavitationMarginInput,
): NpshAvailableCavitationMarginResult {
  if (
    !Number.isFinite(
      input.liquidSurfaceAbsolutePressure,
    ) ||
    input.liquidSurfaceAbsolutePressure <= 0
  ) {
    throw new NpshAvailableCavitationMarginError(
      'INVALID_SURFACE_PRESSURE',
      'Liquid-surface absolute pressure must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.vaporPressure,
    ) ||
    input.vaporPressure < 0
  ) {
    throw new NpshAvailableCavitationMarginError(
      'INVALID_VAPOR_PRESSURE',
      'Liquid vapor pressure must be a non-negative finite absolute pressure.',
    )
  }

  if (
    input.vaporPressure >=
    input.liquidSurfaceAbsolutePressure
  ) {
    throw new NpshAvailableCavitationMarginError(
      'VAPOR_PRESSURE_NOT_BELOW_SURFACE',
      'Vapor pressure must remain below the liquid-surface absolute pressure for this liquid suction model.',
    )
  }

  if (
    !Number.isFinite(
      input.staticLiquidLevelAbovePump,
    )
  ) {
    throw new NpshAvailableCavitationMarginError(
      'INVALID_STATIC_LEVEL',
      'Static liquid level relative to pump centerline must be finite.',
    )
  }

  if (
    !Number.isFinite(
      input.requiredNpsh,
    ) ||
    input.requiredNpsh <= 0
  ) {
    throw new NpshAvailableCavitationMarginError(
      'INVALID_REQUIRED_NPSH',
      'Required NPSH must be a positive finite value.',
    )
  }

  /*
   Reuse the shared 401-404 hydraulic model
   for suction-line major and minor losses.
  */

  const suctionState =
    calculatePipeHydraulicsState({
      diameter:
        input.suctionPipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      pipeLength:
        input.suctionPipeLength,

      fluidDensity:
        input.fluidDensity,

      dynamicViscosity:
        input.dynamicViscosity,

      absoluteRoughness:
        input.absoluteRoughness,

      minorLossCoefficient:
        input.suctionMinorLossCoefficient,
    })

  const surfacePressureHead =
    input.liquidSurfaceAbsolutePressure /
    (
      input.fluidDensity *
      GRAVITATIONAL_ACCELERATION
    )

  const vaporPressureHead =
    input.vaporPressure /
    (
      input.fluidDensity *
      GRAVITATIONAL_ACCELERATION
    )

  const pressureHeadAboveVapor =
    surfacePressureHead -
    vaporPressureHead

  const suctionLineHeadLoss =
    suctionState.totalHeadLoss

  const availableNpsh =
    pressureHeadAboveVapor +
    input.staticLiquidLevelAbovePump -
    suctionLineHeadLoss

  const npshMargin =
    availableNpsh -
    input.requiredNpsh

  const npshMarginPercent =
    npshMargin /
    input.requiredNpsh *
    100

  const npshRatio =
    availableNpsh /
    input.requiredNpsh

  const cavitationRisk =
    npshMargin < 0

  const cavitationStatus:
    'adequate' | 'insufficient' =
      cavitationRisk
        ? 'insufficient'
        : 'adequate'

  const values = [
    surfacePressureHead,
    vaporPressureHead,
    pressureHeadAboveVapor,

    suctionLineHeadLoss,

    availableNpsh,
    npshMargin,
    npshMarginPercent,
    npshRatio,
  ]

  if (
    !values.every(
      Number.isFinite,
    )
  ) {
    throw new NpshAvailableCavitationMarginError(
      'NUMERICAL_FAILURE',
      'The NPSH calculation did not produce finite results.',
    )
  }

  return {
    ...suctionState,

    liquidSurfaceAbsolutePressure:
      input.liquidSurfaceAbsolutePressure,

    vaporPressure:
      input.vaporPressure,

    surfacePressureHead,
    vaporPressureHead,
    pressureHeadAboveVapor,

    staticLiquidLevelAbovePump:
      input.staticLiquidLevelAbovePump,

    suctionLineHeadLoss,

    availableNpsh,

    requiredNpsh:
      input.requiredNpsh,

    npshMargin,
    npshMarginPercent,
    npshRatio,

    cavitationStatus,
    cavitationRisk,

    modelName:
      'NPSH Available & Cavitation Margin',

    limitationDescription:
      'Steady incompressible liquid suction analysis. NPSH available is calculated from liquid-surface absolute pressure, vapor pressure, static liquid level and suction-line head loss. Suction major and minor losses reuse the shared Darcy-Weisbach pipe-hydraulics model. The required NPSH value must come from the pump manufacturer at the operating condition.',
  }
}

export function createNpshAvailableCavitationMarginCsv(
  input:
    NpshAvailableCavitationMarginInput,
  result:
    NpshAvailableCavitationMarginResult,
): string {
  const rows = [
    [
      'NPSH Available & Cavitation Margin',
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
      'Static liquid level above pump',
      input.staticLiquidLevelAbovePump,
      'm',
    ],
    [
      'Required NPSH',
      input.requiredNpsh,
      'm',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
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
      'NPSH margin',
      result.npshMargin,
      'm',
    ],
    [
      'NPSH margin',
      result.npshMarginPercent,
      '% of NPSHr',
    ],
    [
      'NPSHa / NPSHr',
      result.npshRatio,
      '-',
    ],
    [
      'Suction line head loss',
      result.suctionLineHeadLoss,
      'm',
    ],
    [
      'Mean suction velocity',
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
    [
      'Cavitation status',
      result.cavitationStatus,
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
