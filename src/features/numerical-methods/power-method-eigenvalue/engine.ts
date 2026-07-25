import type {
  PowerMethodEigenvalueInput,
  PowerMethodEigenvalueResult,
} from './types.ts'

export type PowerMethodEigenvalueErrorCode =
  | 'nonFiniteInput'
  | 'zeroInitialVector'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'zeroIterationVector'
  | 'numericalFailure'

const messages: Record<
  PowerMethodEigenvalueErrorCode,
  string
> = {
  nonFiniteInput:
    'All power-method inputs must be finite.',
  zeroInitialVector:
    'The initial vector cannot be zero.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  zeroIterationVector:
    'The matrix produced a zero iteration vector.',
  numericalFailure:
    'The power-method iteration produced a non-finite result.',
}

export class PowerMethodEigenvalueCalculationError extends Error {
  readonly code: PowerMethodEigenvalueErrorCode

  constructor(code: PowerMethodEigenvalueErrorCode) {
    super(messages[code])
    this.name = 'PowerMethodEigenvalueCalculationError'
    this.code = code
  }
}

type Vector = [number, number, number]
type Matrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
]

function multiply(matrix: Matrix, vector: Vector): Vector {
  return [
    matrix[0][0] * vector[0] +
      matrix[0][1] * vector[1] +
      matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] +
      matrix[1][1] * vector[1] +
      matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] +
      matrix[2][1] * vector[1] +
      matrix[2][2] * vector[2],
  ]
}

function dot(a: Vector, b: Vector): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function normalize(vector: Vector): Vector {
  const norm = Math.hypot(...vector)

  if (norm <= 1e-30) {
    throw new PowerMethodEigenvalueCalculationError(
      'zeroIterationVector',
    )
  }

  return [
    vector[0] / norm,
    vector[1] / norm,
    vector[2] / norm,
  ]
}

export function calculatePowerMethodEigenvalue(
  input: PowerMethodEigenvalueInput,
): PowerMethodEigenvalueResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new PowerMethodEigenvalueCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new PowerMethodEigenvalueCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new PowerMethodEigenvalueCalculationError(
      'invalidMaximumIterations',
    )
  }

  const initialNorm = Math.hypot(
    input.initialX1,
    input.initialX2,
    input.initialX3,
  )

  if (initialNorm <= 1e-30) {
    throw new PowerMethodEigenvalueCalculationError(
      'zeroInitialVector',
    )
  }

  const matrix: Matrix = [
    [input.a11, input.a12, input.a13],
    [input.a21, input.a22, input.a23],
    [input.a31, input.a32, input.a33],
  ]

  let vector: Vector = [
    input.initialX1 / initialNorm,
    input.initialX2 / initialNorm,
    input.initialX3 / initialNorm,
  ]

  let eigenvalue = Number.NaN
  let previousEigenvalue = Number.NaN
  let iterations = 0
  let converged = false

  while (iterations < input.maximumIterations) {
    const nextUnnormalized = multiply(matrix, vector)
    const nextVector = normalize(nextUnnormalized)
    const matrixTimesNext = multiply(matrix, nextVector)
    eigenvalue = dot(nextVector, matrixTimesNext)

    iterations += 1

    const candidateResidualNorm = Math.hypot(
      matrixTimesNext[0] - eigenvalue * nextVector[0],
      matrixTimesNext[1] - eigenvalue * nextVector[1],
      matrixTimesNext[2] - eigenvalue * nextVector[2],
    )

    if (
      Number.isFinite(previousEigenvalue) &&
      Math.abs(eigenvalue - previousEigenvalue) <=
        input.tolerance *
        Math.max(1, Math.abs(eigenvalue)) &&
      candidateResidualNorm <=
        input.tolerance *
        Math.max(1, Math.abs(eigenvalue))
    ) {
      vector = nextVector
      converged = true
      break
    }

    vector = nextVector
    previousEigenvalue = eigenvalue
  }

  const av = multiply(matrix, vector)
  const residualNorm = Math.hypot(
    av[0] - eigenvalue * vector[0],
    av[1] - eigenvalue * vector[1],
    av[2] - eigenvalue * vector[2],
  )

  if (
    ![
      eigenvalue,
      vector[0],
      vector[1],
      vector[2],
      residualNorm,
    ].every(Number.isFinite)
  ) {
    throw new PowerMethodEigenvalueCalculationError(
      'numericalFailure',
    )
  }

  return {
    eigenvalue,
    eigenvector1: vector[0],
    eigenvector2: vector[1],
    eigenvector3: vector[2],
    residualNorm,
    iterations,
    converged,
    modelName:
      'Power iteration with Rayleigh-quotient eigenvalue estimation',
    limitationDescription:
      'The method normally converges to the eigenvalue of largest magnitude when it is unique and represented in the initial vector.',
  }
}
