import type {
  NewtonMultivariableOptimizationInput,
  NewtonMultivariableOptimizationResult,
} from './types.ts'

export type NewtonMultivariableOptimizationErrorCode =
  | 'nonFiniteInput'
  | 'singularHessian'
  | 'notPositiveDefinite'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'numericalFailure'

const messages: Record<
  NewtonMultivariableOptimizationErrorCode,
  string
> = {
  nonFiniteInput:
    'All Newton-optimization inputs must be finite.',
  singularHessian:
    'The Hessian matrix is singular.',
  notPositiveDefinite:
    'The quadratic Hessian must be positive definite for a unique minimum.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  numericalFailure:
    'The Newton optimization produced a non-finite result.',
}

export class NewtonMultivariableOptimizationCalculationError extends Error {
  readonly code: NewtonMultivariableOptimizationErrorCode

  constructor(code: NewtonMultivariableOptimizationErrorCode) {
    super(messages[code])
    this.name =
      'NewtonMultivariableOptimizationCalculationError'
    this.code = code
  }
}

export function calculateNewtonMultivariableOptimization(
  input: NewtonMultivariableOptimizationInput,
): NewtonMultivariableOptimizationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new NewtonMultivariableOptimizationCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new NewtonMultivariableOptimizationCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new NewtonMultivariableOptimizationCalculationError(
      'invalidMaximumIterations',
    )
  }

  const determinant =
    input.q11 * input.q22 -
    input.q12 ** 2

  if (Math.abs(determinant) < 1e-14) {
    throw new NewtonMultivariableOptimizationCalculationError(
      'singularHessian',
    )
  }

  if (input.q11 <= 0 || determinant <= 0) {
    throw new NewtonMultivariableOptimizationCalculationError(
      'notPositiveDefinite',
    )
  }

  let x = input.initialX
  let y = input.initialY
  let iterations = 0
  let converged = false
  let gradientX = 0
  let gradientY = 0

  while (iterations < input.maximumIterations) {
    gradientX =
      input.q11 * x +
      input.q12 * y +
      input.c1

    gradientY =
      input.q12 * x +
      input.q22 * y +
      input.c2

    const gradientNorm =
      Math.hypot(gradientX, gradientY)

    if (gradientNorm <= input.tolerance) {
      converged = true
      break
    }

    const stepX =
      (
        input.q22 * gradientX -
        input.q12 * gradientY
      ) /
      determinant

    const stepY =
      (
        -input.q12 * gradientX +
        input.q11 * gradientY
      ) /
      determinant

    x -= stepX
    y -= stepY
    iterations += 1
  }

  gradientX =
    input.q11 * x +
    input.q12 * y +
    input.c1

  gradientY =
    input.q12 * x +
    input.q22 * y +
    input.c2

  const gradientNorm =
    Math.hypot(gradientX, gradientY)

  if (gradientNorm <= input.tolerance) {
    converged = true
  }

  const objectiveValue =
    0.5 *
    (
      input.q11 * x ** 2 +
      2 * input.q12 * x * y +
      input.q22 * y ** 2
    ) +
    input.c1 * x +
    input.c2 * y

  if (
    ![
      x,
      y,
      gradientNorm,
      objectiveValue,
      determinant,
    ].every(Number.isFinite)
  ) {
    throw new NewtonMultivariableOptimizationCalculationError(
      'numericalFailure',
    )
  }

  return {
    optimumX: x,
    optimumY: y,
    objectiveValue,
    gradientNorm,
    iterations,
    converged,
    determinant,
    modelName:
      'Full Newton step for a convex two-variable quadratic objective',
    limitationDescription:
      'Because the Hessian is constant, an exact arithmetic solve reaches the minimizer in one Newton step from any starting point.',
  }
}
