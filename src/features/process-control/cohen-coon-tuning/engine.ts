import type {
  CohenCoonTuningInput,
  CohenCoonTuningResult,
} from './types.ts'

export type CohenCoonTuningErrorCode =
  | 'nonFiniteInput'
  | 'zeroProcessGain'
  | 'nonPositiveTimeConstant'
  | 'nonPositiveDeadTime'
  | 'numericalFailure'

const messages: Record<CohenCoonTuningErrorCode, string> = {
  nonFiniteInput:
    'All Cohen–Coon inputs must be finite.',
  zeroProcessGain:
    'Process gain cannot be zero.',
  nonPositiveTimeConstant:
    'Process time constant must be greater than zero.',
  nonPositiveDeadTime:
    'Process dead time must be greater than zero.',
  numericalFailure:
    'The Cohen–Coon tuning calculation produced a non-finite result.',
}

export class CohenCoonTuningCalculationError extends Error {
  readonly code: CohenCoonTuningErrorCode

  constructor(code: CohenCoonTuningErrorCode) {
    super(messages[code])
    this.name = 'CohenCoonTuningCalculationError'
    this.code = code
  }
}

export function calculateCohenCoonTuning(
  input: CohenCoonTuningInput,
): CohenCoonTuningResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new CohenCoonTuningCalculationError('nonFiniteInput')
  }

  if (Math.abs(input.processGain) < 1e-15) {
    throw new CohenCoonTuningCalculationError('zeroProcessGain')
  }

  if (input.processTimeConstant <= 0) {
    throw new CohenCoonTuningCalculationError(
      'nonPositiveTimeConstant',
    )
  }

  if (input.processDeadTime <= 0) {
    throw new CohenCoonTuningCalculationError(
      'nonPositiveDeadTime',
    )
  }

  const deadTimeRatio =
    input.processDeadTime / input.processTimeConstant
  const controllerGain =
    (input.processTimeConstant /
      (input.processGain * input.processDeadTime)) *
    (4 / 3 + deadTimeRatio / 4)
  const integralTime =
    (input.processDeadTime * (32 + 6 * deadTimeRatio)) /
    (13 + 8 * deadTimeRatio)
  const derivativeTime =
    (input.processDeadTime * 4) /
    (11 + 2 * deadTimeRatio)
  const integralGain = controllerGain / integralTime
  const derivativeGain = controllerGain * derivativeTime
  const recommendedSampleTime = Math.min(
    input.processDeadTime / 10,
    input.processTimeConstant / 20,
  )

  const results = [
    deadTimeRatio,
    controllerGain,
    integralTime,
    derivativeTime,
    integralGain,
    derivativeGain,
    recommendedSampleTime,
  ]

  if (!results.every(Number.isFinite)) {
    throw new CohenCoonTuningCalculationError('numericalFailure')
  }

  return {
    deadTimeRatio,
    controllerGain,
    integralTime,
    derivativeTime,
    integralGain,
    derivativeGain,
    recommendedSampleTime,
    modelName:
      'Cohen–Coon PID tuning for a first-order-plus-dead-time process',
    limitationDescription:
      'Cohen–Coon tuning can be aggressive. Validate the parameters against robustness, actuator limits, noise sensitivity and the real process before use.',
  }
}
