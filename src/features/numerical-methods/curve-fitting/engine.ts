import type {
  CurveFittingInput,
  CurveFittingResult,
} from './types.ts'

export type CurveFittingErrorCode =
  | 'nonFiniteInput'
  | 'invalidDegree'
  | 'singularNormalEquations'
  | 'numericalFailure'

const messages: Record<
  CurveFittingErrorCode,
  string
> = {
  nonFiniteInput:
    'All curve-fitting inputs must be finite.',
  invalidDegree:
    'Polynomial degree must be 1 or 2.',
  singularNormalEquations:
    'The selected data produce singular normal equations.',
  numericalFailure:
    'The regression produced a non-finite result.',
}

export class CurveFittingCalculationError extends Error {
  readonly code: CurveFittingErrorCode

  constructor(code: CurveFittingErrorCode) {
    super(messages[code])
    this.name =
      'CurveFittingCalculationError'
    this.code = code
  }
}

function solveLinearSystem(
  matrix: number[][],
  rhs: number[],
): number[] {
  const n = rhs.length
  const augmented = matrix.map(
    (row, i) => [...row, rhs[i]],
  )

  for (let pivot = 0; pivot < n; pivot += 1) {
    let best = pivot

    for (let row = pivot + 1; row < n; row += 1) {
      if (
        Math.abs(augmented[row][pivot]) >
        Math.abs(augmented[best][pivot])
      ) {
        best = row
      }
    }

    if (Math.abs(augmented[best][pivot]) < 1e-14) {
      throw new CurveFittingCalculationError(
        'singularNormalEquations',
      )
    }

    ;[augmented[pivot], augmented[best]] =
      [augmented[best], augmented[pivot]]

    const divisor = augmented[pivot][pivot]

    for (let column = pivot; column <= n; column += 1) {
      augmented[pivot][column] /= divisor
    }

    for (let row = 0; row < n; row += 1) {
      if (row === pivot) continue
      const factor = augmented[row][pivot]

      for (let column = pivot; column <= n; column += 1) {
        augmented[row][column] -=
          factor * augmented[pivot][column]
      }
    }
  }

  return augmented.map((row) => row[n])
}

export function calculateCurveFitting(
  input: CurveFittingInput,
): CurveFittingResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new CurveFittingCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    !Number.isInteger(input.polynomialDegree) ||
    ![1, 2].includes(input.polynomialDegree)
  ) {
    throw new CurveFittingCalculationError(
      'invalidDegree',
    )
  }

  const x = [
    input.x1,
    input.x2,
    input.x3,
    input.x4,
    input.x5,
  ]
  const y = [
    input.y1,
    input.y2,
    input.y3,
    input.y4,
    input.y5,
  ]

  const dimension = input.polynomialDegree + 1
  const matrix = Array.from(
    { length: dimension },
    (_, row) =>
      Array.from(
        { length: dimension },
        (_, column) =>
          x.reduce(
            (sum, value) =>
              sum +
              value ** (row + column),
            0,
          ),
      ),
  )

  const rhs = Array.from(
    { length: dimension },
    (_, power) =>
      x.reduce(
        (sum, value, index) =>
          sum +
          y[index] * value ** power,
        0,
      ),
  )

  const coefficients =
    solveLinearSystem(matrix, rhs)

  const coefficient0 = coefficients[0]
  const coefficient1 = coefficients[1]
  const coefficient2 =
    input.polynomialDegree === 2
      ? coefficients[2]
      : 0

  const predict = (value: number) =>
    coefficient0 +
    coefficient1 * value +
    coefficient2 * value ** 2

  const predictions = x.map(predict)
  const meanY =
    y.reduce((sum, value) => sum + value, 0) /
    y.length

  const residualSumOfSquares =
    y.reduce(
      (sum, value, index) =>
        sum +
        (value - predictions[index]) ** 2,
      0,
    )

  const totalSumOfSquares =
    y.reduce(
      (sum, value) =>
        sum + (value - meanY) ** 2,
      0,
    )

  const rSquared =
    totalSumOfSquares === 0
      ? residualSumOfSquares === 0
        ? 1
        : 0
      : 1 -
        residualSumOfSquares /
        totalSumOfSquares

  const rootMeanSquareError =
    Math.sqrt(
      residualSumOfSquares / y.length,
    )

  const predictionY =
    predict(input.predictionX)

  const results = [
    coefficient0,
    coefficient1,
    coefficient2,
    predictionY,
    rSquared,
    rootMeanSquareError,
    residualSumOfSquares,
  ]

  if (!results.every(Number.isFinite)) {
    throw new CurveFittingCalculationError(
      'numericalFailure',
    )
  }

  return {
    coefficient0,
    coefficient1,
    coefficient2,
    predictionY,
    rSquared,
    rootMeanSquareError,
    residualSumOfSquares,
    modelName:
      input.polynomialDegree === 1
        ? 'Ordinary least-squares linear regression'
        : 'Ordinary least-squares quadratic regression',
    limitationDescription:
      'The fit uses five equally weighted observations. Outlier resistance, uncertainty intervals and errors in x are not included.',
  }
}
