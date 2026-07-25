import type {
  PressureProcessDynamicsInput,
  PressureProcessDynamicsResult,
} from './types.ts'

export type PressureProcessDynamicsErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveVolume'
  | 'nonPositiveTemperature'
  | 'nonPositiveGasConstant'
  | 'negativeInflow'
  | 'nonPositiveResistance'
  | 'negativePressure'
  | 'negativeEvaluationTime'
  | 'invalidMaximumPressure'
  | 'numericalFailure'

const messages: Record<
  PressureProcessDynamicsErrorCode,
  string
> = {
  nonFiniteInput:
    'All pressure-process inputs must be finite.',
  nonPositiveVolume:
    'Vessel volume must be greater than zero.',
  nonPositiveTemperature:
    'Gas temperature must be greater than zero.',
  nonPositiveGasConstant:
    'Gas constant must be greater than zero.',
  negativeInflow:
    'Molar inflow rate cannot be negative.',
  nonPositiveResistance:
    'Pressure-flow resistance must be greater than zero.',
  negativePressure:
    'Pressures cannot be negative.',
  negativeEvaluationTime:
    'Evaluation time cannot be negative.',
  invalidMaximumPressure:
    'Maximum allowable pressure must be greater than outlet pressure.',
  numericalFailure:
    'The pressure-process calculation produced a non-finite result.',
}

export class PressureProcessDynamicsCalculationError
  extends Error {
  readonly code: PressureProcessDynamicsErrorCode

  constructor(code: PressureProcessDynamicsErrorCode) {
    super(messages[code])
    this.name = 'PressureProcessDynamicsCalculationError'
    this.code = code
  }
}

export function calculatePressureProcessDynamics(
  input: PressureProcessDynamicsInput,
): PressureProcessDynamicsResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new PressureProcessDynamicsCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.vesselVolume <= 0) {
    throw new PressureProcessDynamicsCalculationError(
      'nonPositiveVolume',
    )
  }

  if (input.gasTemperature <= 0) {
    throw new PressureProcessDynamicsCalculationError(
      'nonPositiveTemperature',
    )
  }

  if (input.gasConstant <= 0) {
    throw new PressureProcessDynamicsCalculationError(
      'nonPositiveGasConstant',
    )
  }

  if (input.molarInflowRate < 0) {
    throw new PressureProcessDynamicsCalculationError(
      'negativeInflow',
    )
  }

  if (input.pressureFlowResistance <= 0) {
    throw new PressureProcessDynamicsCalculationError(
      'nonPositiveResistance',
    )
  }

  if (
    input.outletPressure < 0 ||
    input.initialPressure < 0
  ) {
    throw new PressureProcessDynamicsCalculationError(
      'negativePressure',
    )
  }

  if (input.evaluationTime < 0) {
    throw new PressureProcessDynamicsCalculationError(
      'negativeEvaluationTime',
    )
  }

  if (
    input.maximumAllowablePressure <=
    input.outletPressure
  ) {
    throw new PressureProcessDynamicsCalculationError(
      'invalidMaximumPressure',
    )
  }

  const processTimeConstant =
    input.vesselVolume *
    input.pressureFlowResistance /
    (
      input.gasConstant *
      input.gasTemperature
    )

  const steadyStatePressure =
    input.outletPressure +
    input.pressureFlowResistance *
    input.molarInflowRate

  const exponentialFactor =
    Math.exp(
      -input.evaluationTime /
      processTimeConstant,
    )

  const pressureAtEvaluationTime =
    steadyStatePressure +
    (
      input.initialPressure -
      steadyStatePressure
    ) *
    exponentialFactor

  const molarOutflowAtEvaluationTime =
    Math.max(
      0,
      (
        pressureAtEvaluationTime -
        input.outletPressure
      ) /
      input.pressureFlowResistance,
    )

  const responseFraction =
    1 - exponentialFactor

  const pressureMargin =
    input.maximumAllowablePressure -
    pressureAtEvaluationTime

  const overpressureRisk =
    pressureAtEvaluationTime >
      input.maximumAllowablePressure ||
    steadyStatePressure >
      input.maximumAllowablePressure

  const results = [
    processTimeConstant,
    steadyStatePressure,
    pressureAtEvaluationTime,
    molarOutflowAtEvaluationTime,
    responseFraction,
    pressureMargin,
  ]

  if (!results.every(Number.isFinite)) {
    throw new PressureProcessDynamicsCalculationError(
      'numericalFailure',
    )
  }

  return {
    processTimeConstant,
    steadyStatePressure,
    pressureAtEvaluationTime,
    molarOutflowAtEvaluationTime,
    responseFraction,
    pressureMargin,
    overpressureRisk,
    modelName:
      'Isothermal ideal-gas vessel with linear pressure-driven outflow',
    limitationDescription:
      'The model assumes constant volume and temperature, ideal-gas behavior and linear outflow resistance. Compressible valve flow, relief systems and thermal effects are excluded.',
  }
}
