import type {
  LaplaceEquationFiniteDifferenceInput,
  LaplaceEquationFiniteDifferenceResult,
} from './types.ts'

export type LaplaceEquationFiniteDifferenceErrorCode =
  | 'nonFiniteInput'
  | 'invalidNodeCount'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'invalidRelaxationFactor'
  | 'numericalFailure'

const messages: Record<
  LaplaceEquationFiniteDifferenceErrorCode,
  string
> = {
  nonFiniteInput:
    'All Laplace-equation inputs must be finite.',
  invalidNodeCount:
    'Interior nodes per side must be an integer from 1 through 50.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  invalidRelaxationFactor:
    'Relaxation factor must satisfy 0 < ω < 2.',
  numericalFailure:
    'The finite-difference iteration produced a non-finite result.',
}

export class LaplaceEquationFiniteDifferenceCalculationError extends Error {
  readonly code: LaplaceEquationFiniteDifferenceErrorCode

  constructor(code: LaplaceEquationFiniteDifferenceErrorCode) {
    super(messages[code])
    this.name =
      'LaplaceEquationFiniteDifferenceCalculationError'
    this.code = code
  }
}

export function calculateLaplaceEquationFiniteDifference(
  input: LaplaceEquationFiniteDifferenceInput,
): LaplaceEquationFiniteDifferenceResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new LaplaceEquationFiniteDifferenceCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    !Number.isInteger(input.interiorNodesPerSide) ||
    input.interiorNodesPerSide < 1 ||
    input.interiorNodesPerSide > 50
  ) {
    throw new LaplaceEquationFiniteDifferenceCalculationError(
      'invalidNodeCount',
    )
  }

  if (input.tolerance <= 0) {
    throw new LaplaceEquationFiniteDifferenceCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new LaplaceEquationFiniteDifferenceCalculationError(
      'invalidMaximumIterations',
    )
  }

  if (
    input.relaxationFactor <= 0 ||
    input.relaxationFactor >= 2
  ) {
    throw new LaplaceEquationFiniteDifferenceCalculationError(
      'invalidRelaxationFactor',
    )
  }

  const size = input.interiorNodesPerSide + 2
  const boundaryAverage =
    (
      input.topBoundary +
      input.bottomBoundary +
      input.leftBoundary +
      input.rightBoundary
    ) /
    4

  const grid = Array.from(
    { length: size },
    () => new Array<number>(size).fill(boundaryAverage),
  )

  for (let column = 0; column < size; column += 1) {
    grid[0][column] = input.topBoundary
    grid[size - 1][column] = input.bottomBoundary
  }

  for (let row = 0; row < size; row += 1) {
    grid[row][0] = input.leftBoundary
    grid[row][size - 1] = input.rightBoundary
  }

  grid[0][0] =
    0.5 * (input.topBoundary + input.leftBoundary)
  grid[0][size - 1] =
    0.5 * (input.topBoundary + input.rightBoundary)
  grid[size - 1][0] =
    0.5 * (input.bottomBoundary + input.leftBoundary)
  grid[size - 1][size - 1] =
    0.5 * (input.bottomBoundary + input.rightBoundary)

  let iterations = 0
  let maximumUpdate = Number.POSITIVE_INFINITY
  let converged = false

  while (
    iterations < input.maximumIterations &&
    !converged
  ) {
    maximumUpdate = 0

    for (let row = 1; row < size - 1; row += 1) {
      for (let column = 1; column < size - 1; column += 1) {
        const average =
          0.25 *
          (
            grid[row - 1][column] +
            grid[row + 1][column] +
            grid[row][column - 1] +
            grid[row][column + 1]
          )

        const updated =
          grid[row][column] +
          input.relaxationFactor *
          (average - grid[row][column])

        maximumUpdate =
          Math.max(
            maximumUpdate,
            Math.abs(updated - grid[row][column]),
          )

        grid[row][column] = updated
      }
    }

    iterations += 1
    converged =
      maximumUpdate <= input.tolerance
  }

  const interiorValues: number[] = []

  for (let row = 1; row < size - 1; row += 1) {
    for (let column = 1; column < size - 1; column += 1) {
      interiorValues.push(grid[row][column])
    }
  }

  const centerIndex =
    Math.floor((size - 1) / 2)
  const centerValue =
    grid[centerIndex][centerIndex]
  const minimumValue =
    Math.min(...grid.flat())
  const maximumValue =
    Math.max(...grid.flat())
  const averageInteriorValue =
    interiorValues.reduce(
      (sum, value) => sum + value,
      0,
    ) / interiorValues.length

  if (
    ![
      centerValue,
      minimumValue,
      maximumValue,
      averageInteriorValue,
      maximumUpdate,
      ...grid.flat(),
    ].every(Number.isFinite)
  ) {
    throw new LaplaceEquationFiniteDifferenceCalculationError(
      'numericalFailure',
    )
  }

  return {
    centerValue,
    minimumValue,
    maximumValue,
    averageInteriorValue,
    iterations,
    converged,
    maximumUpdate,
    grid,
    modelName:
      'Five-point finite-difference Laplace solver with SOR iteration',
    limitationDescription:
      'The domain is a square with constant Dirichlet values on each edge. Corner values are averaged from adjacent boundaries.',
  }
}
