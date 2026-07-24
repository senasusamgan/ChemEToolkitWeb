import type {
  HumidificationPsychrometricsInput,
  HumidificationPsychrometricsResult,
} from './types.ts'

export type HumidificationPsychrometricsErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveDryAirFlow'
  | 'temperatureOutsideCorrelationRange'
  | 'nonPositivePressure'
  | 'relativeHumidityOutOfRange'
  | 'pressureAtOrBelowSaturation'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  HumidificationPsychrometricsErrorCode,
  string
> = {
  nonFiniteInput: 'All psychrometric inputs must be finite.',
  nonPositiveDryAirFlow:
    'Dry-air mass flow rate must be greater than zero.',
  temperatureOutsideCorrelationRange:
    'Dry-bulb temperature must remain between −40 °C and 60 °C for the implemented Magnus saturation-pressure correlation.',
  nonPositivePressure:
    'Total pressure must be greater than zero.',
  relativeHumidityOutOfRange:
    'Relative humidity must lie between zero and one.',
  pressureAtOrBelowSaturation:
    'Total pressure must exceed the saturation vapor pressure at the selected dry-bulb temperature.',
  numericalFailure:
    'The psychrometric calculation did not produce finite physical results.',
}

export class HumidificationPsychrometricsCalculationError extends Error {
  readonly code: HumidificationPsychrometricsErrorCode

  constructor(code: HumidificationPsychrometricsErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'HumidificationPsychrometricsCalculationError'
    this.code = code
  }
}

const DRY_AIR_HEAT_CAPACITY = 1.005
const WATER_VAPOR_HEAT_CAPACITY = 1.88
const REFERENCE_LATENT_HEAT = 2500
const WATER_TO_DRY_AIR_MOLAR_MASS_RATIO = 0.62198
const ZERO_TOLERANCE = 1e-12

export function saturationVaporPressureKPa(
  temperatureCelsius: number,
): number {
  return (
    0.61094 *
    Math.exp(
      (17.625 * temperatureCelsius) /
        (temperatureCelsius + 243.04),
    )
  )
}

function humidityRatio(
  vaporPressureKPa: number,
  totalPressureKPa: number,
): number {
  return (
    (WATER_TO_DRY_AIR_MOLAR_MASS_RATIO *
      vaporPressureKPa) /
    (totalPressureKPa - vaporPressureKPa)
  )
}

function humidEnthalpy(
  temperatureCelsius: number,
  ratio: number,
): number {
  return (
    DRY_AIR_HEAT_CAPACITY * temperatureCelsius +
    ratio *
      (REFERENCE_LATENT_HEAT +
        WATER_VAPOR_HEAT_CAPACITY *
          temperatureCelsius)
  )
}

function dewPointCelsius(
  vaporPressureKPa: number,
): number | null {
  if (vaporPressureKPa <= 0) {
    return null
  }

  const logarithm = Math.log(vaporPressureKPa / 0.61094)

  return (
    (243.04 * logarithm) /
    (17.625 - logarithm)
  )
}

