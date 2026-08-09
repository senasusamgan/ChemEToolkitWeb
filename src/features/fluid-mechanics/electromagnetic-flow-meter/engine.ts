import type {
  ElectromagneticFlowMeterInput,
  ElectromagneticFlowMeterResult,
  ElectromagneticFlowRegime,
} from './types.ts'

export const ELECTROMAGNETIC_FLOW_METER_ENGINE_VERSION =
  'electromagnetic-flow-meter-v1'

export type ElectromagneticFlowMeterErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_ELECTRODE_SPACING'
  | 'INVALID_MAGNETIC_FLUX_DENSITY'
  | 'INVALID_INDUCED_VOLTAGE'
  | 'INVALID_CALIBRATION_FACTOR'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'NUMERICAL_FAILURE'

export class ElectromagneticFlowMeterError
  extends Error {
  readonly code:
    ElectromagneticFlowMeterErrorCode

  constructor(
    code:
      ElectromagneticFlowMeterErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'ElectromagneticFlowMeterError'

    this.code =
      code
  }
}

function determineFlowRegime(
  reynoldsNumber: number,
): ElectromagneticFlowRegime {
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

export function calculateElectromagneticFlowMeter(
  input:
    ElectromagneticFlowMeterInput,
): ElectromagneticFlowMeterResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new ElectromagneticFlowMeterError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.electrodeSpacing,
    ) ||
    input.electrodeSpacing <= 0
  ) {
    throw new ElectromagneticFlowMeterError(
      'INVALID_ELECTRODE_SPACING',
      'Electrode spacing must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.magneticFluxDensity,
    ) ||
    input.magneticFluxDensity <= 0
  ) {
    throw new ElectromagneticFlowMeterError(
      'INVALID_MAGNETIC_FLUX_DENSITY',
      'Magnetic flux density must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.inducedVoltageMillivolts,
    ) ||
    input.inducedVoltageMillivolts <= 0
  ) {
    throw new ElectromagneticFlowMeterError(
      'INVALID_INDUCED_VOLTAGE',
      'Measured induced voltage must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.calibrationFactor,
    ) ||
    input.calibrationFactor <= 0
  ) {
    throw new ElectromagneticFlowMeterError(
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
    throw new ElectromagneticFlowMeterError(
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
    throw new ElectromagneticFlowMeterError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  const inducedVoltage =
    input.inducedVoltageMillivolts *
    1e-3

  const electromagneticSensitivity =
    input.calibrationFactor *
    input.magneticFluxDensity *
    input.electrodeSpacing

  const fluidVelocity =
    inducedVoltage /
    electromagneticSensitivity

  const pipeCrossSectionalArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

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

  const dynamicPressure =
    0.5 *
    input.fluidDensity *
    fluidVelocity *
    fluidVelocity

  const reconstructedVoltage =
    (
      input.calibrationFactor *
      input.magneticFluxDensity *
      input.electrodeSpacing *
      fluidVelocity
    )

  const reconstructedVoltageMillivolts =
    reconstructedVoltage *
    1000

  const voltageClosureResidual =
    reconstructedVoltage -
    inducedVoltage

  const positiveValues = [
    inducedVoltage,

    electromagneticSensitivity,

    fluidVelocity,

    pipeCrossSectionalArea,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    dynamicPressure,

    reconstructedVoltage,

    reconstructedVoltageMillivolts,
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
      voltageClosureResidual,
    ) ||
    Math.abs(
      voltageClosureResidual,
    ) >
      1e-12
  ) {
    throw new ElectromagneticFlowMeterError(
      'NUMERICAL_FAILURE',
      'The electromagnetic flow calculation failed the Faraday-law closure check.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    electrodeSpacing:
      input.electrodeSpacing,

    magneticFluxDensity:
      input.magneticFluxDensity,

    inducedVoltage,

    inducedVoltageMillivolts:
      input.inducedVoltageMillivolts,

    calibrationFactor:
      input.calibrationFactor,

    pipeCrossSectionalArea,

    fluidVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    flowRegime,

    dynamicPressure,

    reconstructedVoltage,

    reconstructedVoltageMillivolts,

    voltageClosureResidual,

    modelName:
      'Electromagnetic Flow Meter — Faraday Law',

    limitationDescription:
      'Idealized electromagnetic flow-meter model based on E = KBLv. The process fluid must be electrically conductive enough for the actual instrument, the pipe must remain full, and electrode/magnetic-field geometry must match the supplied calibration factor. Manufacturer calibration should be used for custody or precision measurement.',
  }
}

export function createElectromagneticFlowMeterCsv(
  input:
    ElectromagneticFlowMeterInput,
  result:
    ElectromagneticFlowMeterResult,
): string {
  const rows = [
    [
      'Electromagnetic Flow Meter',
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
      'Electrode spacing',
      input.electrodeSpacing,
      'm',
    ],
    [
      'Magnetic flux density',
      input.magneticFluxDensity,
      'T',
    ],
    [
      'Measured induced voltage',
      input.inducedVoltageMillivolts,
      'mV',
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
      'Dynamic pressure',
      result.dynamicPressure,
      'Pa',
    ],
    [
      'Reconstructed voltage',
      result.reconstructedVoltageMillivolts,
      'mV',
    ],
    [
      'Voltage closure residual',
      result.voltageClosureResidual,
      'V',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
