import type {
  ConstantPressureFiltrationInput,
  ConstantPressureFiltrationResult,
} from './types.ts'

export type ConstantPressureFiltrationErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'numericalFailure'

export class ConstantPressureFiltrationCalculationError extends Error {
  readonly code: ConstantPressureFiltrationErrorCode

  constructor(code: ConstantPressureFiltrationErrorCode) {
    super(
      code === 'nonFiniteInput'
        ? 'All filtration inputs must be finite.'
        : code === 'nonPositiveProperty'
          ? 'Viscosity, pressure drop, filter area, specific cake resistance, slurry solids concentration, medium resistance and target filtrate volume must be greater than zero.'
          : 'The constant-pressure filtration calculation did not produce finite physical results.',
    )
    this.name = 'ConstantPressureFiltrationCalculationError'
    this.code = code
  }
}

export function calculateConstantPressureFiltration(
  input: ConstantPressureFiltrationInput,
): ConstantPressureFiltrationResult {
  const values = [
    input.filtrateViscosity,
    input.pressureDrop,
    input.filterArea,
    input.specificCakeResistance,
    input.slurrySolidsPerFiltrateVolume,
    input.filterMediumResistance,
    input.targetFiltrateVolume,
  ]

  if (!values.every(Number.isFinite)) {
    throw new ConstantPressureFiltrationCalculationError('nonFiniteInput')
  }

  if (!values.every((value) => value > 0)) {
    throw new ConstantPressureFiltrationCalculationError(
      'nonPositiveProperty',
    )
  }

  const areaSquared = input.filterArea * input.filterArea
  const cakeTerm =
    (input.specificCakeResistance *
      input.slurrySolidsPerFiltrateVolume *
      input.targetFiltrateVolume *
      input.targetFiltrateVolume) /
    (2 * areaSquared)
  const mediumTerm =
    (input.filterMediumResistance * input.targetFiltrateVolume) /
    input.filterArea

  const filtrationTime =
    (input.filtrateViscosity / input.pressureDrop) *
    (cakeTerm + mediumTerm)
  const depositedCakeMass =
    input.slurrySolidsPerFiltrateVolume * input.targetFiltrateVolume
  const finalCakeResistance =
    (input.specificCakeResistance * depositedCakeMass) / input.filterArea
  const finalTotalResistance =
    input.filterMediumResistance + finalCakeResistance
  const initialFiltrateFlowRate =
    (input.pressureDrop * input.filterArea) /
    (input.filtrateViscosity * input.filterMediumResistance)
  const finalFiltrateFlowRate =
    (input.pressureDrop * input.filterArea) /
    (input.filtrateViscosity * finalTotalResistance)
  const averageFiltrateFlowRate =
    input.targetFiltrateVolume / filtrationTime
  const filtrationPlotSlope =
    (input.filtrateViscosity *
      input.specificCakeResistance *
      input.slurrySolidsPerFiltrateVolume) /
    (2 * input.pressureDrop * areaSquared)
  const filtrationPlotIntercept =
    (input.filtrateViscosity * input.filterMediumResistance) /
    (input.pressureDrop * input.filterArea)
  const cakeResistanceFraction =
    finalCakeResistance / finalTotalResistance
  const mediumResistanceFraction =
    input.filterMediumResistance / finalTotalResistance

  const results = [
    filtrationTime,
    averageFiltrateFlowRate,
    initialFiltrateFlowRate,
    finalFiltrateFlowRate,
    depositedCakeMass,
    finalCakeResistance,
    finalTotalResistance,
    filtrationPlotSlope,
    filtrationPlotIntercept,
    cakeResistanceFraction,
    mediumResistanceFraction,
  ]

  if (
    !results.every(Number.isFinite) ||
    filtrationTime <= 0 ||
    averageFiltrateFlowRate <= 0 ||
    initialFiltrateFlowRate <= 0 ||
    finalFiltrateFlowRate <= 0 ||
    finalFiltrateFlowRate >= initialFiltrateFlowRate ||
    depositedCakeMass <= 0 ||
    finalCakeResistance <= 0 ||
    finalTotalResistance <= input.filterMediumResistance ||
    cakeResistanceFraction <= 0 ||
    cakeResistanceFraction >= 1 ||
    mediumResistanceFraction <= 0 ||
    mediumResistanceFraction >= 1
  ) {
    throw new ConstantPressureFiltrationCalculationError('numericalFailure')
  }

  return {
    filtrationTime,
    averageFiltrateFlowRate,
    initialFiltrateFlowRate,
    finalFiltrateFlowRate,
    depositedCakeMass,
    finalCakeResistance,
    finalTotalResistance,
    filtrationPlotSlope,
    filtrationPlotIntercept,
    cakeResistanceFraction,
    mediumResistanceFraction,
    modelName: 'Incompressible-cake constant-pressure filtration model',
    limitationDescription:
      'Assumes constant pressure drop, constant filtrate viscosity, incompressible cake, constant specific cake resistance and no sedimentation or filter-area change.',
  }
}
