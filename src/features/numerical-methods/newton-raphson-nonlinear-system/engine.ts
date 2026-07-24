import type {
  NewtonRaphsonNonlinearSystemInput,
  NewtonRaphsonNonlinearSystemResult,
} from './types.ts'

export type NewtonRaphsonNonlinearSystemErrorCode =
  | 'nonFiniteInput'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'singularJacobian'
  | 'numericalFailure'

const messages: Record<
  NewtonRaphsonNonlinearSystemErrorCode,
  string
> = {
  nonFiniteInput:
    'All Newton–Raphson inputs must be finite.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  singularJacobian:
    'The Jacobian matrix became singular.',
  numericalFailure:
    'The Newton–Raphson iteration produced a non-finite result.',
}

export class NewtonRaphsonNonlinearSystemCalculationError extends Error {
  readonly code: NewtonRaphsonNonlinearSystemErrorCode

  constructor(code: NewtonRaphsonNonlinearSystemErrorCode) {
    super(messages[code])
    this.name =
      'NewtonRaphsonNonlinearSystemCalculationError'
    this.code = code
  }
}

export function calculateNewtonRaphsonNonlinearSystem(
  input: NewtonRaphsonNonlinearSystemInput,
): NewtonRaphsonNonlinearSystemResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new NewtonRaphsonNonlinearSystemCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new NewtonRaphsonNonlinearSystemCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new NewtonRaphsonNonlinearSystemCalculationError(
      'invalidMaximumIterations',
    )
  }

  let x = input.initialX
  let y = input.initialY
  let iterations = 0
  let converged = false
  let residual1 = Number.NaN
  let residual2 = Number.NaN
  let jacobianDeterminant = Number.NaN

  while (iterations < input.maximumIterations) {
    residual1 =
      x ** 2 + y ** 2 - input.circleConstant
    residual2 =
      Math.exp(x) + y - input.exponentialConstant

    const residualNorm =
      Math.hypot(residual1, residual2)

    if (residualNorm <= input.tolerance) {
      converged = true
      break
    }

    const j11 = 2 * x
    const j12 = 2 * y
    const j21 = Math.exp(x)
    const j22 = 1

    jacobianDeterminant =
      j11 * j22 - j12 * j21

    if (Math.abs(jacobianDeterminant) < 1e-14) {
      throw new NewtonRaphsonNonlinearSystemCalculationError(
        'singularJacobian',
      )
    }

    const deltaX =
      (
        -residual1 * j22 +
        j12 * residual2
      ) /
      jacobianDeterminant

    const deltaY =
      (
        -j11 * residual2 +
        residual1 * j21
      ) /
      jacobianDeterminant

    x += deltaX
    y += deltaY
    iterations += 1

    if (
      ![x, y, deltaX, deltaY].every(Number.isFinite)
    ) {
      throw new NewtonRaphsonNonlinearSystemCalculationError(
        'numericalFailure',
      )
    }
  }

  residual1 =
    x ** 2 + y ** 2 - input.circleConstant
  residual2 =
    Math.exp(x) + y - input.exponentialConstant

  const residualNorm =
    Math.hypot(residual1, residual2)

  if (residualNorm <= input.tolerance) {
    converged = true
  }

  const j11 = 2 * x
  const j12 = 2 * y
  const j21 = Math.exp(x)
  const j22 = 1
  jacobianDeterminant =
    j11 * j22 - j12 * j21

  if (
    ![
      x,
      y,
      residual1,
      residual2,
      residualNorm,
      jacobianDeterminant,
    ].every(Number.isFinite)
  ) {
    throw new NewtonRaphsonNonlinearSystemCalculationError(
      'numericalFailure',
    )
  }

  return {
    x,
    y,
    iterations,
    converged,
    residualNorm,
    equation1Residual: residual1,
    equation2Residual: residual2,
    jacobianDeterminant,
    modelName:
      'Newton–Raphson iteration with the analytical 2×2 Jacobian',
    limitationDescription:
      'The solved system is x² + y² = c₁ and exp(x) + y = c₂. Convergence depends strongly on the initial guess.',
  }
}
