import type {
  ClosedLoopFeedbackAnalysisInput,
  ClosedLoopFeedbackAnalysisResult,
} from './types.ts'

export type ClosedLoopFeedbackAnalysisErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveGain'
  | 'nonPositiveTimeConstant'
  | 'negativeEvaluationTime'
  | 'unstableLoopDenominator'
  | 'numericalFailure'

const messages: Record<
  ClosedLoopFeedbackAnalysisErrorCode,
  string
> = {
  nonFiniteInput:
    'All closed-loop inputs must be finite.',
  nonPositiveGain:
    'Controller, process and measurement gains must be greater than zero.',
  nonPositiveTimeConstant:
    'Process time constant must be greater than zero.',
  negativeEvaluationTime:
    'Evaluation time cannot be negative.',
  unstableLoopDenominator:
    'The negative-feedback denominator 1 + KcKpH must be positive.',
  numericalFailure:
    'The closed-loop calculation produced a non-finite result.',
}

export class ClosedLoopFeedbackAnalysisCalculationError
  extends Error {
  readonly code: ClosedLoopFeedbackAnalysisErrorCode

  constructor(code: ClosedLoopFeedbackAnalysisErrorCode) {
    super(messages[code])
    this.name =
      'ClosedLoopFeedbackAnalysisCalculationError'
    this.code = code
  }
}

export function calculateClosedLoopFeedbackAnalysis(
  input: ClosedLoopFeedbackAnalysisInput,
): ClosedLoopFeedbackAnalysisResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new ClosedLoopFeedbackAnalysisCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.controllerGain <= 0 ||
    input.processGain <= 0 ||
    input.measurementGain <= 0
  ) {
    throw new ClosedLoopFeedbackAnalysisCalculationError(
      'nonPositiveGain',
    )
  }

  if (input.processTimeConstant <= 0) {
    throw new ClosedLoopFeedbackAnalysisCalculationError(
      'nonPositiveTimeConstant',
    )
  }

  if (input.evaluationTime < 0) {
    throw new ClosedLoopFeedbackAnalysisCalculationError(
      'negativeEvaluationTime',
    )
  }

  const loopGain =
    input.controllerGain *
    input.processGain *
    input.measurementGain
  const denominator = 1 + loopGain

  if (denominator <= 0) {
    throw new ClosedLoopFeedbackAnalysisCalculationError(
      'unstableLoopDenominator',
    )
  }

  const closedLoopSetpointGain =
    (input.controllerGain * input.processGain) / denominator
  const closedLoopDisturbanceGain = 1 / denominator
  const closedLoopTimeConstant =
    input.processTimeConstant / denominator
  const steadyStateOutput =
    closedLoopSetpointGain * input.setpointStep +
    closedLoopDisturbanceGain * input.loadDisturbance
  const responseFraction =
    1 -
    Math.exp(
      -input.evaluationTime / closedLoopTimeConstant,
    )
  const outputAtEvaluationTime =
    steadyStateOutput * responseFraction
  const steadyStateError =
    input.setpointStep -
    input.measurementGain * steadyStateOutput

  const results = [
    loopGain,
    closedLoopSetpointGain,
    closedLoopDisturbanceGain,
    closedLoopTimeConstant,
    steadyStateOutput,
    outputAtEvaluationTime,
    responseFraction,
    steadyStateError,
  ]

  if (!results.every(Number.isFinite)) {
    throw new ClosedLoopFeedbackAnalysisCalculationError(
      'numericalFailure',
    )
  }

  return {
    loopGain,
    closedLoopSetpointGain,
    closedLoopDisturbanceGain,
    closedLoopTimeConstant,
    steadyStateOutput,
    outputAtEvaluationTime,
    responseFraction,
    steadyStateError,
    modelName:
      'Proportional control of a first-order process with negative feedback',
    limitationDescription:
      'The model neglects dead time, actuator saturation, measurement dynamics and higher-order process behavior.',
  }
}
