import type {
  RichardsonErrorEstimateInput,
  RichardsonErrorEstimateResult,
} from './types.ts'

export type RichardsonErrorEstimateErrorCode =
  | 'nonFiniteInput'
  | 'invalidBounds'
  | 'invalidIntervals'
  | 'invalidRefinementRatio'
  | 'invalidOrder'
  | 'numericalFailure'

const messages: Record<
  RichardsonErrorEstimateErrorCode,
  string
> = {
  nonFiniteInput:
    'All Richardson-extrapolation inputs must be finite.',
  invalidBounds:
    'Upper bound must be greater than lower bound.',
  invalidIntervals:
    'Coarse intervals must be a positive integer.',
  invalidRefinementRatio:
    'Refinement ratio must be an integer of at least two.',
  invalidOrder:
    'Assumed method order must be greater than zero.',
  numericalFailure:
    'The Richardson estimate produced a non-finite result.',
}

export class RichardsonErrorEstimateCalculationError extends Error {
  readonly code: RichardsonErrorEstimateErrorCode

  constructor(code: RichardsonErrorEstimateErrorCode) {
    super(messages[code])
    this.name = 'RichardsonErrorEstimateCalculationError'
    this.code = code
  }
}

function polynomial(
  x: number,
  input: RichardsonErrorEstimateInput,
): number {
  return (
    input.coefficient3 * x ** 3 +
    input.coefficient2 * x ** 2 +
    input.coefficient1 * x +
    input.coefficient0
  )
}

function trapezoidal(
  intervals: number,
  input: RichardsonErrorEstimateInput,
): number {
  const h =
    (input.upperBound - input.lowerBound) /
    intervals

  let sum =
    0.5 *
    (
      polynomial(input.lowerBound, input) +
      polynomial(input.upperBound, input)
    )

  for (let i = 1; i < intervals; i += 1) {
    sum += polynomial(
      input.lowerBound + i * h,
      input,
    )
  }

  return h * sum
}

export function calculateRichardsonErrorEstimate(
  input: RichardsonErrorEstimateInput,
): RichardsonErrorEstimateResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new RichardsonErrorEstimateCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.upperBound <= input.lowerBound) {
    throw new RichardsonErrorEstimateCalculationError(
      'invalidBounds',
    )
  }

  if (
    !Number.isInteger(input.coarseIntervals) ||
    input.coarseIntervals <= 0
  ) {
    throw new RichardsonErrorEstimateCalculationError(
      'invalidIntervals',
    )
  }

  if (
    !Number.isInteger(input.refinementRatio) ||
    input.refinementRatio < 2
  ) {
    throw new RichardsonErrorEstimateCalculationError(
      'invalidRefinementRatio',
    )
  }

  if (input.assumedOrder <= 0) {
    throw new RichardsonErrorEstimateCalculationError(
      'invalidOrder',
    )
  }

  const fineIntervals =
    input.coarseIntervals *
    input.refinementRatio

  const coarseEstimate =
    trapezoidal(input.coarseIntervals, input)

  const fineEstimate =
    trapezoidal(fineIntervals, input)

  const denominator =
    input.refinementRatio ** input.assumedOrder -
    1

  const estimatedFineError =
    (fineEstimate - coarseEstimate) /
    denominator

  const extrapolatedEstimate =
    fineEstimate + estimatedFineError

  const antiderivative = (x: number) =>
    input.coefficient3 * x ** 4 / 4 +
    input.coefficient2 * x ** 3 / 3 +
    input.coefficient1 * x ** 2 / 2 +
    input.coefficient0 * x

  const exactIntegral =
    antiderivative(input.upperBound) -
    antiderivative(input.lowerBound)

  const actualFineError =
    exactIntegral - fineEstimate

  const effectivityIndex =
    Math.abs(actualFineError) < 1e-30
      ? Math.abs(estimatedFineError) < 1e-30
        ? 1
        : 0
      : estimatedFineError / actualFineError

  const results = [
    coarseEstimate,
    fineEstimate,
    extrapolatedEstimate,
    estimatedFineError,
    exactIntegral,
    actualFineError,
    effectivityIndex,
  ]

  if (!results.every(Number.isFinite)) {
    throw new RichardsonErrorEstimateCalculationError(
      'numericalFailure',
    )
  }

  return {
    coarseEstimate,
    fineEstimate,
    extrapolatedEstimate,
    estimatedFineError,
    exactIntegral,
    actualFineError,
    effectivityIndex,
    modelName:
      'Richardson error estimate for composite trapezoidal integration',
    limitationDescription:
      'The asymptotic estimate assumes the dominant discretization error follows hᵖ. The demonstration integrand is a cubic polynomial.',
  }
}
