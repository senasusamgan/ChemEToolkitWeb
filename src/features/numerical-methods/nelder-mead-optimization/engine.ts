import type {
  NelderMeadOptimizationInput,
  NelderMeadOptimizationResult,
} from './types.ts'

export type NelderMeadOptimizationErrorCode =
  | 'nonFiniteInput'
  | 'notPositiveDefinite'
  | 'invalidSimplexSize'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'numericalFailure'

const messages: Record<NelderMeadOptimizationErrorCode, string> = {
  nonFiniteInput:
    'All Nelder–Mead inputs must be finite.',
  notPositiveDefinite:
    'The quadratic objective must have a positive-definite Hessian.',
  invalidSimplexSize:
    'Initial simplex size must be greater than zero.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  numericalFailure:
    'The optimization produced a non-finite result.',
}

export class NelderMeadOptimizationCalculationError extends Error {
  readonly code: NelderMeadOptimizationErrorCode

  constructor(code: NelderMeadOptimizationErrorCode) {
    super(messages[code])
    this.name = 'NelderMeadOptimizationCalculationError'
    this.code = code
  }
}

type Point = [number, number]

function objective(
  point: Point,
  input: NelderMeadOptimizationInput,
): number {
  const [x, y] = point

  return (
    0.5 *
    (
      input.q11 * x ** 2 +
      2 * input.q12 * x * y +
      input.q22 * y ** 2
    ) +
    input.c1 * x +
    input.c2 * y
  )
}

export function calculateNelderMeadOptimization(
  input: NelderMeadOptimizationInput,
): NelderMeadOptimizationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new NelderMeadOptimizationCalculationError(
      'nonFiniteInput',
    )
  }

  const determinant =
    input.q11 * input.q22 - input.q12 ** 2

  if (input.q11 <= 0 || determinant <= 0) {
    throw new NelderMeadOptimizationCalculationError(
      'notPositiveDefinite',
    )
  }

  if (input.initialSimplexSize <= 0) {
    throw new NelderMeadOptimizationCalculationError(
      'invalidSimplexSize',
    )
  }

  if (input.tolerance <= 0) {
    throw new NelderMeadOptimizationCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new NelderMeadOptimizationCalculationError(
      'invalidMaximumIterations',
    )
  }

  let simplex: Point[] = [
    [input.initialX, input.initialY],
    [input.initialX + input.initialSimplexSize, input.initialY],
    [input.initialX, input.initialY + input.initialSimplexSize],
  ]

  const alpha = 1
  const gamma = 2
  const rho = 0.5
  const sigma = 0.5

  let iterations = 0
  let converged = false
  let finalSimplexSpread = Number.POSITIVE_INFINITY

  while (iterations < input.maximumIterations) {
    simplex.sort(
      (a, b) => objective(a, input) - objective(b, input),
    )

    const valuesAtVertices = simplex.map(
      (point) => objective(point, input),
    )

    finalSimplexSpread =
      Math.max(...valuesAtVertices) -
      Math.min(...valuesAtVertices)

    const geometricSpread = Math.max(
      Math.hypot(
        simplex[1][0] - simplex[0][0],
        simplex[1][1] - simplex[0][1],
      ),
      Math.hypot(
        simplex[2][0] - simplex[0][0],
        simplex[2][1] - simplex[0][1],
      ),
    )

    if (
      finalSimplexSpread <= input.tolerance &&
      geometricSpread <= Math.sqrt(input.tolerance)
    ) {
      converged = true
      break
    }

    const best = simplex[0]
    const second = simplex[1]
    const worst = simplex[2]

    const centroid: Point = [
      0.5 * (best[0] + second[0]),
      0.5 * (best[1] + second[1]),
    ]

    const reflected: Point = [
      centroid[0] + alpha * (centroid[0] - worst[0]),
      centroid[1] + alpha * (centroid[1] - worst[1]),
    ]

    const fBest = objective(best, input)
    const fSecond = objective(second, input)
    const fWorst = objective(worst, input)
    const fReflected = objective(reflected, input)

    if (fReflected < fBest) {
      const expanded: Point = [
        centroid[0] + gamma * (reflected[0] - centroid[0]),
        centroid[1] + gamma * (reflected[1] - centroid[1]),
      ]

      simplex[2] =
        objective(expanded, input) < fReflected
          ? expanded
          : reflected
    } else if (fReflected < fSecond) {
      simplex[2] = reflected
    } else {
      const outside = fReflected < fWorst
      const contracted: Point = outside
        ? [
            centroid[0] + rho * (reflected[0] - centroid[0]),
            centroid[1] + rho * (reflected[1] - centroid[1]),
          ]
        : [
            centroid[0] + rho * (worst[0] - centroid[0]),
            centroid[1] + rho * (worst[1] - centroid[1]),
          ]

      const contractionReference = outside ? fReflected : fWorst

      if (objective(contracted, input) < contractionReference) {
        simplex[2] = contracted
      } else {
        simplex[1] = [
          best[0] + sigma * (simplex[1][0] - best[0]),
          best[1] + sigma * (simplex[1][1] - best[1]),
        ]
        simplex[2] = [
          best[0] + sigma * (simplex[2][0] - best[0]),
          best[1] + sigma * (simplex[2][1] - best[1]),
        ]
      }
    }

    iterations += 1
  }

  simplex.sort(
    (a, b) => objective(a, input) - objective(b, input),
  )

  const optimum = simplex[0]
  const objectiveValue = objective(optimum, input)

  const exactOptimumX =
    (
      input.q12 * input.c2 -
      input.q22 * input.c1
    ) /
    determinant

  const exactOptimumY =
    (
      input.q12 * input.c1 -
      input.q11 * input.c2
    ) /
    determinant

  const distanceToExactOptimum = Math.hypot(
    optimum[0] - exactOptimumX,
    optimum[1] - exactOptimumY,
  )

  const results = [
    ...optimum,
    objectiveValue,
    finalSimplexSpread,
    exactOptimumX,
    exactOptimumY,
    distanceToExactOptimum,
  ]

  if (!results.every(Number.isFinite)) {
    throw new NelderMeadOptimizationCalculationError(
      'numericalFailure',
    )
  }

  return {
    optimumX: optimum[0],
    optimumY: optimum[1],
    objectiveValue,
    iterations,
    converged,
    finalSimplexSpread,
    exactOptimumX,
    exactOptimumY,
    distanceToExactOptimum,
    modelName:
      'Two-variable Nelder–Mead simplex minimization',
    limitationDescription:
      'The demonstration objective is a convex quadratic. Nelder–Mead does not use derivatives and may converge slowly on poorly scaled problems.',
  }
}
