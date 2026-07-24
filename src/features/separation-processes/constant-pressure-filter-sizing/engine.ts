import type {
  ConstantPressureFilterSizingInput,
  ConstantPressureFilterSizingResult,
} from './types.ts'

export type ConstantPressureFilterSizingErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeMediumResistance'
  | 'numericalFailure'

const messages: Record<
  ConstantPressureFilterSizingErrorCode,
  string
> = {
  nonFiniteInput:
    'All constant-pressure filtration inputs must be finite.',
  nonPositiveProperty:
    'Viscosity, cake resistance, solids loading, filter area, pressure drop and target filtrate volume must be greater than zero.',
  negativeMediumResistance:
    'Filter-medium resistance cannot be negative.',
  numericalFailure:
    'The constant-pressure filtration calculation did not produce a finite physical result.',
}

export class ConstantPressureFilterSizingCalculationError extends Error {
  readonly code: ConstantPressureFilterSizingErrorCode

  constructor(code: ConstantPressureFilterSizingErrorCode) {
    super(messages[code])
    this.name =
      'ConstantPressureFilterSizingCalculationError'
    this.code = code
  }
}

export function calculateConstantPressureFilterSizing(
  input: ConstantPressureFilterSizingInput,
): ConstantPressureFilterSizingResult {
  const values = [
    input.filtrateViscosity,
    input.specificCakeResistance,
    input.drySolidsPerFiltrateVolume,
    input.filterArea,
    input.pressureDrop,
    input.filterMediumResistance,
    input.targetFiltrateVolume,
  ]

  if (!values.every(Number.isFinite)) {
    throw new ConstantPressureFilterSizingCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.filtrateViscosity <= 0 ||
    input.specificCakeResistance <= 0 ||
    input.drySolidsPerFiltrateVolume <= 0 ||
    input.filterArea <= 0 ||
    input.pressureDrop <= 0 ||
    input.targetFiltrateVolume <= 0
  ) {
    throw new ConstantPressureFilterSizingCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.filterMediumResistance < 0) {
    throw new ConstantPressureFilterSizingCalculationError(
      'negativeMediumResistance',
    )
  }

  const cakeTime =
    (
      input.filtrateViscosity *
      input.specificCakeResistance *
      input.drySolidsPerFiltrateVolume *
      input.targetFiltrateVolume ** 2
    ) /
    (
      2 *
      input.filterArea ** 2 *
      input.pressureDrop
    )

  const mediumTime =
    (
      input.filtrateViscosity *
      input.filterMediumResistance *
      input.targetFiltrateVolume
    ) /
    (
      input.filterArea *
      input.pressureDrop
    )

  const totalFiltrationTime =
    cakeTime + mediumTime

  const averageFiltrateRate =
    input.targetFiltrateVolume /
    totalFiltrationTime

  const cakeResistanceAtTarget =
    (
      input.specificCakeResistance *
      input.drySolidsPerFiltrateVolume *
      input.targetFiltrateVolume
    ) /
    input.filterArea

  const totalResistanceAtTarget =
    input.filterMediumResistance +
    cakeResistanceAtTarget

  const finalInstantaneousRate =
    (
      input.filterArea *
      input.pressureDrop
    ) /
    (
      input.filtrateViscosity *
      totalResistanceAtTarget
    )

  const results = [
    cakeTime,
    mediumTime,
    totalFiltrationTime,
    averageFiltrateRate,
    finalInstantaneousRate,
    cakeResistanceAtTarget,
    totalResistanceAtTarget,
  ]

  if (
    !results.every(Number.isFinite) ||
    cakeTime <= 0 ||
    mediumTime < 0 ||
    totalFiltrationTime <= 0 ||
    averageFiltrateRate <= 0 ||
    finalInstantaneousRate <= 0 ||
    cakeResistanceAtTarget <= 0 ||
    totalResistanceAtTarget <= 0
  ) {
    throw new ConstantPressureFilterSizingCalculationError(
      'numericalFailure',
    )
  }

  return {
    cakeTime,
    mediumTime,
    totalFiltrationTime,
    averageFiltrateRate,
    finalInstantaneousRate,
    cakeResistanceAtTarget,
    totalResistanceAtTarget,
    modelName:
      'Ruth constant-pressure cake-filtration equation',
    limitationDescription:
      'Assumes incompressible cake resistance, constant filtrate properties and constant applied pressure.',
  }
}
