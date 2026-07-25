import type {
  FirstOrderFrequencyResponseInput,
  FirstOrderFrequencyResponseResult,
} from './types.ts'

export type FirstOrderFrequencyResponseErrorCode =
  | 'nonFiniteInput'
  | 'zeroProcessGain'
  | 'nonPositiveTimeConstant'
  | 'negativeAngularFrequency'
  | 'numericalFailure'

const messages: Record<
  FirstOrderFrequencyResponseErrorCode,
  string
> = {
  nonFiniteInput:
    'All frequency-response inputs must be finite.',
  zeroProcessGain:
    'Process gain cannot be zero.',
  nonPositiveTimeConstant:
    'Time constant must be greater than zero.',
  negativeAngularFrequency:
    'Angular frequency cannot be negative.',
  numericalFailure:
    'The frequency-response calculation produced a non-finite result.',
}

export class FirstOrderFrequencyResponseCalculationError extends Error {
  readonly code: FirstOrderFrequencyResponseErrorCode

  constructor(code: FirstOrderFrequencyResponseErrorCode) {
    super(messages[code])
    this.name =
      'FirstOrderFrequencyResponseCalculationError'
    this.code = code
  }
}

export function calculateFirstOrderFrequencyResponse(
  input: FirstOrderFrequencyResponseInput,
): FirstOrderFrequencyResponseResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new FirstOrderFrequencyResponseCalculationError(
      'nonFiniteInput',
    )
  }

  if (Math.abs(input.processGain) < 1e-15) {
    throw new FirstOrderFrequencyResponseCalculationError(
      'zeroProcessGain',
    )
  }

  if (input.timeConstant <= 0) {
    throw new FirstOrderFrequencyResponseCalculationError(
      'nonPositiveTimeConstant',
    )
  }

  if (input.angularFrequency < 0) {
    throw new FirstOrderFrequencyResponseCalculationError(
      'negativeAngularFrequency',
    )
  }

  const normalizedFrequency =
    input.angularFrequency *
    input.timeConstant

  const denominator =
    1 + normalizedFrequency ** 2

  const realPart =
    input.processGain /
    denominator

  const rawImaginaryPart =
    -input.processGain *
    normalizedFrequency /
    denominator

  const imaginaryPart =
    Math.abs(rawImaginaryPart) < 1e-15
      ? 0
      : rawImaginaryPart

  const magnitudeRatio =
    Math.abs(input.processGain) /
    Math.sqrt(denominator)

  const magnitudeDecibels =
    20 * Math.log10(magnitudeRatio)

  const phaseRadians =
    -Math.atan(normalizedFrequency)

  const rawPhaseDegrees =
    phaseRadians * 180 / Math.PI

  const phaseDegrees =
    Math.abs(rawPhaseDegrees) < 1e-15
      ? 0
      : rawPhaseDegrees

  const cornerAngularFrequency =
    1 / input.timeConstant

  const cornerFrequencyHertz =
    cornerAngularFrequency /
    (2 * Math.PI)

  const results = [
    magnitudeRatio,
    magnitudeDecibels,
    phaseDegrees,
    realPart,
    imaginaryPart,
    cornerAngularFrequency,
    cornerFrequencyHertz,
    normalizedFrequency,
  ]

  if (!results.every(Number.isFinite)) {
    throw new FirstOrderFrequencyResponseCalculationError(
      'numericalFailure',
    )
  }

  return {
    magnitudeRatio,
    magnitudeDecibels,
    phaseDegrees,
    realPart,
    imaginaryPart,
    cornerAngularFrequency,
    cornerFrequencyHertz,
    normalizedFrequency,
    modelName:
      'Frequency response of G(s) = K / (τs + 1)',
    limitationDescription:
      'The model contains one real pole and no dead time, zero or higher-order dynamics.',
  }
}
