import type {
  PIControllerInput,
  PIControllerResult,
} from './types.ts'

export type PIControllerErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveIntegralTime'
  | 'nonPositiveSampleTime'
  | 'invalidOutputLimits'
  | 'numericalFailure'

const messages: Record<PIControllerErrorCode, string> = {
  nonFiniteInput:
    'All PI-controller inputs must be finite.',
  nonPositiveIntegralTime:
    'Integral time must be greater than zero.',
  nonPositiveSampleTime:
    'Sample time must be greater than zero.',
  invalidOutputLimits:
    'Maximum output must be greater than minimum output.',
  numericalFailure:
    'The PI-controller calculation produced a non-finite result.',
}

export class PIControllerCalculationError extends Error {
  readonly code: PIControllerErrorCode

  constructor(code: PIControllerErrorCode) {
    super(messages[code])
    this.name = 'PIControllerCalculationError'
    this.code = code
  }
}

export function calculatePIController(
  input: PIControllerInput,
): PIControllerResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new PIControllerCalculationError('nonFiniteInput')
  }

  if (input.integralTime <= 0) {
    throw new PIControllerCalculationError(
      'nonPositiveIntegralTime',
    )
  }

  if (input.sampleTime <= 0) {
    throw new PIControllerCalculationError(
      'nonPositiveSampleTime',
    )
  }

  if (input.maximumOutput <= input.minimumOutput) {
    throw new PIControllerCalculationError(
      'invalidOutputLimits',
    )
  }

  const proportionalContribution =
    input.controllerGain * input.currentError

  const updatedIntegralState =
    input.previousIntegralState +
    input.currentError * input.sampleTime

  const integralContribution =
    input.controllerGain *
    updatedIntegralState /
    input.integralTime

  const rawOutput =
    input.controllerBias +
    proportionalContribution +
    integralContribution

  const controllerOutput = Math.min(
    input.maximumOutput,
    Math.max(input.minimumOutput, rawOutput),
  )

  const outputWasLimited =
    controllerOutput !== rawOutput

  if (
    ![
      proportionalContribution,
      updatedIntegralState,
      integralContribution,
      rawOutput,
      controllerOutput,
    ].every(Number.isFinite)
  ) {
    throw new PIControllerCalculationError('numericalFailure')
  }

  return {
    proportionalContribution,
    updatedIntegralState,
    integralContribution,
    rawOutput,
    controllerOutput,
    outputWasLimited,
    modelName:
      'Discrete ideal PI controller with rectangular integration',
    limitationDescription:
      'The calculator reports saturation but does not implement anti-reset windup. The stored integral state should be managed carefully in a real controller.',
  }
}
