import type {
  RelativeHumidityHumidificationInput,
  RelativeHumidityHumidificationResult,
} from './types.ts'

export type RelativeHumidityHumidificationErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'relativeHumidityOutOfRange'
  | 'targetNotHigher'
  | 'vaporPressureTooHigh'
  | 'temperatureOutOfRange'
  | 'numericalFailure'

const messages: Record<
  RelativeHumidityHumidificationErrorCode,
  string
> = {
  nonFiniteInput:
    'All relative-humidity humidification inputs must be finite.',
  nonPositiveProperty:
    'Dry-air flow and total pressure must be greater than zero.',
  relativeHumidityOutOfRange:
    'Relative humidities must satisfy 0 ≤ RH ≤ 1.',
  targetNotHigher:
    'Target relative humidity must exceed inlet relative humidity.',
  vaporPressureTooHigh:
    'Water-vapor partial pressure must remain below total pressure.',
  temperatureOutOfRange:
    'Dry-bulb temperature must lie within the supported water-vapor correlation range of -40 to 100 °C.',
  numericalFailure:
    'The humidification calculation did not produce finite physical results.',
}

export class RelativeHumidityHumidificationCalculationError extends Error {
  readonly code: RelativeHumidityHumidificationErrorCode

  constructor(code: RelativeHumidityHumidificationErrorCode) {
    super(messages[code])
    this.name =
      'RelativeHumidityHumidificationCalculationError'
    this.code = code
  }
}

function saturationVaporPressureKilopascals(
  temperatureCelsius: number,
): number {
  return (
    0.61121 *
    Math.exp(
      (
        18.678 -
        temperatureCelsius /
        234.5
      ) *
      (
        temperatureCelsius /
        (257.14 + temperatureCelsius)
      ),
    )
  )
}

function humidityRatio(
  vaporPartialPressure: number,
  totalPressure: number,
): number {
  return (
    0.62198 *
    vaporPartialPressure /
    (
      totalPressure -
      vaporPartialPressure
    )
  )
}

export function calculateRelativeHumidityHumidification(
  input: RelativeHumidityHumidificationInput,
): RelativeHumidityHumidificationResult {
  const values = [
    input.dryAirFlowRate,
    input.dryBulbTemperature,
    input.totalPressure,
    input.inletRelativeHumidity,
    input.targetRelativeHumidity,
  ]

  if (!values.every(Number.isFinite)) {
    throw new RelativeHumidityHumidificationCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.dryAirFlowRate <= 0 ||
    input.totalPressure <= 0
  ) {
    throw new RelativeHumidityHumidificationCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.dryBulbTemperature < -40 ||
    input.dryBulbTemperature > 100
  ) {
    throw new RelativeHumidityHumidificationCalculationError(
      'temperatureOutOfRange',
    )
  }

  if (
    input.inletRelativeHumidity < 0 ||
    input.inletRelativeHumidity > 1 ||
    input.targetRelativeHumidity < 0 ||
    input.targetRelativeHumidity > 1
  ) {
    throw new RelativeHumidityHumidificationCalculationError(
      'relativeHumidityOutOfRange',
    )
  }

  if (
    input.targetRelativeHumidity <=
    input.inletRelativeHumidity
  ) {
    throw new RelativeHumidityHumidificationCalculationError(
      'targetNotHigher',
    )
  }

  const saturationVaporPressure =
    saturationVaporPressureKilopascals(
      input.dryBulbTemperature,
    )

  const inletVaporPartialPressure =
    input.inletRelativeHumidity *
    saturationVaporPressure

  const targetVaporPartialPressure =
    input.targetRelativeHumidity *
    saturationVaporPressure

  if (
    inletVaporPartialPressure >=
      input.totalPressure ||
    targetVaporPartialPressure >=
      input.totalPressure
  ) {
    throw new RelativeHumidityHumidificationCalculationError(
      'vaporPressureTooHigh',
    )
  }

  const inletHumidityRatio =
    humidityRatio(
      inletVaporPartialPressure,
      input.totalPressure,
    )

  const targetHumidityRatio =
    humidityRatio(
      targetVaporPartialPressure,
      input.totalPressure,
    )

  const humidityRatioIncrease =
    targetHumidityRatio -
    inletHumidityRatio

  const waterAdditionRate =
    input.dryAirFlowRate *
    humidityRatioIncrease

  const results = [
    saturationVaporPressure,
    inletVaporPartialPressure,
    targetVaporPartialPressure,
    inletHumidityRatio,
    targetHumidityRatio,
    humidityRatioIncrease,
    waterAdditionRate,
  ]

  if (
    !results.every(Number.isFinite) ||
    saturationVaporPressure <= 0 ||
    inletVaporPartialPressure < 0 ||
    targetVaporPartialPressure <= 0 ||
    inletHumidityRatio < 0 ||
    targetHumidityRatio <= 0 ||
    humidityRatioIncrease <= 0 ||
    waterAdditionRate <= 0
  ) {
    throw new RelativeHumidityHumidificationCalculationError(
      'numericalFailure',
    )
  }

  return {
    saturationVaporPressure,
    inletVaporPartialPressure,
    targetVaporPartialPressure,
    inletHumidityRatio,
    targetHumidityRatio,
    waterAdditionRate,
    humidityRatioIncrease,
    modelName:
      'Isothermal humidification from relative humidity and ideal moist-air relations',
    limitationDescription:
      'Assumes constant dry-bulb temperature and pressure. The required thermal duty and any evaporative cooling are not calculated.',
  }
}