export function calculateHumidificationPsychrometrics(
  input: HumidificationPsychrometricsInput,
): HumidificationPsychrometricsResult {
  const values = [
    input.dryAirMassFlowRate,
    input.dryBulbTemperatureCelsius,
    input.totalPressureKPa,
    input.inletRelativeHumidity,
    input.outletRelativeHumidity,
  ]

  if (!values.every(Number.isFinite)) {
    throw new HumidificationPsychrometricsCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.dryAirMassFlowRate <= 0) {
    throw new HumidificationPsychrometricsCalculationError(
      'nonPositiveDryAirFlow',
    )
  }

  if (
    input.dryBulbTemperatureCelsius < -40 ||
    input.dryBulbTemperatureCelsius > 60
  ) {
    throw new HumidificationPsychrometricsCalculationError(
      'temperatureOutsideCorrelationRange',
    )
  }

  if (input.totalPressureKPa <= 0) {
    throw new HumidificationPsychrometricsCalculationError(
      'nonPositivePressure',
    )
  }

  if (
    input.inletRelativeHumidity < 0 ||
    input.inletRelativeHumidity > 1 ||
    input.outletRelativeHumidity < 0 ||
    input.outletRelativeHumidity > 1
  ) {
    throw new HumidificationPsychrometricsCalculationError(
      'relativeHumidityOutOfRange',
    )
  }

  const saturationPressure =
    saturationVaporPressureKPa(
      input.dryBulbTemperatureCelsius,
    )

  if (
    input.totalPressureKPa <=
    saturationPressure + ZERO_TOLERANCE
  ) {
    throw new HumidificationPsychrometricsCalculationError(
      'pressureAtOrBelowSaturation',
    )
  }

  const inletVaporPressure =
    input.inletRelativeHumidity * saturationPressure
  const outletVaporPressure =
    input.outletRelativeHumidity * saturationPressure

  const inletHumidityRatio = humidityRatio(
    inletVaporPressure,
    input.totalPressureKPa,
  )
  const outletHumidityRatio = humidityRatio(
    outletVaporPressure,
    input.totalPressureKPa,
  )
  const saturationHumidityRatio = humidityRatio(
    saturationPressure,
    input.totalPressureKPa,
  )

  const signedWaterTransferRate =
    input.dryAirMassFlowRate *
    (outletHumidityRatio - inletHumidityRatio)

  const inletHumidEnthalpy = humidEnthalpy(
    input.dryBulbTemperatureCelsius,
    inletHumidityRatio,
  )
  const outletHumidEnthalpy = humidEnthalpy(
    input.dryBulbTemperatureCelsius,
    outletHumidityRatio,
  )

  const signedIsothermalHeatDuty =
    input.dryAirMassFlowRate *
    (outletHumidEnthalpy - inletHumidEnthalpy)

  let directionDescription: string

  if (signedWaterTransferRate > ZERO_TOLERANCE) {
    directionDescription =
      'Water is added to the dry-air stream (humidification).'
  } else if (
    signedWaterTransferRate < -ZERO_TOLERANCE
  ) {
    directionDescription =
      'Water is removed from the dry-air stream (dehumidification).'
  } else {
    directionDescription =
      'Inlet and outlet humidity states are unchanged.'
  }

  const result: HumidificationPsychrometricsResult = {
    saturationVaporPressureKPa: saturationPressure,
    inletVaporPressureKPa: inletVaporPressure,
    outletVaporPressureKPa: outletVaporPressure,
    inletHumidityRatio,
    outletHumidityRatio,
    saturationHumidityRatio,
    signedWaterTransferRate,
    waterTransferMagnitude:
      Math.abs(signedWaterTransferRate),
    inletDewPointCelsius:
      dewPointCelsius(inletVaporPressure),
    outletDewPointCelsius:
      dewPointCelsius(outletVaporPressure),
    inletHumidEnthalpy,
    outletHumidEnthalpy,
    signedIsothermalHeatDuty,
    directionDescription,
    modelName:
      'Ideal moist-air relations with Magnus saturation pressure',
  }

  const numericResults = [
    result.saturationVaporPressureKPa,
    result.inletVaporPressureKPa,
    result.outletVaporPressureKPa,
    result.inletHumidityRatio,
    result.outletHumidityRatio,
    result.saturationHumidityRatio,
    result.signedWaterTransferRate,
    result.waterTransferMagnitude,
    result.inletHumidEnthalpy,
    result.outletHumidEnthalpy,
    result.signedIsothermalHeatDuty,
  ]

  if (
    !numericResults.every(Number.isFinite) ||
    result.saturationVaporPressureKPa <= 0 ||
    result.inletHumidityRatio < 0 ||
    result.outletHumidityRatio < 0 ||
    result.saturationHumidityRatio <= 0
  ) {
    throw new HumidificationPsychrometricsCalculationError(
      'numericalFailure',
    )
  }

  return result
}
