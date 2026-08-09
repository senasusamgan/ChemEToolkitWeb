import type {
  PositiveDisplacementFlowMeterInput,
  PositiveDisplacementFlowMeterResult,
  PositiveDisplacementFlowRegime,
} from './types.ts'

export const POSITIVE_DISPLACEMENT_FLOW_METER_ENGINE_VERSION =
  'positive-displacement-flow-meter-v1'

export type PositiveDisplacementFlowMeterErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_DISPLACEMENT'
  | 'INVALID_ROTATIONAL_SPEED'
  | 'INVALID_VOLUMETRIC_EFFICIENCY'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'NUMERICAL_FAILURE'

export class PositiveDisplacementFlowMeterError
  extends Error {
  readonly code:
    PositiveDisplacementFlowMeterErrorCode

  constructor(
    code:
      PositiveDisplacementFlowMeterErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PositiveDisplacementFlowMeterError'

    this.code =
      code
  }
}

function determineFlowRegime(
  reynoldsNumber: number,
): PositiveDisplacementFlowRegime {
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

export function calculatePositiveDisplacementFlowMeter(
  input:
    PositiveDisplacementFlowMeterInput,
): PositiveDisplacementFlowMeterResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new PositiveDisplacementFlowMeterError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.displacementPerCycle,
    ) ||
    input.displacementPerCycle <= 0
  ) {
    throw new PositiveDisplacementFlowMeterError(
      'INVALID_DISPLACEMENT',
      'Meter displacement per cycle must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.rotationalSpeedRpm,
    ) ||
    input.rotationalSpeedRpm <= 0
  ) {
    throw new PositiveDisplacementFlowMeterError(
      'INVALID_ROTATIONAL_SPEED',
      'Meter rotational speed must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricEfficiency,
    ) ||
    input.volumetricEfficiency <= 0 ||
    input.volumetricEfficiency > 1
  ) {
    throw new PositiveDisplacementFlowMeterError(
      'INVALID_VOLUMETRIC_EFFICIENCY',
      'Volumetric efficiency must be greater than 0 and no greater than 1.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new PositiveDisplacementFlowMeterError(
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
    throw new PositiveDisplacementFlowMeterError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  const cycleFrequency =
    input.rotationalSpeedRpm /
    60

  const idealVolumetricFlowRate =
    input.displacementPerCycle *
    cycleFrequency

  const volumetricFlowRate =
    input.volumetricEfficiency *
    idealVolumetricFlowRate

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const slipVolumetricFlowRate =
    idealVolumetricFlowRate -
    volumetricFlowRate

  const slipPercentage =
    (
      1 -
      input.volumetricEfficiency
    ) *
    100

  const pipeCrossSectionalArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

  const fluidVelocity =
    volumetricFlowRate /
    pipeCrossSectionalArea

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

  const recoveredDisplacementPerCycle =
    volumetricFlowRate /
    (
      input.volumetricEfficiency *
      cycleFrequency
    )

  const displacementClosureResidual =
    recoveredDisplacementPerCycle -
    input.displacementPerCycle

  const positiveValues = [
    cycleFrequency,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    pipeCrossSectionalArea,

    fluidVelocity,

    reynoldsNumber,

    recoveredDisplacementPerCycle,
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
      slipVolumetricFlowRate,
    ) ||
    slipVolumetricFlowRate < 0 ||
    !Number.isFinite(
      slipPercentage,
    ) ||
    slipPercentage < 0 ||
    !Number.isFinite(
      displacementClosureResidual,
    ) ||
    Math.abs(
      displacementClosureResidual,
    ) >
      Math.max(
        1e-15,
        input.displacementPerCycle *
          1e-10,
      )
  ) {
    throw new PositiveDisplacementFlowMeterError(
      'NUMERICAL_FAILURE',
      'The positive-displacement meter calculation failed its displacement closure check.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    displacementPerCycle:
      input.displacementPerCycle,

    rotationalSpeedRpm:
      input.rotationalSpeedRpm,

    cycleFrequency,

    volumetricEfficiency:
      input.volumetricEfficiency,

    pipeCrossSectionalArea,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    slipVolumetricFlowRate,

    slipPercentage,

    fluidVelocity,

    reynoldsNumber,

    flowRegime,

    recoveredDisplacementPerCycle,

    displacementClosureResidual,

    modelName:
      'Positive-Displacement Flow Meter',

    limitationDescription:
      'Steady positive-displacement meter model. Each complete meter cycle displaces the specified volume, and the volumetric-efficiency factor accounts for internal leakage or slip. The displacement value should correspond to the actual meter geometry or manufacturer calibration.',
  }
}

export function createPositiveDisplacementFlowMeterCsv(
  input:
    PositiveDisplacementFlowMeterInput,
  result:
    PositiveDisplacementFlowMeterResult,
): string {
  const rows = [
    [
      'Positive-Displacement Flow Meter',
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
      'Displacement per cycle',
      input.displacementPerCycle,
      'm3/cycle',
    ],
    [
      'Rotational speed',
      input.rotationalSpeedRpm,
      'rpm',
    ],
    [
      'Volumetric efficiency',
      input.volumetricEfficiency,
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
      'Cycle frequency',
      result.cycleFrequency,
      '1/s',
    ],
    [
      'Ideal volumetric flow rate',
      result.idealVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Actual volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Actual volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Actual volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Slip volumetric flow rate',
      result.slipVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Slip percentage',
      result.slipPercentage,
      '%',
    ],
    [
      'Pipe fluid velocity',
      result.fluidVelocity,
      'm/s',
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
      'Recovered displacement per cycle',
      result.recoveredDisplacementPerCycle,
      'm3/cycle',
    ],
    [
      'Displacement closure residual',
      result.displacementClosureResidual,
      'm3/cycle',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
