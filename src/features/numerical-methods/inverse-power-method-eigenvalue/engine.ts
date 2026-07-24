import type {
  InversePowerMethodEigenvalueInput,
  InversePowerMethodEigenvalueResult,
} from './types.ts'

export type InversePowerMethodEigenvalueErrorCode =
  | 'nonFiniteInput'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'zeroInitialVector'
  | 'singularShiftedMatrix'
  | 'numericalFailure'

const messages: Record<
  InversePowerMethodEigenvalueErrorCode,
  string
> = {
  nonFiniteInput:
    'All inverse-power inputs must be finite.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  zeroInitialVector:
    'The initial vector cannot be zero.',
  singularShiftedMatrix:
    'The shifted matrix A − μI is singular or nearly singular.',
  numericalFailure:
    'The inverse-power iteration produced a non-finite result.',
}

export class InversePowerMethodEigenvalueCalculationError extends Error {
  readonly code: InversePowerMethodEigenvalueErrorCode

  constructor(code: InversePowerMethodEigenvalueErrorCode) {
    super(messages[code])
    this.name =
      'InversePowerMethodEigenvalueCalculationError'
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
    throw new InversePowerMethodEigenvalueCalculationError(
      'zeroInitialVector',
    )
  }

  return [
    vector[0] / norm,
    vector[1] / norm,
    vector[2] / norm,
  ]
}

function solve3x3(matrix: Matrix, rhs: Vector): Vector {
  const augmented = matrix.map(
    (row, i) => [...row, rhs[i]],
  )

  for (let pivot = 0; pivot < 3; pivot += 1) {
    let best = pivot

    for (let row = pivot + 1; row < 3; row += 1) {
      if (
        Math.abs(augmented[row][pivot]) >
        Math.abs(augmented[best][pivot])
      ) {
        best = row
      }
    }

    if (Math.abs(augmented[best][pivot]) < 1e-14) {
      throw new InversePowerMethodEigenvalueCalculationError(
        'singularShiftedMatrix',
      )
    }

    ;[augmented[pivot], augmented[best]] =
      [augmented[best], augmented[pivot]]

    for (let row = pivot + 1; row < 3; row += 1) {
      const factor =
        augmented[row][pivot] /
        augmented[pivot][pivot]

      for (let column = pivot; column < 4; column += 1) {
        augmented[row][column] -=
          factor * augmented[pivot][column]
      }
    }
  }

  const solution: Vector = [0, 0, 0]

  for (let row = 2; row >= 0; row -= 1) {
    let value = augmented[row][3]

    for (let column = row + 1; column < 3; column += 1) {
      value -=
        augmented[row][column] *
        solution[column]
    }

    solution[row] =
      value / augmented[row][row]
  }

  return solution
}

export function calculateInversePowerMethodEigenvalue(
  input: InversePowerMethodEigenvalueInput,
): InversePowerMethodEigenvalueResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new InversePowerMethodEigenvalueCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.tolerance <= 0) {
    throw new InversePowerMethodEigenvalueCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new InversePowerMethodEigenvalueCalculationError(
      'invalidMaximumIterations',
    )
  }

  const matrix: Matrix = [
    [input.a11, input.a12, input.a13],
    [input.a21, input.a22, input.a23],
    [input.a31, input.a32, input.a33],
  ]

  const shifted: Matrix = [
    [input.a11 - input.shift, input.a12, input.a13],
    [input.a21, input.a22 - input.shift, input.a23],
    [input.a31, input.a32, input.a33 - input.shift],
  ]

  let vector = normalize([
    input.initialX1,
    input.initialX2,
    input.initialX3,
  ])

  let eigenvalue = Number.NaN
  let previousEigenvalue = Number.NaN
  let shiftedInverseEstimate = Number.NaN
  let iterations = 0
  let converged = false

  while (iterations < input.maximumIterations) {
    const solved = solve3x3(shifted, vector)
    vector = normalize(solved)

    const av = multiply(matrix, vector)
    eigenvalue = dot(vector, av)

    const shiftedAv = multiply(shifted, vector)
    const denominator = dot(vector, shiftedAv)

    if (Math.abs(denominator) < 1e-30) {
      throw new InversePowerMethodEigenvalueCalculationError(
        'singularShiftedMatrix',
      )
    }

    shiftedInverseEstimate =
      1 / denominator

    iterations += 1

    if (
      Number.isFinite(previousEigenvalue) &&
      Math.abs(eigenvalue - previousEigenvalue) <=
        input.tolerance *
        Math.max(1, Math.abs(eigenvalue))
    ) {
      converged = true
      break
    }

    previousEigenvalue = eigenvalue
  }

  const av = multiply(matrix, vector)
  const residualNorm = Math.hypot(
    av[0] - eigenvalue * vector[0],
    av[1] - eigenvalue * vector[1],
    av[2] - eigenvalue * vector[2],
  )

  const results = [
    eigenvalue,
    ...vector,
    residualNorm,
    shiftedInverseEstimate,
  ]

  if (!results.every(Number.isFinite)) {
    throw new InversePowerMethodEigenvalueCalculationError(
      'numericalFailure',
    )
  }

  return {
    eigenvalue,
    eigenvector1: vector[0],
    eigenvector2: vector[1],
    eigenvector3: vector[2],
    iterations,
    converged,
    residualNorm,
    shiftedInverseEstimate,
    modelName:
      'Shifted inverse-power iteration with Rayleigh quotient',
    limitationDescription:
      'The method converges toward the eigenvalue nearest the selected shift. A shift exactly equal to an eigenvalue makes the shifted matrix singular.',
  }
}
