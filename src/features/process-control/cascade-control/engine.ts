import type {
  CascadeControlInput,
  CascadeControlResult,
} from './types.ts'

export type CascadeControlErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveGain'
  | 'unstableLoopDenominator'
  | 'numericalFailure'

const messages: Record<CascadeControlErrorCode, string> = {
  nonFiniteInput:
    'All cascade-control inputs must be finite.',
  nonPositiveGain:
    'Controller, process and measurement gains must be greater than zero for this negative-feedback screening model.',
  unstableLoopDenominator:
    'One of the nested feedback denominators is non-positive.',
  numericalFailure:
    'The cascade-control calculation produced a non-finite result.',
}

export class CascadeControlCalculationError extends Error {
  readonly code: CascadeControlErrorCode

  constructor(code: CascadeControlErrorCode) {
    super(messages[code])
    this.name = 'CascadeControlCalculationError'
    this.code = code
  }
}

export function calculateCascadeControl(
  input: CascadeControlInput,
): CascadeControlResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new CascadeControlCalculationError('nonFiniteInput')
  }

  const gains = [
    input.primaryControllerGain,
    input.secondaryControllerGain,
    input.primaryProcessGain,
    input.secondaryProcessGain,
    input.primaryMeasurementGain,
    input.secondaryMeasurementGain,
  ]

  if (!gains.every((value) => value > 0)) {
    throw new CascadeControlCalculationError('nonPositiveGain')
  }

  const secondaryLoopGain =
    input.secondaryControllerGain *
    input.secondaryProcessGain *
    input.secondaryMeasurementGain
  const secondaryDenominator = 1 + secondaryLoopGain

  if (secondaryDenominator <= 0) {
    throw new CascadeControlCalculationError(
      'unstableLoopDenominator',
    )
  }

  const secondaryClosedLoopGain =
    (input.secondaryControllerGain *
      input.secondaryProcessGain) /
    secondaryDenominator
  const secondaryDisturbanceAttenuation =
    1 / secondaryDenominator
  const primaryLoopGain =
    input.primaryControllerGain *
    input.primaryProcessGain *
    secondaryClosedLoopGain *
    input.primaryMeasurementGain
  const primaryDenominator = 1 + primaryLoopGain

  if (primaryDenominator <= 0) {
    throw new CascadeControlCalculationError(
      'unstableLoopDenominator',
    )
  }

  const primaryClosedLoopGain =
    (input.primaryControllerGain *
      input.primaryProcessGain *
      secondaryClosedLoopGain) /
    primaryDenominator
  const setpointContribution =
    primaryClosedLoopGain * input.primarySetpoint
  const disturbanceContribution =
    (input.primaryProcessGain *
      secondaryDisturbanceAttenuation *
      input.secondaryDisturbance) /
    primaryDenominator
  const primaryOutput =
    setpointContribution + disturbanceContribution

  const results = [
    secondaryLoopGain,
    secondaryClosedLoopGain,
    secondaryDisturbanceAttenuation,
    primaryLoopGain,
    primaryClosedLoopGain,
    setpointContribution,
    disturbanceContribution,
    primaryOutput,
  ]

  if (!results.every(Number.isFinite)) {
    throw new CascadeControlCalculationError('numericalFailure')
  }

  return {
    secondaryLoopGain,
    secondaryClosedLoopGain,
    secondaryDisturbanceAttenuation,
    primaryLoopGain,
    primaryClosedLoopGain,
    setpointContribution,
    disturbanceContribution,
    primaryOutput,
    modelName:
      'Nested steady-state negative-feedback cascade model',
    limitationDescription:
      'The screening model uses scalar gains and assumes the secondary loop is substantially faster than the primary loop. Dynamic interaction and actuator limits are not represented.',
  }
}
