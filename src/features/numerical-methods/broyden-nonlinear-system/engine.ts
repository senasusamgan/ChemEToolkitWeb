import type {
  BroydenNonlinearSystemInput,
  BroydenNonlinearSystemResult,
} from './types.ts'

export type BroydenNonlinearSystemErrorCode =
  | 'nonFiniteInput'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'singularApproximation'
  | 'numericalFailure'

const messages: Record<
  BroydenNonlinearSystemErrorCode,
  string
> = {
  nonFiniteInput:
    'All Broyden solver inputs must be finite.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  singularApproximation:
    'The approximate Jacobian became singular.',
  numericalFailure:
    'The Broyden iteration produced a non-finite result.',
}

export class BroydenNonlinearSystemCalculationError extends Error {
  readonly code: BroydenNonlinearSystemErrorCode

  constructor(code: BroydenNonlinearSystemErrorCode) {
    super(messages[code])
    this.name =
      'BroydenNonlinearSystemCalculationError'
    this.code = code
  }
}

type Vector = [number, number]
type Matrix = [[number, number], [number, number]]

function evaluate(
  x: number,
  y: number,
  input: BroydenNonlinearSystemInput,
): Vector {
  return [
    x ** 2 + y ** 2 - input.circleConstant,
    Math.exp(x) + y - input.exponentialConstant,
  ]
}

function solve2x2(
  matrix: Matrix,
  rhs: Vector,
): Vector {
  const determinant =
    matrix[0][0] * matrix[1][1] -
    matrix[0][1] * matrix[1][0]

  if (Math.abs(determinant) < 1e-14) {
    throw new BroydenNonlinearSystemCalculationError(
      'singularApproximation',
    )
  }

  return [
    (
      rhs[0] * matrix[1][1] -
      matrix[0][1] * rhs[1]
    ) / determinant,
    (
      matrix[0][0] * rhs[1] -
      rhs[0] * matrix[1][0]
    ) / determinant,
  ]
}

export function calculateBroydenNonlinearSystem(
  input: BroydenNonlinearSystemInput,
): BroydenNonlinearSystemResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new BroydenNonlinearSystemCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new BroydenNonlinearSystemCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new BroydenNonlinearSystemCalculationError(
      'invalidMaximumIterations',
    )
  }

  let state: Vector = [input.initialX, input.initialY]
  let residual = evaluate(state[0], state[1], input)

  let jacobian: Matrix = [
    [2 * state[0], 2 * state[1]],
    [Math.exp(state[0]), 1],
  ]

  let iterations = 0
  let residualNorm = Math.hypot(...residual)
  let converged = residualNorm <= input.tolerance

  while (
    !converged &&
    iterations < input.maximumIterations
  ) {
    const step = solve2x2(
      jacobian,
      [-residual[0], -residual[1]],
    )

    const nextState: Vector = [
      state[0] + step[0],
      state[1] + step[1],
    ]

    const nextResidual =
      evaluate(
        nextState[0],
        nextState[1],
        input,
      )

    const yDifference: Vector = [
      nextResidual[0] - residual[0],
      nextResidual[1] - residual[1],
    ]

    const js: Vector = [
      jacobian[0][0] * step[0] +
        jacobian[0][1] * step[1],
      jacobian[1][0] * step[0] +
        jacobian[1][1] * step[1],
    ]

    const correction: Vector = [
      yDifference[0] - js[0],
      yDifference[1] - js[1],
    ]

    const denominator =
      step[0] ** 2 +
      step[1] ** 2

    if (denominator <= 1e-30) {
      throw new BroydenNonlinearSystemCalculationError(
        'singularApproximation',
      )
    }

    jacobian = [
      [
        jacobian[0][0] +
          correction[0] * step[0] / denominator,
        jacobian[0][1] +
          correction[0] * step[1] / denominator,
      ],
      [
        jacobian[1][0] +
          correction[1] * step[0] / denominator,
        jacobian[1][1] +
          correction[1] * step[1] / denominator,
      ],
    ]

    state = nextState
    residual = nextResidual
    residualNorm = Math.hypot(...residual)
    iterations += 1
    converged = residualNorm <= input.tolerance
  }

  const results = [
    ...state,
    ...residual,
    residualNorm,
  ]

  if (!results.every(Number.isFinite)) {
    throw new BroydenNonlinearSystemCalculationError(
      'numericalFailure',
    )
  }

  return {
    x: state[0],
    y: state[1],
    iterations,
    converged,
    residualNorm,
    equation1Residual: residual[0],
    equation2Residual: residual[1],
    modelName:
      'Good Broyden rank-one update for a two-equation nonlinear system',
    limitationDescription:
      'The solved demonstration system is x² + y² = c₁ and exp(x) + y = c₂. Convergence depends on the initial guess.',
  }
}
