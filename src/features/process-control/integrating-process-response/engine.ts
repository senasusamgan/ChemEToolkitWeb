import type {
  IntegratingProcessResponseInput,
  IntegratingProcessResponseResult,
} from './types.ts'

export type IntegratingProcessResponseErrorCode =
  | 'nonFiniteInput'
  | 'negativeDeadTime'
  | 'negativeEvaluationTime'
  | 'zeroRampSlope'
  | 'numericalFailure'

const messages: Record<
  IntegratingProcessResponseErrorCode,
  string
> = {
  nonFiniteInput:
    'All integrating-process inputs must be finite.',
  negativeDeadTime:
    'Dead time cannot be negative.',
  negativeEvaluationTime:
    'Evaluation time cannot be negative.',
  zeroRampSlope:
    'Integrating gain and input step produce a zero ramp slope.',
  numericalFailure:
    'The integrating-process calculation produced a non-finite result.',
}

export class IntegratingProcessResponseCalculationError extends Error {
  readonly code: IntegratingProcessResponseErrorCode

  constructor(code: IntegratingProcessResponseErrorCode) {
    super(messages[code])
    this.name =
      'IntegratingProcessResponseCalculationError'
    this.code = code
  }
}

export function calculateIntegratingProcessResponse(
  input: IntegratingProcessResponseInput,
): IntegratingProcessResponseResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new IntegratingProcessResponseCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.deadTime < 0) {
    throw new IntegratingProcessResponseCalculationError(
      'negativeDeadTime',
    )
  }

  if (input.evaluationTime < 0) {
    throw new IntegratingProcessResponseCalculationError(
      'negativeEvaluationTime',
    )
  }

  const rampSlope =
    input.integratingGain *
    input.inputStepChange

  if (Math.abs(rampSlope) < 1e-15) {
    throw new IntegratingProcessResponseCalculationError(
      'zeroRampSlope',
    )
  }

  const activeIntegrationTime =
    Math.max(
      0,
      input.evaluationTime - input.deadTime,
    )

  const outputChange =
    rampSlope * activeIntegrationTime

  const outputAtEvaluationTime =
    input.initialOutput + outputChange

  const deadTimeCompleted =
    input.evaluationTime >= input.deadTime

  const targetOutputChange =
    Math.sign(rampSlope) *
    Math.max(
      1,
      Math.abs(input.initialOutput) * 0.1,
    )

  const timeToReachTargetChange =
    input.deadTime +
    Math.abs(targetOutputChange / rampSlope)

  const results = [
    activeIntegrationTime,
    outputChange,
    outputAtEvaluationTime,
    rampSlope,
    timeToReachTargetChange,
    targetOutputChange,
  ]

  if (!results.every(Number.isFinite)) {
    throw new IntegratingProcessResponseCalculationError(
      'numericalFailure',
    )
  }

  return {
    activeIntegrationTime,
    outputChange,
    outputAtEvaluationTime,
    rampSlope,
    deadTimeCompleted,
    timeToReachTargetChange,
    targetOutputChange,
    modelName:
      'Integrating process response G(s) = Ki exp(-θs) / s',
    limitationDescription:
      'The response assumes a constant input step, constant integrating gain and no saturation or restoring dynamics.',
  }
}
