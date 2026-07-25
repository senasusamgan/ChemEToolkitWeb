import type {
  PDControllerInput,
  PDControllerResult,
} from './types.ts'

export type PDControllerErrorCode =
  | 'nonFiniteInput'
  | 'negativeDerivativeTime'
  | 'nonPositiveSampleTime'
  | 'invalidOutputLimits'
  | 'numericalFailure'

const messages: Record<PDControllerErrorCode, string> = {
  nonFiniteInput:
    'All PD-controller inputs must be finite.',
  negativeDerivativeTime:
    'Derivative time cannot be negative.',
  nonPositiveSampleTime:
    'Sample time must be greater than zero.',
  invalidOutputLimits:
    'Maximum output must be greater than minimum output.',
  numericalFailure:
    'The PD-controller calculation produced a non-finite result.',
}

export class PDControllerCalculationError extends Error {
  readonly code: PDControllerErrorCode

  constructor(code: PDControllerErrorCode) {
    super(messages[code])
    this.name = 'PDControllerCalculationError'
    this.code = code
  }
}

export function calculatePDController(
  input: PDControllerInput,
): PDControllerResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new PDControllerCalculationError('nonFiniteInput')
  }

  if (input.derivativeTime < 0) {
    throw new PDControllerCalculationError(
      'negativeDerivativeTime',
    )
  }

  if (input.sampleTime <= 0) {
    throw new PDControllerCalculationError(
      'nonPositiveSampleTime',
    )
  }

  if (input.maximumOutput <= input.minimumOutput) {
    throw new PDControllerCalculationError(
      'invalidOutputLimits',
    )
  }

  const errorDerivative =
    (input.currentError - input.previousError) /
    input.sampleTime

  const proportionalContribution =
    input.controllerGain * input.currentError

  const derivativeContribution =
    input.controllerGain *
    input.derivativeTime *
    errorDerivative

  const rawOutput =
    input.controllerBias +
    proportionalContribution +
    derivativeContribution

  const controllerOutput = Math.min(
    input.maximumOutput,
    Math.max(input.minimumOutput, rawOutput),
  )

  const outputWasLimited =
    controllerOutput !== rawOutput

  if (
    ![
      errorDerivative,
      proportionalContribution,
      derivativeContribution,
      rawOutput,
      controllerOutput,
    ].every(Number.isFinite)
  ) {
    throw new PDControllerCalculationError('numericalFailure')
  }

  return {
    errorDerivative,
    proportionalContribution,
    derivativeContribution,
    rawOutput,
    controllerOutput,
    outputWasLimited,
    modelName:
      'Discrete ideal PD controller with output limits',
    limitationDescription:
      'The derivative is calculated directly from error and is therefore noise-sensitive. Industrial implementations normally apply derivative filtering and derivative-on-measurement.',
  }
}
