import type {
  UltrafiltrationResistanceSeriesInput,
  UltrafiltrationResistanceSeriesResult,
} from './types.ts'

export type UltrafiltrationResistanceSeriesErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeResistance'
  | 'numericalFailure'

const messages: Record<
  UltrafiltrationResistanceSeriesErrorCode,
  string
> = {
  nonFiniteInput:
    'All ultrafiltration resistance inputs must be finite.',
  nonPositiveProperty:
    'Transmembrane pressure, viscosity, membrane resistance and area must be greater than zero.',
  negativeResistance:
    'Fouling and cake resistances cannot be negative.',
  numericalFailure:
    'The ultrafiltration resistance calculation did not produce finite physical results.',
}

export class UltrafiltrationResistanceSeriesCalculationError extends Error {
  readonly code: UltrafiltrationResistanceSeriesErrorCode

  constructor(code: UltrafiltrationResistanceSeriesErrorCode) {
    super(messages[code])
    this.name =
      'UltrafiltrationResistanceSeriesCalculationError'
    this.code = code
  }
}

export function calculateUltrafiltrationResistanceSeries(
  input: UltrafiltrationResistanceSeriesInput,
): UltrafiltrationResistanceSeriesResult {
  const values = [
    input.transmembranePressure,
    input.filtrateViscosity,
    input.membraneResistance,
    input.foulingResistance,
    input.cakeResistance,
    input.membraneArea,
  ]

  if (!values.every(Number.isFinite)) {
    throw new UltrafiltrationResistanceSeriesCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.transmembranePressure <= 0 ||
    input.filtrateViscosity <= 0 ||
    input.membraneResistance <= 0 ||
    input.membraneArea <= 0
  ) {
    throw new UltrafiltrationResistanceSeriesCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.foulingResistance < 0 ||
    input.cakeResistance < 0
  ) {
    throw new UltrafiltrationResistanceSeriesCalculationError(
      'negativeResistance',
    )
  }

  const totalResistance =
    input.membraneResistance +
    input.foulingResistance +
    input.cakeResistance

  const permeateFlux =
    input.transmembranePressure /
    (
      input.filtrateViscosity *
      totalResistance
    )

  const permeateFluxLitresPerSquareMetreHour =
    permeateFlux *
    1000 *
    3600

  const permeateFlowRate =
    permeateFlux *
    input.membraneArea *
    3600

  const membraneResistanceFraction =
    input.membraneResistance /
    totalResistance

  const foulingResistanceFraction =
    input.foulingResistance /
    totalResistance

  const cakeResistanceFraction =
    input.cakeResistance /
    totalResistance

  const results = [
    totalResistance,
    permeateFlux,
    permeateFluxLitresPerSquareMetreHour,
    permeateFlowRate,
    membraneResistanceFraction,
    foulingResistanceFraction,
    cakeResistanceFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    totalResistance <= 0 ||
    permeateFlux <= 0 ||
    permeateFluxLitresPerSquareMetreHour <= 0 ||
    permeateFlowRate <= 0
  ) {
    throw new UltrafiltrationResistanceSeriesCalculationError(
      'numericalFailure',
    )
  }

  return {
    totalResistance,
    permeateFlux,
    permeateFluxLitresPerSquareMetreHour,
    permeateFlowRate,
    membraneResistanceFraction,
    foulingResistanceFraction,
    cakeResistanceFraction,
    modelName:
      'Resistance-in-series ultrafiltration model',
    limitationDescription:
      'Assumes constant viscosity, constant transmembrane pressure and additive hydraulic resistances. Osmotic pressure and concentration polarization are not included.',
  }
}
