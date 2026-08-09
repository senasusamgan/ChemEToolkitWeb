import type {
  FlowNozzleDifferentialPressureInput,
  FlowNozzleDifferentialPressureResult,
  FlowNozzleRegime,
} from './types.ts'

export const FLOW_NOZZLE_DIFFERENTIAL_PRESSURE_ENGINE_VERSION =
  'flow-nozzle-differential-pressure-v1'

export type FlowNozzleDifferentialPressureErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_NOZZLE_DIAMETER'
  | 'INVALID_BETA_RATIO'
  | 'INVALID_DIFFERENTIAL_PRESSURE'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'INVALID_DISCHARGE_COEFFICIENT'
  | 'NUMERICAL_FAILURE'

export class FlowNozzleDifferentialPressureError
  extends Error {
  readonly code:
    FlowNozzleDifferentialPressureErrorCode

  constructor(
    code:
      FlowNozzleDifferentialPressureErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'FlowNozzleDifferentialPressureError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

function determineFlowRegime(
  reynoldsNumber: number,
): FlowNozzleRegime {
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

export function calculateFlowNozzleDifferentialPressure(
  input:
    FlowNozzleDifferentialPressureInput,
): FlowNozzleDifferentialPressureResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.nozzleDiameter,
    ) ||
    input.nozzleDiameter <= 0
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_NOZZLE_DIAMETER',
      'Flow-nozzle throat diameter must be a positive finite value.',
    )
  }

  if (
    input.nozzleDiameter >=
    input.pipeDiameter
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_BETA_RATIO',
      'Flow-nozzle diameter must be smaller than the upstream pipe diameter.',
    )
  }

  if (
    !Number.isFinite(
      input.differentialPressure,
    ) ||
    input.differentialPressure <= 0
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_DIFFERENTIAL_PRESSURE',
      'Differential pressure must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new FlowNozzleDifferentialPressureError(
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
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dischargeCoefficient,
    ) ||
    input.dischargeCoefficient <= 0
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_DISCHARGE_COEFFICIENT',
      'Discharge coefficient must be a positive finite value.',
    )
  }

  const betaRatio =
    input.nozzleDiameter /
    input.pipeDiameter

  const betaFourth =
    betaRatio ** 4

  const denominatorFactor =
    1 -
    betaFourth

  if (
    denominatorFactor <= 0
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'INVALID_BETA_RATIO',
      'The nozzle beta ratio must produce a positive differential-pressure denominator.',
    )
  }

  const pipeArea =
    Math.PI *
    input.pipeDiameter ** 2 /
    4

  const nozzleArea =
    Math.PI *
    input.nozzleDiameter ** 2 /
    4

  const areaRatio =
    nozzleArea /
    pipeArea

  const idealVolumetricFlowRate =
    nozzleArea *
    Math.sqrt(
      (
        2 *
        input.differentialPressure
      ) /
      (
        input.fluidDensity *
        denominatorFactor
      ),
    )

  const volumetricFlowRate =
    input.dischargeCoefficient *
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

  const pipeVelocity =
    volumetricFlowRate /
    pipeArea

  const nozzleVelocity =
    volumetricFlowRate /
    nozzleArea

  const reynoldsNumber =
    (
      input.fluidDensity *
      pipeVelocity *
      input.pipeDiameter
    ) /
    input.dynamicViscosity

  const flowRegime =
    determineFlowRegime(
      reynoldsNumber,
    )

  const differentialPressureHead =
    input.differentialPressure /
    (
      input.fluidDensity *
      GRAVITATIONAL_ACCELERATION
    )

  const values = [
    betaRatio,
    pipeArea,
    nozzleArea,
    areaRatio,
    idealVolumetricFlowRate,
    volumetricFlowRate,
    volumetricFlowRateCubicMetersPerHour,
    volumetricFlowRateLitersPerSecond,
    massFlowRate,
    pipeVelocity,
    nozzleVelocity,
    reynoldsNumber,
    differentialPressureHead,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    values.some(
      value =>
        value <= 0,
    )
  ) {
    throw new FlowNozzleDifferentialPressureError(
      'NUMERICAL_FAILURE',
      'The flow-nozzle calculation did not produce positive finite results.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    nozzleDiameter:
      input.nozzleDiameter,

    betaRatio,

    pipeArea,

    nozzleArea,

    areaRatio,

    differentialPressure:
      input.differentialPressure,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    pipeVelocity,

    nozzleVelocity,

    reynoldsNumber,

    flowRegime,

    differentialPressureHead,

    modelName:
      'Flow Nozzle Differential-Pressure Meter',

    limitationDescription:
      'Steady incompressible single-phase flow model based on the differential-pressure flow-nozzle equation. The user supplies the discharge coefficient. Compressibility, tap configuration and standards-based Reynolds-number corrections are not automatically applied.',
  }
}

export function createFlowNozzleDifferentialPressureCsv(
  input:
    FlowNozzleDifferentialPressureInput,
  result:
    FlowNozzleDifferentialPressureResult,
): string {
  const rows = [
    [
      'Flow Nozzle Differential-Pressure Meter',
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
      'Nozzle diameter',
      input.nozzleDiameter,
      'm',
    ],
    [
      'Differential pressure',
      input.differentialPressure,
      'Pa',
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
      'Discharge coefficient',
      input.dischargeCoefficient,
      '-',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Beta ratio',
      result.betaRatio,
      '-',
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
      'Pipe velocity',
      result.pipeVelocity,
      'm/s',
    ],
    [
      'Nozzle velocity',
      result.nozzleVelocity,
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
      'Differential-pressure head',
      result.differentialPressureHead,
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
