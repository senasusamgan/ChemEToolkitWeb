import type {
  ThomasTridiagonalSolverInput,
  ThomasTridiagonalSolverResult,
} from './types.ts'

export type ThomasTridiagonalSolverErrorCode =
  | 'nonFiniteInput'
  | 'zeroPivot'
  | 'numericalFailure'

const messages: Record<
  ThomasTridiagonalSolverErrorCode,
  string
> = {
  nonFiniteInput:
    'All Thomas-solver inputs must be finite.',
  zeroPivot:
    'A zero or near-zero modified diagonal pivot was encountered.',
  numericalFailure:
    'The Thomas solve produced a non-finite result.',
}

export class ThomasTridiagonalSolverCalculationError extends Error {
  readonly code: ThomasTridiagonalSolverErrorCode

  constructor(code: ThomasTridiagonalSolverErrorCode) {
    super(messages[code])
    this.name =
      'ThomasTridiagonalSolverCalculationError'
    this.code = code
  }
}

export function calculateThomasTridiagonalSolver(
  input: ThomasTridiagonalSolverInput,
): ThomasTridiagonalSolverResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new ThomasTridiagonalSolverCalculationError(
      'nonFiniteInput',
    )
  }

  const lower = [
    input.lower1,
    input.lower2,
    input.lower3,
  ]

  const diagonal = [
    input.diagonal1,
    input.diagonal2,
    input.diagonal3,
    input.diagonal4,
  ]

  const upper = [
    input.upper1,
    input.upper2,
    input.upper3,
  ]

  const rhs = [
    input.rhs1,
    input.rhs2,
    input.rhs3,
    input.rhs4,
  ]

  const cPrime = new Array<number>(4).fill(0)
  const dPrime = new Array<number>(4).fill(0)
  const modifiedPivots = new Array<number>(4).fill(0)

  modifiedPivots[0] = diagonal[0]

  if (Math.abs(modifiedPivots[0]) < 1e-14) {
    throw new ThomasTridiagonalSolverCalculationError(
      'zeroPivot',
    )
  }

  cPrime[0] = upper[0] / modifiedPivots[0]
  dPrime[0] = rhs[0] / modifiedPivots[0]

  for (let i = 1; i < 4; i += 1) {
    modifiedPivots[i] =
      diagonal[i] -
      lower[i - 1] * cPrime[i - 1]

    if (Math.abs(modifiedPivots[i]) < 1e-14) {
      throw new ThomasTridiagonalSolverCalculationError(
        'zeroPivot',
      )
    }

    cPrime[i] =
      i < 3
        ? upper[i] / modifiedPivots[i]
        : 0

    dPrime[i] =
      (
        rhs[i] -
        lower[i - 1] * dPrime[i - 1]
      ) /
      modifiedPivots[i]
  }

  const solution = new Array<number>(4).fill(0)
  solution[3] = dPrime[3]

  for (let i = 2; i >= 0; i -= 1) {
    solution[i] =
      dPrime[i] -
      cPrime[i] * solution[i + 1]
  }

  const [x1, x2, x3, x4] = solution

  const residual1 =
    diagonal[0] * x1 +
    upper[0] * x2 -
    rhs[0]

  const residual2 =
    lower[0] * x1 +
    diagonal[1] * x2 +
    upper[1] * x3 -
    rhs[1]

  const residual3 =
    lower[1] * x2 +
    diagonal[2] * x3 +
    upper[2] * x4 -
    rhs[2]

  const residual4 =
    lower[2] * x3 +
    diagonal[3] * x4 -
    rhs[3]

  const residualNorm = Math.hypot(
    residual1,
    residual2,
    residual3,
    residual4,
  )

  const minimumModifiedPivot =
    Math.min(...modifiedPivots.map(Math.abs))

  if (
    ![
      ...solution,
      residualNorm,
      minimumModifiedPivot,
    ].every(Number.isFinite)
  ) {
    throw new ThomasTridiagonalSolverCalculationError(
      'numericalFailure',
    )
  }

  return {
    x1,
    x2,
    x3,
    x4,
    residualNorm,
    minimumModifiedPivot,
    modelName:
      'Thomas algorithm for a 4×4 tridiagonal linear system',
    limitationDescription:
      'The method does not pivot. It is most reliable for diagonally dominant or otherwise well-conditioned tridiagonal systems.',
  }
}
