import type {
  FeedforwardControlInput,
  FeedforwardControlResult,
} from './types.ts'

export type FeedforwardControlErrorCode =
  | 'nonFiniteInput'
  | 'zeroActualProcessGain'
  | 'zeroModelProcessGain'
  | 'invalidFeedbackDenominator'
  | 'zeroUncompensatedDeviation'
  | 'numericalFailure'

const messages: Record<FeedforwardControlErrorCode, string> = {
  nonFiniteInput:
    'All feedforward-control inputs must be finite.',
  zeroActualProcessGain:
    'Actual process gain cannot be zero.',
  zeroModelProcessGain:
    'Model process gain cannot be zero.',
  invalidFeedbackDenominator:
    'Feedback loop gain must satisfy 1 + L > 0.',
  zeroUncompensatedDeviation:
    'The disturbance must create a non-zero uncontrolled deviation.',
  numericalFailure:
    'The feedforward calculation produced a non-finite result.',
}

export class FeedforwardControlCalculationError extends Error {
  readonly code: FeedforwardControlErrorCode

  constructor(code: FeedforwardControlErrorCode) {
    super(messages[code])
    this.name = 'FeedforwardControlCalculationError'
    this.code = code
  }
}

export function calculateFeedforwardControl(
  input: FeedforwardControlInput,
): FeedforwardControlResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new FeedforwardControlCalculationError(
      'nonFiniteInput',
    )
  }

  if (Math.abs(input.actualProcessGain) < 1e-15) {
    throw new FeedforwardControlCalculationError(
      'zeroActualProcessGain',
    )
  }

  if (Math.abs(input.modelProcessGain) < 1e-15) {
    throw new FeedforwardControlCalculationError(
      'zeroModelProcessGain',
    )
  }

  const feedbackDenominator =
    1 + input.feedbackLoopGain

  if (feedbackDenominator <= 0) {
    throw new FeedforwardControlCalculationError(
      'invalidFeedbackDenominator',
    )
  }

  const idealFeedforwardGain =
    -input.actualDisturbanceGain /
    input.actualProcessGain

  const implementedFeedforwardGain =
    -input.modelDisturbanceGain /
    input.modelProcessGain

  const uncompensatedDeviation =
    input.actualDisturbanceGain *
    input.disturbanceChange

  if (Math.abs(uncompensatedDeviation) < 1e-15) {
    throw new FeedforwardControlCalculationError(
      'zeroUncompensatedDeviation',
    )
  }

  const feedforwardResidual =
    (
      input.actualDisturbanceGain +
      input.actualProcessGain *
      implementedFeedforwardGain
    ) *
    input.disturbanceChange

  const finalResidualWithFeedback =
    feedforwardResidual /
    feedbackDenominator

  const compensationPercent =
    (
      1 -
      Math.abs(finalResidualWithFeedback) /
      Math.abs(uncompensatedDeviation)
    ) *
    100

  const modelGainMismatchPercent =
    Math.abs(
      (
        implementedFeedforwardGain -
        idealFeedforwardGain
      ) /
      idealFeedforwardGain,
    ) *
    100

  const results = [
    idealFeedforwardGain,
    implementedFeedforwardGain,
    uncompensatedDeviation,
    feedforwardResidual,
    finalResidualWithFeedback,
    compensationPercent,
    modelGainMismatchPercent,
  ]

  if (!results.every(Number.isFinite)) {
    throw new FeedforwardControlCalculationError(
      'numericalFailure',
    )
  }

  return {
    idealFeedforwardGain,
    implementedFeedforwardGain,
    uncompensatedDeviation,
    feedforwardResidual,
    finalResidualWithFeedback,
    compensationPercent,
    modelGainMismatchPercent,
    modelName:
      'Static feedforward compensation followed by feedback attenuation',
    limitationDescription:
      'The calculation uses steady-state scalar gains. Real feedforward design must also match disturbance and manipulated-variable dynamics.',
  }
}
