import type {
  NaturalCubicSplineInterpolationInput,
  NaturalCubicSplineInterpolationResult,
} from './types.ts'

export type NaturalCubicSplineInterpolationErrorCode =
  | 'nonFiniteInput'
  | 'nonIncreasingCoordinates'
  | 'evaluationOutsideRange'
  | 'singularSystem'
  | 'numericalFailure'

const messages: Record<
  NaturalCubicSplineInterpolationErrorCode,
  string
> = {
  nonFiniteInput:
    'All natural-spline inputs must be finite.',
  nonIncreasingCoordinates:
    'The x coordinates must be strictly increasing.',
  evaluationOutsideRange:
    'Evaluation x must lie between the first and fourth data coordinates.',
  singularSystem:
    'The spline system could not be solved.',
  numericalFailure:
    'The spline interpolation produced a non-finite result.',
}

export class NaturalCubicSplineInterpolationCalculationError extends Error {
  readonly code: NaturalCubicSplineInterpolationErrorCode

  constructor(code: NaturalCubicSplineInterpolationErrorCode) {
    super(messages[code])
    this.name =
      'NaturalCubicSplineInterpolationCalculationError'
    this.code = code
  }
}

export function calculateNaturalCubicSplineInterpolation(
  input: NaturalCubicSplineInterpolationInput,
): NaturalCubicSplineInterpolationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new NaturalCubicSplineInterpolationCalculationError(
      'nonFiniteInput',
    )
  }

  const x = [input.x1, input.x2, input.x3, input.x4]
  const y = [input.y1, input.y2, input.y3, input.y4]

  if (
    !(x[0] < x[1] && x[1] < x[2] && x[2] < x[3])
  ) {
    throw new NaturalCubicSplineInterpolationCalculationError(
      'nonIncreasingCoordinates',
    )
  }

  if (
    input.evaluationX < x[0] ||
    input.evaluationX > x[3]
  ) {
    throw new NaturalCubicSplineInterpolationCalculationError(
      'evaluationOutsideRange',
    )
  }

  const h0 = x[1] - x[0]
  const h1 = x[2] - x[1]
  const h2 = x[3] - x[2]

  const rhs1 =
    6 *
    (
      (y[2] - y[1]) / h1 -
      (y[1] - y[0]) / h0
    )

  const rhs2 =
    6 *
    (
      (y[3] - y[2]) / h2 -
      (y[2] - y[1]) / h1
    )

  const a11 = 2 * (h0 + h1)
  const a12 = h1
  const a21 = h1
  const a22 = 2 * (h1 + h2)

  const determinant = a11 * a22 - a12 * a21

  if (Math.abs(determinant) < 1e-15) {
    throw new NaturalCubicSplineInterpolationCalculationError(
      'singularSystem',
    )
  }

  const m1 =
    (rhs1 * a22 - a12 * rhs2) /
    determinant

  const m2 =
    (a11 * rhs2 - rhs1 * a21) /
    determinant

  const secondDerivatives = [0, m1, m2, 0]

  let intervalIndex = 0

  if (input.evaluationX >= x[2]) {
    intervalIndex = 2
  } else if (input.evaluationX >= x[1]) {
    intervalIndex = 1
  }

  const leftX = x[intervalIndex]
  const rightX = x[intervalIndex + 1]
  const leftY = y[intervalIndex]
  const rightY = y[intervalIndex + 1]
  const leftM = secondDerivatives[intervalIndex]
  const rightM = secondDerivatives[intervalIndex + 1]
  const h = rightX - leftX
  const a = (rightX - input.evaluationX) / h
  const b = (input.evaluationX - leftX) / h

  const interpolatedValue =
    a * leftY +
    b * rightY +
    (
      (a ** 3 - a) * leftM +
      (b ** 3 - b) * rightM
    ) *
    h ** 2 /
    6

  const interpolatedFirstDerivative =
    (rightY - leftY) / h +
    h *
    (
      (-3 * a ** 2 + 1) * leftM +
      (3 * b ** 2 - 1) * rightM
    ) /
    6

  const interpolatedSecondDerivative =
    a * leftM + b * rightM

  const results = [
    interpolatedValue,
    interpolatedFirstDerivative,
    interpolatedSecondDerivative,
    ...secondDerivatives,
  ]

  if (!results.every(Number.isFinite)) {
    throw new NaturalCubicSplineInterpolationCalculationError(
      'numericalFailure',
    )
  }

  return {
    interpolatedValue,
    interpolatedFirstDerivative,
    interpolatedSecondDerivative,
    intervalIndex: intervalIndex + 1,
    secondDerivative1: secondDerivatives[0],
    secondDerivative2: secondDerivatives[1],
    secondDerivative3: secondDerivatives[2],
    secondDerivative4: secondDerivatives[3],
    modelName:
      'Natural cubic spline through four ordered data points',
    limitationDescription:
      'The spline imposes zero second derivative at the first and last points. Extrapolation outside the data range is disabled.',
  }
}
