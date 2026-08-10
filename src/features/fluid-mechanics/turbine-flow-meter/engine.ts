import type {
  TurbineFlowMeterInput,
  TurbineFlowMeterResult,
  TurbineFlowRegime,
} from './types.ts'

export const TURBINE_FLOW_METER_ENGINE_VERSION =
  'turbine-flow-meter-v1'

export type TurbineFlowMeterErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_PULSE_FREQUENCY'
  | 'INVALID_K_FACTOR'
  | 'INVALID_CALIBRATION_FACTOR'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'NUMERICAL_FAILURE'

export class TurbineFlowMeterError
  extends Error {
  readonly code:
    TurbineFlowMeterErrorCode

  constructor(
    code:
      TurbineFlowMeterErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TurbineFlowMeterError'

    this.code =
      code
  }
}

function determineFlowRegime(
  reynoldsNumber: number,
): TurbineFlowRegime {
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

export function calculateTurbineFlowMeter(
  input:
    TurbineFlowMeterInput,
): TurbineFlowMeterResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new TurbineFlowMeterError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.pulseFrequency,
    ) ||
    input.pulseFrequency <= 0
  ) {
    throw new TurbineFlowMeterError(
      'INVALID_PULSE_FREQUENCY',
      'Measured turbine pulse frequency must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.meterKFactor,
    ) ||
    input.meterKFactor <= 0
  ) {
    throw new TurbineFlowMeterError(
      'INVALID_K_FACTOR',
      'Meter K-factor must be a positive finite value in pulses per cubic meter.',
    )
  }

  if (
    !Number.isFinite(
      input.calibrationFactor,
    ) ||
    input.calibrationFactor <= 0
  ) {
    throw new TurbineFlowMeterError(
      'INVALID_CALIBRATION_FACTOR',
      'Calibration factor must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TurbineFlowMeterError(
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
    throw new TurbineFlowMeterError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  const rawVolumetricFlowRate =
    input.pulseFrequency /
    input.meterKFactor

  const volumetricFlowRate =
    input.calibrationFactor *
    rawVolumetricFlowRate

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

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

  const pulsePeriod =
    1 /
    input.pulseFrequency

  const pulsesPerMinute =
    input.pulseFrequency *
    60

  const pulsesPerHour =
    input.pulseFrequency *
    3600

  const reconstructedPulseFrequency =
    (
      volumetricFlowRate /
      input.calibrationFactor
    ) *
    input.meterKFactor

  const frequencyClosureResidual =
    reconstructedPulseFrequency -
    input.pulseFrequency

  const positiveValues = [
    rawVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    pipeCrossSectionalArea,

    fluidVelocity,

    reynoldsNumber,

    pulsePeriod,

    pulsesPerMinute,

    pulsesPerHour,

    reconstructedPulseFrequency,
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
      frequencyClosureResidual,
    ) ||
    Math.abs(
      frequencyClosureResidual,
    ) >
      Math.max(
        1e-10,
        input.pulseFrequency *
          1e-12,
      )
  ) {
    throw new TurbineFlowMeterError(
      'NUMERICAL_FAILURE',
      'The turbine-meter calculation failed its pulse-frequency closure check.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    pipeCrossSectionalArea,

    pulseFrequency:
      input.pulseFrequency,

    meterKFactor:
      input.meterKFactor,

    calibrationFactor:
      input.calibrationFactor,

    rawVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    fluidVelocity,

    reynoldsNumber,

    flowRegime,

    pulsePeriod,

    pulsesPerMinute,

    pulsesPerHour,

    reconstructedPulseFrequency,

    frequencyClosureResidual,

    modelName:
      'Turbine Flow Meter — Pulse Frequency & K-Factor',

    limitationDescription:
      'Steady turbine-meter conversion using a meter K-factor expressed in pulses per cubic meter. The calibration factor can correct a known systematic meter bias. Actual turbine-meter K-factor may depend on Reynolds number, viscosity, installation geometry and manufacturer calibration range.',
  }
}

export function createTurbineFlowMeterCsv(
  input:
    TurbineFlowMeterInput,
  result:
    TurbineFlowMeterResult,
): string {
  const rows = [
    [
      'Turbine Flow Meter',
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
      'Measured pulse frequency',
      input.pulseFrequency,
      'Hz',
    ],
    [
      'Meter K-factor',
      input.meterKFactor,
      'pulses/m3',
    ],
    [
      'Calibration factor',
      input.calibrationFactor,
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
      'Raw volumetric flow rate',
      result.rawVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Corrected volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Corrected volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Corrected volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
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
      'Pulse period',
      result.pulsePeriod,
      's',
    ],
    [
      'Pulses per minute',
      result.pulsesPerMinute,
      'pulses/min',
    ],
    [
      'Pulses per hour',
      result.pulsesPerHour,
      'pulses/h',
    ],
    [
      'Reconstructed pulse frequency',
      result.reconstructedPulseFrequency,
      'Hz',
    ],
    [
      'Frequency closure residual',
      result.frequencyClosureResidual,
      'Hz',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
