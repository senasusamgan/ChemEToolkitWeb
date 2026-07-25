import type {
  OpenLoopResponseInput,
  OpenLoopResponseResult,
} from './types.ts'

export type OpenLoopResponseErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveTimeConstant'
  | 'negativeDeadTime'
  | 'negativeEvaluationTime'
  | 'numericalFailure'

const messages: Record<OpenLoopResponseErrorCode, string> = {
  nonFiniteInput:
    'All open-loop response inputs must be finite.',
  nonPositiveTimeConstant:
    'Process time constant must be greater than zero.',
  negativeDeadTime:
    'Process dead time cannot be negative.',
  negativeEvaluationTime:
    'Evaluation time cannot be negative.',
  numericalFailure:
    'The open-loop calculation produced a non-finite result.',
}

export class OpenLoopResponseCalculationError extends Error {
  readonly code: OpenLoopResponseErrorCode

  constructor(code: OpenLoopResponseErrorCode) {
    super(messages[code])
    this.name = 'OpenLoopResponseCalculationError'
    this.code = code
  }
}

export function calculateOpenLoopResponse(
  input: OpenLoopResponseInput,
): OpenLoopResponseResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new OpenLoopResponseCalculationError('nonFiniteInput')
  }

  if (input.timeConstant <= 0) {
    throw new OpenLoopResponseCalculationError(
      'nonPositiveTimeConstant',
    )
  }

  if (input.deadTime < 0) {
    throw new OpenLoopResponseCalculationError('negativeDeadTime')
  }

  if (input.evaluationTime < 0) {
    throw new OpenLoopResponseCalculationError(
      'negativeEvaluationTime',
    )
  }

  const activeResponseTime = Math.max(
    0,
    input.evaluationTime - input.deadTime,
  )

  const responseFraction =
    activeResponseTime === 0
      ? 0
      : 1 - Math.exp(-activeResponseTime / input.timeConstant)

  const outputChange =
    input.processGain *
    input.inputStepChange *
    responseFraction

  const outputAtEvaluationTime =
    input.initialOutput + outputChange

  const steadyStateOutput =
    input.initialOutput +
    input.processGain * input.inputStepChange

  const initialSlopeAfterDeadTime =
    input.processGain *
    input.inputStepChange /
    input.timeConstant

  const timeToNinetyPercent =
    input.deadTime +
    Math.log(10) * input.timeConstant

  const results = [
    activeResponseTime,
    responseFraction,
    outputChange,
    outputAtEvaluationTime,
    steadyStateOutput,
    initialSlopeAfterDeadTime,
    timeToNinetyPercent,
  ]

  if (!results.every(Number.isFinite)) {
    throw new OpenLoopResponseCalculationError('numericalFailure')
  }

  return {
    activeResponseTime,
    responseFraction,
    outputChange,
    outputAtEvaluationTime,
    steadyStateOutput,
    initialSlopeAfterDeadTime,
    timeToNinetyPercent,
    modelName:
      'First-order-plus-dead-time open-loop step response',
    limitationDescription:
      'The model assumes a linear process with constant gain, one real time constant and pure dead time. Nonlinearity, disturbances and actuator limits are excluded.',
  }
}
