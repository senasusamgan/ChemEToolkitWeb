import type {
  ConjugateGradientSolverInput,
  ConjugateGradientSolverResult,
} from './types.ts'

export type ConjugateGradientSolverErrorCode =
  | 'nonFiniteInput'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'notPositiveDefinite'
  | 'breakdown'
  | 'numericalFailure'

const messages: Record<
  ConjugateGradientSolverErrorCode,
  string
> = {
  nonFiniteInput:
    'All conjugate-gradient inputs must be finite.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  notPositiveDefinite:
    'The symmetric matrix must be positive definite.',
  breakdown:
    'The conjugate-gradient iteration encountered a non-positive curvature direction.',
  numericalFailure:
    'The conjugate-gradient iteration produced a non-finite result.',
}

export class ConjugateGradientSolverCalculationError extends Error {
  readonly code: ConjugateGradientSolverErrorCode

  constructor(code: ConjugateGradientSolverErrorCode) {
    super(messages[code])
    this.name =
      'ConjugateGradientSolverCalculationError'
    this.code = code
  }
}

type Vector = [number, number, number]

function multiply(
  input: ConjugateGradientSolverInput,
  vector: Vector,
): Vector {
  return [
    input.a11 * vector[0] +
      input.a12 * vector[1] +
      input.a13 * vector[2],
    input.a12 * vector[0] +
      input.a22 * vector[1] +
      input.a23 * vector[2],
    input.a13 * vector[0] +
      input.a23 * vector[1] +
      input.a33 * vector[2],
  ]
}

function dot(a: Vector, b: Vector): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function positiveDefinite(
  input: ConjugateGradientSolverInput,
): boolean {
  const m1 = input.a11
  const m2 =
    input.a11 * input.a22 -
    input.a12 ** 2
  const determinant =
    input.a11 *
      (input.a22 * input.a33 - input.a23 ** 2) -
    input.a12 *
      (input.a12 * input.a33 - input.a13 * input.a23) +
    input.a13 *
      (input.a12 * input.a23 - input.a13 * input.a22)

  return m1 > 0 && m2 > 0 && determinant > 0
}

export function calculateConjugateGradientSolver(
  input: ConjugateGradientSolverInput,
): ConjugateGradientSolverResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new ConjugateGradientSolverCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new ConjugateGradientSolverCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new ConjugateGradientSolverCalculationError(
      'invalidMaximumIterations',
    )
  }

  if (!positiveDefinite(input)) {
    throw new ConjugateGradientSolverCalculationError(
      'notPositiveDefinite',
    )
  }

  const b: Vector = [input.b1, input.b2, input.b3]
  let x: Vector = [
    input.initialX1,
    input.initialX2,
    input.initialX3,
  ]

  const ax = multiply(input, x)
  let r: Vector = [
    b[0] - ax[0],
    b[1] - ax[1],
    b[2] - ax[2],
  ]
  let p: Vector = [...r]
  let rsOld = dot(r, r)
  const bNorm = Math.sqrt(dot(b, b))
  const absoluteTarget =
    input.tolerance * Math.max(1, bNorm)

  let iterations = 0
  let converged =
    Math.sqrt(rsOld) <= absoluteTarget

  while (
    !converged &&
    iterations < input.maximumIterations
  ) {
    const ap = multiply(input, p)
    const curvature = dot(p, ap)

    if (curvature <= 0) {
      throw new ConjugateGradientSolverCalculationError(
        'breakdown',
      )
    }

    const alpha = rsOld / curvature

    x = [
      x[0] + alpha * p[0],
      x[1] + alpha * p[1],
      x[2] + alpha * p[2],
    ]

    r = [
      r[0] - alpha * ap[0],
      r[1] - alpha * ap[1],
      r[2] - alpha * ap[2],
    ]

    const rsNew = dot(r, r)
    iterations += 1

    converged =
      Math.sqrt(rsNew) <= absoluteTarget

    if (!converged) {
      const beta = rsNew / rsOld
      p = [
        r[0] + beta * p[0],
        r[1] + beta * p[1],
        r[2] + beta * p[2],
      ]
    }

    rsOld = rsNew
  }

  const residualNorm = Math.sqrt(rsOld)
  const relativeResidual =
    residualNorm / Math.max(1, bNorm)

  if (
    ![
      ...x,
      residualNorm,
      relativeResidual,
    ].every(Number.isFinite)
  ) {
    throw new ConjugateGradientSolverCalculationError(
      'numericalFailure',
    )
  }

  return {
    x1: x[0],
    x2: x[1],
    x3: x[2],
    iterations,
    converged,
    residualNorm,
    relativeResidual,
    modelName:
      'Conjugate-gradient iteration for a symmetric positive-definite 3×3 system',
    limitationDescription:
      'Convergence is guaranteed only for symmetric positive-definite matrices. For larger sparse systems, matrix-free storage is normally preferred.',
  }
}
