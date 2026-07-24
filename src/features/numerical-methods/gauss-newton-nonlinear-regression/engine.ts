import type {
  GaussNewtonNonlinearRegressionInput,
  GaussNewtonNonlinearRegressionResult,
} from './types.ts'

export type GaussNewtonNonlinearRegressionErrorCode =
  | 'nonFiniteInput'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'singularNormalMatrix'
  | 'numericalFailure'

const messages: Record<
  GaussNewtonNonlinearRegressionErrorCode,
  string
> = {
  nonFiniteInput:
    'All Gauss–Newton regression inputs must be finite.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  singularNormalMatrix:
    'The Gauss–Newton normal matrix became singular.',
  numericalFailure:
    'The nonlinear regression produced a non-finite result.',
}

export class GaussNewtonNonlinearRegressionCalculationError extends Error {
  readonly code: GaussNewtonNonlinearRegressionErrorCode

  constructor(code: GaussNewtonNonlinearRegressionErrorCode) {
    super(messages[code])
    this.name =
      'GaussNewtonNonlinearRegressionCalculationError'
    this.code = code
  }
}

export function calculateGaussNewtonNonlinearRegression(
  input: GaussNewtonNonlinearRegressionInput,
): GaussNewtonNonlinearRegressionResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new GaussNewtonNonlinearRegressionCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new GaussNewtonNonlinearRegressionCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new GaussNewtonNonlinearRegressionCalculationError(
      'invalidMaximumIterations',
    )
  }

  const x = [input.x1, input.x2, input.x3, input.x4]
  const y = [input.y1, input.y2, input.y3, input.y4]

  let a = input.initialA
  let b = input.initialB
  let iterations = 0
  let converged = false
  let gradientNorm = Number.POSITIVE_INFINITY

  while (iterations < input.maximumIterations) {
    let j11 = 0
    let j12 = 0
    let j22 = 0
    let g1 = 0
    let g2 = 0

    for (let i = 0; i < x.length; i += 1) {
      const exponential = Math.exp(b * x[i])
      const prediction = a * exponential
      const residual = y[i] - prediction
      const derivativeA = exponential
      const derivativeB = a * x[i] * exponential

      j11 += derivativeA ** 2
      j12 += derivativeA * derivativeB
      j22 += derivativeB ** 2
      g1 += derivativeA * residual
      g2 += derivativeB * residual
    }

    gradientNorm = Math.hypot(g1, g2)

    const determinant =
      j11 * j22 - j12 ** 2

    if (Math.abs(determinant) < 1e-18) {
      throw new GaussNewtonNonlinearRegressionCalculationError(
        'singularNormalMatrix',
      )
    }

    const deltaA =
      (g1 * j22 - j12 * g2) /
      determinant
    const deltaB =
      (j11 * g2 - j12 * g1) /
      determinant

    a += deltaA
    b += deltaB
    iterations += 1

    if (
      ![
        a,
        b,
        deltaA,
        deltaB,
        gradientNorm,
      ].every(Number.isFinite)
    ) {
      throw new GaussNewtonNonlinearRegressionCalculationError(
        'numericalFailure',
      )
    }

    if (
      Math.hypot(deltaA, deltaB) <=
      input.tolerance *
      Math.max(1, Math.hypot(a, b))
    ) {
      converged = true
      break
    }
  }

  const residuals = x.map(
    (value, index) =>
      y[index] -
      a * Math.exp(b * value),
  )

  const residualSumOfSquares =
    residuals.reduce(
      (sum, value) => sum + value ** 2,
      0,
    )

  const rootMeanSquareError =
    Math.sqrt(
      residualSumOfSquares / residuals.length,
    )

  if (
    ![
      a,
      b,
      residualSumOfSquares,
      rootMeanSquareError,
      gradientNorm,
    ].every(Number.isFinite)
  ) {
    throw new GaussNewtonNonlinearRegressionCalculationError(
      'numericalFailure',
    )
  }

  return {
    parameterA: a,
    parameterB: b,
    iterations,
    converged,
    residualSumOfSquares,
    rootMeanSquareError,
    gradientNorm,
    modelName:
      'Gauss–Newton regression for y = a exp(bx)',
    limitationDescription:
      'The fit uses four equally weighted observations. Convergence depends on the starting parameters and the model may be sensitive to scaling.',
  }
}
