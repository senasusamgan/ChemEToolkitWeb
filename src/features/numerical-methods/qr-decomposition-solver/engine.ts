import type {
  QRDecompositionSolverInput,
  QRDecompositionSolverResult,
} from './types.ts'

export type QRDecompositionSolverErrorCode =
  | 'nonFiniteInput'
  | 'rankDeficientMatrix'
  | 'numericalFailure'

const messages: Record<
  QRDecompositionSolverErrorCode,
  string
> = {
  nonFiniteInput:
    'All QR solver inputs must be finite.',
  rankDeficientMatrix:
    'The matrix columns are linearly dependent or nearly dependent.',
  numericalFailure:
    'The QR solve produced a non-finite result.',
}

export class QRDecompositionSolverCalculationError extends Error {
  readonly code: QRDecompositionSolverErrorCode

  constructor(code: QRDecompositionSolverErrorCode) {
    super(messages[code])
    this.name = 'QRDecompositionSolverCalculationError'
    this.code = code
  }
}

type Vector = [number, number, number]

function dot(a: Vector, b: Vector): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function subtractScaled(
  vector: Vector,
  basis: Vector,
  scale: number,
): Vector {
  return [
    vector[0] - scale * basis[0],
    vector[1] - scale * basis[1],
    vector[2] - scale * basis[2],
  ]
}

function normalize(vector: Vector): [Vector, number] {
  const norm = Math.hypot(...vector)

  if (norm < 1e-14) {
    throw new QRDecompositionSolverCalculationError(
      'rankDeficientMatrix',
    )
  }

  return [
    [
      vector[0] / norm,
      vector[1] / norm,
      vector[2] / norm,
    ],
    norm,
  ]
}

export function calculateQRDecompositionSolver(
  input: QRDecompositionSolverInput,
): QRDecompositionSolverResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new QRDecompositionSolverCalculationError(
      'nonFiniteInput',
    )
  }

  const column1: Vector = [
    input.a11,
    input.a21,
    input.a31,
  ]

  const column2: Vector = [
    input.a12,
    input.a22,
    input.a32,
  ]

  const column3: Vector = [
    input.a13,
    input.a23,
    input.a33,
  ]

  const [q1, r11] = normalize(column1)

  const r12 = dot(q1, column2)
  const u2 = subtractScaled(column2, q1, r12)
  const [q2, r22] = normalize(u2)

  const r13 = dot(q1, column3)
  const r23 = dot(q2, column3)
  let u3 = subtractScaled(column3, q1, r13)
  u3 = subtractScaled(u3, q2, r23)
  const [q3, r33] = normalize(u3)

  const rhs: Vector = [input.b1, input.b2, input.b3]
  const y1 = dot(q1, rhs)
  const y2 = dot(q2, rhs)
  const y3 = dot(q3, rhs)

  const x3 = y3 / r33
  const x2 = (y2 - r23 * x3) / r22
  const x1 =
    (y1 - r12 * x2 - r13 * x3) / r11

  const residual1 =
    input.a11 * x1 +
    input.a12 * x2 +
    input.a13 * x3 -
    input.b1

  const residual2 =
    input.a21 * x1 +
    input.a22 * x2 +
    input.a23 * x3 -
    input.b2

  const residual3 =
    input.a31 * x1 +
    input.a32 * x2 +
    input.a33 * x3 -
    input.b3

  const residualNorm = Math.hypot(
    residual1,
    residual2,
    residual3,
  )

  const orthogonalityError = Math.max(
    Math.abs(dot(q1, q1) - 1),
    Math.abs(dot(q2, q2) - 1),
    Math.abs(dot(q3, q3) - 1),
    Math.abs(dot(q1, q2)),
    Math.abs(dot(q1, q3)),
    Math.abs(dot(q2, q3)),
  )

  const determinantEstimate = r11 * r22 * r33

  const results = [
    x1,
    x2,
    x3,
    residualNorm,
    orthogonalityError,
    determinantEstimate,
    r11,
    r22,
    r33,
  ]

  if (!results.every(Number.isFinite)) {
    throw new QRDecompositionSolverCalculationError(
      'numericalFailure',
    )
  }

  return {
    x1,
    x2,
    x3,
    residualNorm,
    orthogonalityError,
    determinantEstimate,
    r11,
    r22,
    r33,
    modelName:
      'Modified Gram–Schmidt QR factorization of a 3×3 linear system',
    limitationDescription:
      'The method detects rank deficiency from small column norms. Householder QR is usually preferred for larger or more ill-conditioned systems.',
  }
}
