import type {
  PsychrometricAirStreamMixingInput,
  PsychrometricAirStreamMixingResult,
} from './types.ts'

export type PsychrometricAirStreamMixingErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveFlow'
  | 'negativeHumidityRatio'
  | 'temperatureOutOfRange'
  | 'numericalFailure'

const messages: Record<
  PsychrometricAirStreamMixingErrorCode,
  string
> = {
  nonFiniteInput:
    'All moist-air mixing inputs must be finite.',
  nonPositiveFlow:
    'Both dry-air flow rates must be greater than zero.',
  negativeHumidityRatio:
    'Humidity ratios cannot be negative.',
  temperatureOutOfRange:
    'Dry-bulb temperatures must be above absolute zero.',
  numericalFailure:
    'The moist-air mixing calculation did not produce finite physical results.',
}

export class PsychrometricAirStreamMixingCalculationError extends Error {
  readonly code: PsychrometricAirStreamMixingErrorCode

  constructor(code: PsychrometricAirStreamMixingErrorCode) {
    super(messages[code])
    this.name =
      'PsychrometricAirStreamMixingCalculationError'
    this.code = code
  }
}

function moistAirEnthalpy(
  dryBulbTemperature: number,
  humidityRatio: number,
): number {
  return (
    1.006 *
    dryBulbTemperature +
    humidityRatio *
    (
      2501 +
      1.86 *
      dryBulbTemperature
    )
  )
}

export function calculatePsychrometricAirStreamMixing(
  input: PsychrometricAirStreamMixingInput,
): PsychrometricAirStreamMixingResult {
  const values = [
    input.dryAirFlowRate1,
    input.dryBulbTemperature1,
    input.humidityRatio1,
    input.dryAirFlowRate2,
    input.dryBulbTemperature2,
    input.humidityRatio2,
  ]

  if (!values.every(Number.isFinite)) {
    throw new PsychrometricAirStreamMixingCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.dryAirFlowRate1 <= 0 ||
    input.dryAirFlowRate2 <= 0
  ) {
    throw new PsychrometricAirStreamMixingCalculationError(
      'nonPositiveFlow',
    )
  }

  if (
    input.humidityRatio1 < 0 ||
    input.humidityRatio2 < 0
  ) {
    throw new PsychrometricAirStreamMixingCalculationError(
      'negativeHumidityRatio',
    )
  }

  if (
    input.dryBulbTemperature1 <= -273.15 ||
    input.dryBulbTemperature2 <= -273.15
  ) {
    throw new PsychrometricAirStreamMixingCalculationError(
      'temperatureOutOfRange',
    )
  }

  const totalDryAirFlowRate =
    input.dryAirFlowRate1 +
    input.dryAirFlowRate2

  const mixedHumidityRatio =
    (
      input.dryAirFlowRate1 *
      input.humidityRatio1 +
      input.dryAirFlowRate2 *
      input.humidityRatio2
    ) /
    totalDryAirFlowRate

  const enthalpy1 =
    moistAirEnthalpy(
      input.dryBulbTemperature1,
      input.humidityRatio1,
    )

  const enthalpy2 =
    moistAirEnthalpy(
      input.dryBulbTemperature2,
      input.humidityRatio2,
    )

  const mixedEnthalpy =
    (
      input.dryAirFlowRate1 *
      enthalpy1 +
      input.dryAirFlowRate2 *
      enthalpy2
    ) /
    totalDryAirFlowRate

  const mixedDryBulbTemperature =
    (
      mixedEnthalpy -
      2501 *
      mixedHumidityRatio
    ) /
    (
      1.006 +
      1.86 *
      mixedHumidityRatio
    )

  const waterVaporFlowRate =
    totalDryAirFlowRate *
    mixedHumidityRatio

  const energyBalanceResidual =
    input.dryAirFlowRate1 *
    enthalpy1 +
    input.dryAirFlowRate2 *
    enthalpy2 -
    totalDryAirFlowRate *
    mixedEnthalpy

  const results = [
    totalDryAirFlowRate,
    mixedHumidityRatio,
    enthalpy1,
    enthalpy2,
    mixedEnthalpy,
    mixedDryBulbTemperature,
    waterVaporFlowRate,
    energyBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    totalDryAirFlowRate <= 0 ||
    mixedHumidityRatio < 0 ||
    waterVaporFlowRate < 0
  ) {
    throw new PsychrometricAirStreamMixingCalculationError(
      'numericalFailure',
    )
  }

  return {
    totalDryAirFlowRate,
    mixedHumidityRatio,
    enthalpy1,
    enthalpy2,
    mixedEnthalpy,
    mixedDryBulbTemperature,
    waterVaporFlowRate,
    energyBalanceResidual,
    modelName:
      'Adiabatic mixing of two moist-air streams on a dry-air basis',
    limitationDescription:
      'Uses the standard ideal moist-air enthalpy approximation with temperatures in °C and humidity ratio in kg water/kg dry air. Condensation during mixing is not checked.',
  }
}
