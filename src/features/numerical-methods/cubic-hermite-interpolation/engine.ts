import type {
  CubicHermiteInterpolationInput,
  CubicHermiteInterpolationResult,
} from './types.ts'

export type CubicHermiteInterpolationErrorCode =
  | 'nonFiniteInput'
  | 'invalidInterval'
  | 'evaluationOutsideInterval'
  | 'numericalFailure'

const messages: Record<
  CubicHermiteInterpolationErrorCode,
  string
> = {
  nonFiniteInput:
    'All Cubic Hermite inputs must be finite.',
  invalidInterval:
    'x1 must be greater than x0.',
  evaluationOutsideInterval:
    'Evaluation x must lie within [x0, x1].',
  numericalFailure:
    'The interpolation produced a non-finite result.',
}

export class CubicHermiteInterpolationCalculationError extends Error {
  readonly code: CubicHermiteInterpolationErrorCode

  constructor(code: CubicHermiteInterpolationErrorCode) {
    super(messages[code])
    this.name =
      'CubicHermiteInterpolationCalculationError'
    this.code = code
  }
}

export function calculateCubicHermiteInterpolation(
  input: CubicHermiteInterpolationInput,
): CubicHermiteInterpolationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new CubicHermiteInterpolationCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.x1 <= input.x0) {
    throw new CubicHermiteInterpolationCalculationError(
      'invalidInterval',
    )
  }

  if (
    input.evaluationX < input.x0 ||
    input.evaluationX > input.x1
  ) {
    throw new CubicHermiteInterpolationCalculationError(
      'evaluationOutsideInterval',
    )
  }

  const interval = input.x1 - input.x0
  const t =
    (input.evaluationX - input.x0) /
    interval

  const h00 =
    2 * t ** 3 -
    3 * t ** 2 +
    1
  const h10 =
    t ** 3 -
    2 * t ** 2 +
    t
  const h01 =
    -2 * t ** 3 +
    3 * t ** 2
  const h11 =
    t ** 3 -
    t ** 2

  const interpolatedValue =
    h00 * input.y0 +
    h10 * interval * input.derivative0 +
    h01 * input.y1 +
    h11 * interval * input.derivative1

  const dh00 =
    6 * t ** 2 -
    6 * t
  const dh10 =
    3 * t ** 2 -
    4 * t +
    1
  const dh01 =
    -6 * t ** 2 +
    6 * t
  const dh11 =
    3 * t ** 2 -
    2 * t

  const interpolatedDerivative =
    (
      dh00 * input.y0 +
      dh10 * interval * input.derivative0 +
      dh01 * input.y1 +
      dh11 * interval * input.derivative1
    ) /
    interval

  const results = [
    interpolatedValue,
    interpolatedDerivative,
    t,
    h00,
    h10,
    h01,
    h11,
  ]

  if (!results.every(Number.isFinite)) {
    throw new CubicHermiteInterpolationCalculationError(
      'numericalFailure',
    )
  }

  return {
    interpolatedValue,
    interpolatedDerivative,
    normalizedCoordinate: t,
    h00,
    h10,
    h01,
    h11,
    modelName:
      'Two-point cubic Hermite interpolation with specified endpoint slopes',
    limitationDescription:
      'The method exactly matches endpoint values and first derivatives. Accuracy between points depends on the supplied slope estimates.',
  }
}
