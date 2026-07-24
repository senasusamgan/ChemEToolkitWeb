import type {
  CholeskyDecompositionSolverInput,
  CholeskyDecompositionSolverResult,
} from './types.ts'

export type CholeskyDecompositionSolverErrorCode =
  | 'nonFiniteInput'
  | 'notPositiveDefinite'
  | 'numericalFailure'

const messages: Record<
  CholeskyDecompositionSolverErrorCode,
  string
> = {
  nonFiniteInput:
    'All Cholesky solver inputs must be finite.',
  notPositiveDefinite:
    'The symmetric matrix must be positive definite.',
  numericalFailure:
    'The Cholesky solve produced a non-finite result.',
}

export class CholeskyDecompositionSolverCalculationError extends Error {
  readonly code: CholeskyDecompositionSolverErrorCode

  constructor(code: CholeskyDecompositionSolverErrorCode) {
    super(messages[code])
    this.name =
      'CholeskyDecompositionSolverCalculationError'
    this.code = code
  }
}

export function calculateCholeskyDecompositionSolver(
  input: CholeskyDecompositionSolverInput,
): CholeskyDecompositionSolverResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new CholeskyDecompositionSolverCalculationError(
      'nonFiniteInput',
    )
  }

  const l11Squared = input.a11
  if (l11Squared <= 0) {
    throw new CholeskyDecompositionSolverCalculationError(
      'notPositiveDefinite',
    )
  }

  const l11 = Math.sqrt(l11Squared)
  const l21 = input.a12 / l11
  const l31 = input.a13 / l11

  const l22Squared =
    input.a22 - l21 ** 2
  if (l22Squared <= 0) {
    throw new CholeskyDecompositionSolverCalculationError(
      'notPositiveDefinite',
    )
  }

  const l22 = Math.sqrt(l22Squared)
  const l32 =
    (input.a23 - l31 * l21) / l22

  const l33Squared =
    input.a33 - l31 ** 2 - l32 ** 2
  if (l33Squared <= 0) {
    throw new CholeskyDecompositionSolverCalculationError(
      'notPositiveDefinite',
    )
  }

  const l33 = Math.sqrt(l33Squared)

  const y1 = input.b1 / l11
  const y2 = (input.b2 - l21 * y1) / l22
  const y3 =
    (input.b3 - l31 * y1 - l32 * y2) /
    l33

  const x3 = y3 / l33
  const x2 = (y2 - l32 * x3) / l22
  const x1 =
    (y1 - l21 * x2 - l31 * x3) /
    l11

  const r1 =
    input.a11 * x1 +
    input.a12 * x2 +
    input.a13 * x3 -
    input.b1
  const r2 =
    input.a12 * x1 +
    input.a22 * x2 +
    input.a23 * x3 -
    input.b2
  const r3 =
    input.a13 * x1 +
    input.a23 * x2 +
    input.a33 * x3 -
    input.b3

  const residualNorm = Math.hypot(r1, r2, r3)
  const determinant =
    (l11 * l22 * l33) ** 2

  const results = [
    x1, x2, x3,
    l11, l21, l31, l22, l32, l33,
    determinant, residualNorm,
  ]

  if (!results.every(Number.isFinite)) {
    throw new CholeskyDecompositionSolverCalculationError(
      'numericalFailure',
    )
  }

  return {
    x1, x2, x3,
    l11, l21, l31, l22, l32, l33,
    determinant,
    residualNorm,
    modelName:
      'Direct solution of a symmetric positive-definite 3×3 system using A = LLᵀ',
    limitationDescription:
      'The matrix is assumed symmetric from the six unique coefficients supplied. Positive definiteness is checked during factorization.',
  }
}
