import type {
  GainSchedulingInput,
  GainSchedulingResult,
} from './types.ts'

export type GainSchedulingErrorCode =
  | 'nonFiniteInput'
  | 'invalidOperatingRange'
  | 'nonPositiveControllerGain'
  | 'nonPositiveIntegralTime'
  | 'negativeDerivativeTime'
  | 'numericalFailure'

const messages: Record<GainSchedulingErrorCode, string> = {
  nonFiniteInput:
    'All gain-scheduling inputs must be finite.',
  invalidOperatingRange:
    'High operating point must be greater than low operating point.',
  nonPositiveControllerGain:
    'Both scheduled controller gains must be greater than zero.',
  nonPositiveIntegralTime:
    'Both scheduled integral times must be greater than zero.',
  negativeDerivativeTime:
    'Scheduled derivative times cannot be negative.',
  numericalFailure:
    'The gain-scheduling calculation produced a non-finite result.',
}

export class GainSchedulingCalculationError extends Error {
  readonly code: GainSchedulingErrorCode

  constructor(code: GainSchedulingErrorCode) {
    super(messages[code])
    this.name = 'GainSchedulingCalculationError'
    this.code = code
  }
}

function interpolate(
  lowValue: number,
  highValue: number,
  fraction: number,
): number {
  return (
    lowValue +
    fraction * (highValue - lowValue)
  )
}

export function calculateGainScheduling(
  input: GainSchedulingInput,
): GainSchedulingResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new GainSchedulingCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.highOperatingPoint <=
    input.lowOperatingPoint
  ) {
    throw new GainSchedulingCalculationError(
      'invalidOperatingRange',
    )
  }

  if (
    input.lowControllerGain <= 0 ||
    input.highControllerGain <= 0
  ) {
    throw new GainSchedulingCalculationError(
      'nonPositiveControllerGain',
    )
  }

  if (
    input.lowIntegralTime <= 0 ||
    input.highIntegralTime <= 0
  ) {
    throw new GainSchedulingCalculationError(
      'nonPositiveIntegralTime',
    )
  }

  if (
    input.lowDerivativeTime < 0 ||
    input.highDerivativeTime < 0
  ) {
    throw new GainSchedulingCalculationError(
      'negativeDerivativeTime',
    )
  }

  const effectiveOperatingPoint =
    Math.min(
      input.highOperatingPoint,
      Math.max(
        input.lowOperatingPoint,
        input.operatingPoint,
      ),
    )

  const wasClamped =
    effectiveOperatingPoint !== input.operatingPoint

  const interpolationFraction =
    (
      effectiveOperatingPoint -
      input.lowOperatingPoint
    ) /
    (
      input.highOperatingPoint -
      input.lowOperatingPoint
    )

  const scheduledControllerGain =
    interpolate(
      input.lowControllerGain,
      input.highControllerGain,
      interpolationFraction,
    )

  const scheduledIntegralTime =
    interpolate(
      input.lowIntegralTime,
      input.highIntegralTime,
      interpolationFraction,
    )

  const scheduledDerivativeTime =
    interpolate(
      input.lowDerivativeTime,
      input.highDerivativeTime,
      interpolationFraction,
    )

  const scheduledIntegralGain =
    scheduledControllerGain /
    scheduledIntegralTime

  const scheduledDerivativeGain =
    scheduledControllerGain *
    scheduledDerivativeTime

  const results = [
    interpolationFraction,
    effectiveOperatingPoint,
    scheduledControllerGain,
    scheduledIntegralTime,
    scheduledDerivativeTime,
    scheduledIntegralGain,
    scheduledDerivativeGain,
  ]

  if (!results.every(Number.isFinite)) {
    throw new GainSchedulingCalculationError(
      'numericalFailure',
    )
  }

  return {
    interpolationFraction,
    effectiveOperatingPoint,
    scheduledControllerGain,
    scheduledIntegralTime,
    scheduledDerivativeTime,
    scheduledIntegralGain,
    scheduledDerivativeGain,
    wasClamped,
    modelName:
      'Linear interpolation between two PID tuning schedules',
    limitationDescription:
      'The operating point is clamped to the configured range. Bumpless transfer, hysteresis and schedule validation against closed-loop dynamics are not represented.',
  }
}
