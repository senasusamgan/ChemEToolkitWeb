import type {
  ProcessControlStrategyComparisonInput,
  ProcessControlStrategyComparisonResult,
} from './types.ts'

export type ProcessControlStrategyComparisonErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveGain'
  | 'zeroUncontrolledDeviation'
  | 'numericalFailure'

const messages: Record<
  ProcessControlStrategyComparisonErrorCode,
  string
> = {
  nonFiniteInput:
    'All strategy-comparison inputs must be finite.',
  nonPositiveGain:
    'Process, feedback, measurement, secondary-controller and secondary-process gains must be greater than zero.',
  zeroUncontrolledDeviation:
    'Disturbance gain and disturbance magnitude must produce a non-zero uncontrolled deviation.',
  numericalFailure:
    'The strategy comparison produced a non-finite result.',
}

export class ProcessControlStrategyComparisonCalculationError
  extends Error {
  readonly code: ProcessControlStrategyComparisonErrorCode

  constructor(code: ProcessControlStrategyComparisonErrorCode) {
    super(messages[code])
    this.name =
      'ProcessControlStrategyComparisonCalculationError'
    this.code = code
  }
}

export function calculateProcessControlStrategyComparison(
  input: ProcessControlStrategyComparisonInput,
): ProcessControlStrategyComparisonResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new ProcessControlStrategyComparisonCalculationError(
      'nonFiniteInput',
    )
  }

  const positiveGains = [
    input.processGain,
    input.feedbackControllerGain,
    input.measurementGain,
    input.secondaryControllerGain,
    input.secondaryProcessGain,
  ]

  if (!positiveGains.every((value) => value > 0)) {
    throw new ProcessControlStrategyComparisonCalculationError(
      'nonPositiveGain',
    )
  }

  const uncontrolledDeviation =
    input.disturbanceGain * input.disturbanceMagnitude

  if (Math.abs(uncontrolledDeviation) < 1e-15) {
    throw new ProcessControlStrategyComparisonCalculationError(
      'zeroUncontrolledDeviation',
    )
  }

  const feedbackLoopGain =
    input.feedbackControllerGain *
    input.processGain *
    input.measurementGain
  const feedbackDenominator = 1 + feedbackLoopGain
  const feedbackResidual =
    uncontrolledDeviation / feedbackDenominator
  const modeledFeedforwardCompensation =
    input.feedforwardModelGain *
    input.processGain *
    input.disturbanceMagnitude
  const feedforwardFeedbackResidual =
    (uncontrolledDeviation -
      modeledFeedforwardCompensation) /
    feedbackDenominator
  const secondaryLoopGain =
    input.secondaryControllerGain *
    input.secondaryProcessGain
  const cascadeResidual =
    uncontrolledDeviation /
    (feedbackDenominator * (1 + secondaryLoopGain))

  const baseMagnitude = Math.abs(uncontrolledDeviation)
  const feedbackReductionPercent =
    (1 - Math.abs(feedbackResidual) / baseMagnitude) * 100
  const feedforwardReductionPercent =
    (1 -
      Math.abs(feedforwardFeedbackResidual) / baseMagnitude) *
    100
  const cascadeReductionPercent =
    (1 - Math.abs(cascadeResidual) / baseMagnitude) * 100

  const candidates = [
    { name: 'Feedback', residual: Math.abs(feedbackResidual) },
    {
      name: 'Feedforward + feedback',
      residual: Math.abs(feedforwardFeedbackResidual),
    },
    { name: 'Cascade', residual: Math.abs(cascadeResidual) },
  ]

  candidates.sort(
    (left, right) => left.residual - right.residual,
  )

  const bestStrategy = candidates[0].name

  const results = [
    uncontrolledDeviation,
    feedbackResidual,
    feedforwardFeedbackResidual,
    cascadeResidual,
    feedbackReductionPercent,
    feedforwardReductionPercent,
    cascadeReductionPercent,
  ]

  if (!results.every(Number.isFinite)) {
    throw new ProcessControlStrategyComparisonCalculationError(
      'numericalFailure',
    )
  }

  return {
    uncontrolledDeviation,
    feedbackResidual,
    feedforwardFeedbackResidual,
    cascadeResidual,
    feedbackReductionPercent,
    feedforwardReductionPercent,
    cascadeReductionPercent,
    bestStrategy,
    modelName:
      'Static disturbance-rejection comparison for feedback, feedforward-plus-feedback and cascade control',
    limitationDescription:
      'The comparison uses steady-state scalar gains. Strategy selection must also consider dynamics, measurement availability, model error, noise, reliability and implementation cost.',
  }
}
