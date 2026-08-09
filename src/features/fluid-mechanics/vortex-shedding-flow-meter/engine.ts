import type {
  VortexFlowRegime,
  VortexSheddingFlowMeterInput,
  VortexSheddingFlowMeterResult,
} from './types.ts'

export const VORTEX_SHEDDING_FLOW_METER_ENGINE_VERSION =
  'vortex-shedding-flow-meter-v1'

export type VortexSheddingFlowMeterErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_BLUFF_BODY_WIDTH'
  | 'INVALID_GEOMETRY'
  | 'INVALID_SHEDDING_FREQUENCY'
  | 'INVALID_STROUHAL_NUMBER'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'NUMERICAL_FAILURE'

export class VortexSheddingFlowMeterError
  extends Error {
  readonly code:
    VortexSheddingFlowMeterErrorCode

  constructor(
    code:
      VortexSheddingFlowMeterErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'VortexSheddingFlowMeterError'

    this.code =
      code
  }
}

function determineFlowRegime(
  reynoldsNumber: number,
): VortexFlowRegime {
  if (
    reynoldsNumber < 2300
  ) {
    return 'laminar'
  }

  if (
    reynoldsNumber < 4000
  ) {
    return 'transitional'
  }

  return 'turbulent'
}

export function calculateVortexSheddingFlowMeter(
  input:
    VortexSheddingFlowMeterInput,
): VortexSheddingFlowMeterResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.bluffBodyWidth,
    ) ||
    input.bluffBodyWidth <= 0
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_BLUFF_BODY_WIDTH',
      'Bluff-body characteristic width must be a positive finite value.',
    )
  }

  if (
    input.bluffBodyWidth >=
    input.pipeDiameter
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_GEOMETRY',
      'Bluff-body width must be smaller than the internal pipe diameter.',
    )
  }

  if (
    !Number.isFinite(
      input.sheddingFrequency,
    ) ||
    input.sheddingFrequency <= 0
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_SHEDDING_FREQUENCY',
      'Measured vortex-shedding frequency must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.strouhalNumber,
    ) ||
    input.strouhalNumber <= 0
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_STROUHAL_NUMBER',
      'Strouhal number must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dynamicViscosity,
    ) ||
    input.dynamicViscosity <= 0
  ) {
    throw new VortexSheddingFlowMeterError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  const pipeCrossSectionalArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

  const fluidVelocity =
    (
      input.sheddingFrequency *
      input.bluffBodyWidth
    ) /
    input.strouhalNumber

  const volumetricFlowRate =
    pipeCrossSectionalArea *
    fluidVelocity

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const reynoldsNumber =
    (
      input.fluidDensity *
      fluidVelocity *
      input.pipeDiameter
    ) /
    input.dynamicViscosity

  const flowRegime =
    determineFlowRegime(
      reynoldsNumber,
    )

  const vortexSheddingPeriod =
    1 /
    input.sheddingFrequency

  const vortexSpacing =
    fluidVelocity /
    input.sheddingFrequency

  const dynamicPressure =
    0.5 *
    input.fluidDensity *
    fluidVelocity *
    fluidVelocity

  const recoveredStrouhalNumber =
    (
      input.sheddingFrequency *
      input.bluffBodyWidth
    ) /
    fluidVelocity

  const strouhalResidual =
    recoveredStrouhalNumber -
    input.strouhalNumber

  const positiveValues = [
    pipeCrossSectionalArea,

    fluidVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    vortexSheddingPeriod,

    vortexSpacing,

    dynamicPressure,

    recoveredStrouhalNumber,
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
      strouhalResidual,
    ) ||
    Math.abs(
      strouhalResidual,
    ) >
      1e-12
  ) {
    throw new VortexSheddingFlowMeterError(
      'NUMERICAL_FAILURE',
      'The vortex-shedding flow calculation failed the Strouhal closure check.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    bluffBodyWidth:
      input.bluffBodyWidth,

    sheddingFrequency:
      input.sheddingFrequency,

    strouhalNumber:
      input.strouhalNumber,

    pipeCrossSectionalArea,

    fluidVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    flowRegime,

    vortexSheddingPeriod,

    vortexSpacing,

    dynamicPressure,

    recoveredStrouhalNumber,

    strouhalResidual,

    modelName:
      'Vortex Shedding Flow Meter — Velocity & Flow Rate',

    limitationDescription:
      'Steady single-phase flow model using the Strouhal relation St = f d / v. The supplied Strouhal number is assumed appropriate for the meter geometry and Reynolds-number range. Actual commercial vortex meters use geometry-specific calibration and operating-range limits.',
  }
}

export function createVortexSheddingFlowMeterCsv(
  input:
    VortexSheddingFlowMeterInput,
  result:
    VortexSheddingFlowMeterResult,
): string {
  const rows = [
    [
      'Vortex Shedding Flow Meter',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Internal pipe diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Bluff-body width',
      input.bluffBodyWidth,
      'm',
    ],
    [
      'Shedding frequency',
      input.sheddingFrequency,
      'Hz',
    ],
    [
      'Strouhal number',
      input.strouhalNumber,
      '-',
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
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Fluid velocity',
      result.fluidVelocity,
      'm/s',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Reynolds number',
      result.reynoldsNumber,
      '-',
    ],
    [
      'Flow regime',
      result.flowRegime,
      '-',
    ],
    [
      'Vortex shedding period',
      result.vortexSheddingPeriod,
      's',
    ],
    [
      'Vortex spacing',
      result.vortexSpacing,
      'm',
    ],
    [
      'Dynamic pressure',
      result.dynamicPressure,
      'Pa',
    ],
    [
      'Recovered Strouhal number',
      result.recoveredStrouhalNumber,
      '-',
    ],
    [
      'Strouhal closure residual',
      result.strouhalResidual,
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
