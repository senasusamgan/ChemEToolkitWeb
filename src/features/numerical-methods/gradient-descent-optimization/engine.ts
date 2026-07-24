import type {
  GradientDescentOptimizationInput,
  GradientDescentOptimizationResult,
} from './types.ts'

export type GradientDescentOptimizationErrorCode =
  | 'nonFiniteInput'
  | 'notPositiveDefinite'
  | 'invalidLearningRate'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'numericalFailure'

const messages: Record<
  GradientDescentOptimizationErrorCode,
  string
> = {
  nonFiniteInput:
    'All gradient-descent inputs must be finite.',
  notPositiveDefinite:
    'The quadratic Hessian must be positive definite.',
  invalidLearningRate:
    'Learning rate must be greater than zero and below 2/λmax.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  numericalFailure:
    'The optimization produced a non-finite result.',
}

export class GradientDescentOptimizationCalculationError extends Error {
  readonly code: GradientDescentOptimizationErrorCode

  constructor(code: GradientDescentOptimizationErrorCode) {
    super(messages[code])
    this.name =
      'GradientDescentOptimizationCalculationError'
    this.code = code
  }
}

export function calculateGradientDescentOptimization(
  input: GradientDescentOptimizationInput,
): GradientDescentOptimizationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new GradientDescentOptimizationCalculationError(
      'nonFiniteInput',
    )
  }

  const determinant =
    input.q11 * input.q22 -
    input.q12 ** 2

  if (
    input.q11 <= 0 ||
    determinant <= 0
  ) {
    throw new GradientDescentOptimizationCalculationError(
      'notPositiveDefinite',
    )
  }

  const trace = input.q11 + input.q22
  const discriminant = Math.sqrt(
    (input.q11 - input.q22) ** 2 +
    4 * input.q12 ** 2,
  )
  const largestEigenvalue =
    0.5 * (trace + discriminant)

  if (
    input.learningRate <= 0 ||
    input.learningRate >=
      2 / largestEigenvalue
  ) {
    throw new GradientDescentOptimizationCalculationError(
      'invalidLearningRate',
    )
  }

  if (input.tolerance <= 0) {
    throw new GradientDescentOptimizationCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new GradientDescentOptimizationCalculationError(
      'invalidMaximumIterations',
    )
  }

  let x = input.initialX
  let y = input.initialY
  let iterations = 0
  let gradientX =
    input.q11 * x +
    input.q12 * y +
    input.c1
  let gradientY =
    input.q12 * x +
    input.q22 * y +
    input.c2
  let gradientNorm =
    Math.hypot(gradientX, gradientY)
  let converged =
    gradientNorm <= input.tolerance

  while (
    !converged &&
    iterations < input.maximumIterations
  ) {
    x -= input.learningRate * gradientX
    y -= input.learningRate * gradientY
    iterations += 1

    gradientX =
      input.q11 * x +
      input.q12 * y +
      input.c1
    gradientY =
      input.q12 * x +
      input.q22 * y +
      input.c2
    gradientNorm =
      Math.hypot(gradientX, gradientY)
    converged =
      gradientNorm <= input.tolerance
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

  const exactOptimumX =
    (
      input.q12 * input.c2 -
      input.q22 * input.c1
    ) /
    determinant

  const exactOptimumY =
    (
      input.q12 * input.c1 -
      input.q11 * input.c2
    ) /
    determinant

  const distanceToExactOptimum =
    Math.hypot(
      x - exactOptimumX,
      y - exactOptimumY,
    )

  const results = [
    x,
    y,
    objectiveValue,
    gradientNorm,
    exactOptimumX,
    exactOptimumY,
    distanceToExactOptimum,
  ]

  if (!results.every(Number.isFinite)) {
    throw new GradientDescentOptimizationCalculationError(
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
    exactOptimumX,
    exactOptimumY,
    distanceToExactOptimum,
    modelName:
      'Fixed-step gradient descent on a convex two-variable quadratic',
    limitationDescription:
      'The objective is f = ½xᵀQx + cᵀx with symmetric positive-definite Q. The learning rate must remain below the stability limit.',
  }
}
