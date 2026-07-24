import type {
  LUDecompositionSolverInput,
  LUDecompositionSolverResult,
} from './types.ts'

export type LUDecompositionSolverErrorCode =
  | 'nonFiniteInput'
  | 'singularMatrix'
  | 'numericalFailure'

const messages: Record<
  LUDecompositionSolverErrorCode,
  string
> = {
  nonFiniteInput:
    'All LU solver inputs must be finite.',
  singularMatrix:
    'The matrix is singular or requires pivoting beyond this compact Doolittle implementation.',
  numericalFailure:
    'The LU solve produced a non-finite result.',
}

export class LUDecompositionSolverCalculationError extends Error {
  readonly code: LUDecompositionSolverErrorCode

  constructor(code: LUDecompositionSolverErrorCode) {
    super(messages[code])
    this.name =
      'LUDecompositionSolverCalculationError'
    this.code = code
  }
}

export function calculateLUDecompositionSolver(
  input: LUDecompositionSolverInput,
): LUDecompositionSolverResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new LUDecompositionSolverCalculationError(
      'nonFiniteInput',
    )
  }

  const upper11 = input.a11

  if (Math.abs(upper11) < 1e-14) {
    throw new LUDecompositionSolverCalculationError(
      'singularMatrix',
    )
  }

  const lower11 = 1
  const lower21 = input.a21 / upper11
  const lower31 = input.a31 / upper11

  const upper12 = input.a12
  const upper13 = input.a13
  const upper22 =
    input.a22 - lower21 * upper12
  const upper23 =
    input.a23 - lower21 * upper13

  if (Math.abs(upper22) < 1e-14) {
    throw new LUDecompositionSolverCalculationError(
      'singularMatrix',
    )
  }

  const lower22 = 1
  const lower32 =
    (input.a32 - lower31 * upper12) /
    upper22

  const upper33 =
    input.a33 -
    lower31 * upper13 -
    lower32 * upper23

  if (Math.abs(upper33) < 1e-14) {
    throw new LUDecompositionSolverCalculationError(
      'singularMatrix',
    )
  }

  const lower33 = 1

  const y1 = input.b1
  const y2 =
    input.b2 - lower21 * y1
  const y3 =
    input.b3 -
    lower31 * y1 -
    lower32 * y2

  const x3 = y3 / upper33
  const x2 =
    (y2 - upper23 * x3) /
    upper22
  const x1 =
    (
      y1 -
      upper12 * x2 -
      upper13 * x3
    ) /
    upper11

  const r1 =
    input.a11 * x1 +
    input.a12 * x2 +
    input.a13 * x3 -
    input.b1
  const r2 =
    input.a21 * x1 +
    input.a22 * x2 +
    input.a23 * x3 -
    input.b2
  const r3 =
    input.a31 * x1 +
    input.a32 * x2 +
    input.a33 * x3 -
    input.b3

  const residualNorm =
    Math.hypot(r1, r2, r3)
  const determinant =
    upper11 * upper22 * upper33

  const results = [
    x1, x2, x3,
    determinant,
    residualNorm,
    lower11, lower21, lower22,
    lower31, lower32, lower33,
    upper11, upper12, upper13,
    upper22, upper23, upper33,
  ]

  if (!results.every(Number.isFinite)) {
    throw new LUDecompositionSolverCalculationError(
      'numericalFailure',
    )
  }

  return {
    x1, x2, x3,
    determinant,
    residualNorm,
    lower11, lower21, lower22,
    lower31, lower32, lower33,
    upper11, upper12, upper13,
    upper22, upper23, upper33,
    modelName:
      'Doolittle LU factorization of a 3×3 system',
    limitationDescription:
      'The compact implementation does not perform row pivoting. Use a pivoted solver when a leading pivot is zero or very small.',
  }
}
