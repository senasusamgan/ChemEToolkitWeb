import type {
  LevenbergMarquardtRegressionInput,
  LevenbergMarquardtRegressionResult,
} from './types.ts'

export type LevenbergMarquardtRegressionErrorCode =
  | 'nonFiniteInput'
  | 'invalidDamping'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'singularSystem'
  | 'numericalFailure'

const messages: Record<
  LevenbergMarquardtRegressionErrorCode,
  string
> = {
  nonFiniteInput:
    'All Levenberg–Marquardt inputs must be finite.',
  invalidDamping:
    'Initial damping must be greater than zero.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  singularSystem:
    'The damped normal equations became singular.',
  numericalFailure:
    'The regression produced a non-finite result.',
}

export class LevenbergMarquardtRegressionCalculationError extends Error {
  readonly code: LevenbergMarquardtRegressionErrorCode

  constructor(code: LevenbergMarquardtRegressionErrorCode) {
    super(messages[code])
    this.name =
      'LevenbergMarquardtRegressionCalculationError'
    this.code = code
  }
}

function residualSum(
  x: number[],
  y: number[],
  a: number,
  b: number,
): number {
  return x.reduce(
    (sum, value, index) => {
      const residual =
        y[index] - a * Math.exp(b * value)

      return sum + residual ** 2
    },
    0,
  )
}

export function calculateLevenbergMarquardtRegression(
  input: LevenbergMarquardtRegressionInput,
): LevenbergMarquardtRegressionResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new LevenbergMarquardtRegressionCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.initialDamping <= 0) {
    throw new LevenbergMarquardtRegressionCalculationError(
      'invalidDamping',
    )
  }

  if (input.tolerance <= 0) {
    throw new LevenbergMarquardtRegressionCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new LevenbergMarquardtRegressionCalculationError(
      'invalidMaximumIterations',
    )
  }

  const x = [input.x1, input.x2, input.x3, input.x4]
  const y = [input.y1, input.y2, input.y3, input.y4]

  let a = input.initialA
  let b = input.initialB
  let damping = input.initialDamping
  let currentSse = residualSum(x, y, a, b)
  let iterations = 0
  let acceptedSteps = 0
  let rejectedSteps = 0
  let converged = false

  while (iterations < input.maximumIterations) {
    let j11 = 0
    let j12 = 0
    let j22 = 0
    let g1 = 0
    let g2 = 0

    for (let i = 0; i < x.length; i += 1) {
      const exponential = Math.exp(b * x[i])
      const prediction = a * exponential
      const residual = y[i] - prediction
      const derivativeA = exponential
      const derivativeB = a * x[i] * exponential

      j11 += derivativeA ** 2
      j12 += derivativeA * derivativeB
      j22 += derivativeB ** 2
      g1 += derivativeA * residual
      g2 += derivativeB * residual
    }

    const m11 = j11 + damping
    const m22 = j22 + damping
    const determinant =
      m11 * m22 - j12 ** 2

    if (Math.abs(determinant) < 1e-20) {
      throw new LevenbergMarquardtRegressionCalculationError(
        'singularSystem',
      )
    }

    const deltaA =
      (g1 * m22 - j12 * g2) /
      determinant
    const deltaB =
      (m11 * g2 - j12 * g1) /
      determinant

    const candidateA = a + deltaA
    const candidateB = b + deltaB
    const candidateSse =
      residualSum(
        x,
        y,
        candidateA,
        candidateB,
      )

    iterations += 1

    if (
      ![
        candidateA,
        candidateB,
        candidateSse,
        deltaA,
        deltaB,
        damping,
      ].every(Number.isFinite)
    ) {
      throw new LevenbergMarquardtRegressionCalculationError(
        'numericalFailure',
      )
    }

    if (candidateSse < currentSse) {
      a = candidateA
      b = candidateB
      currentSse = candidateSse
      damping = Math.max(1e-15, damping / 3)
      acceptedSteps += 1

      if (
        Math.hypot(deltaA, deltaB) <=
        input.tolerance *
        Math.max(1, Math.hypot(a, b))
      ) {
        converged = true
        break
      }
    } else {
      damping *= 10
      rejectedSteps += 1
    }
  }

  const rootMeanSquareError =
    Math.sqrt(currentSse / x.length)

  if (
    ![
      a,
      b,
      currentSse,
      rootMeanSquareError,
      damping,
    ].every(Number.isFinite)
  ) {
    throw new LevenbergMarquardtRegressionCalculationError(
      'numericalFailure',
    )
  }

  return {
    parameterA: a,
    parameterB: b,
    residualSumOfSquares: currentSse,
    rootMeanSquareError,
    iterations,
    acceptedSteps,
    rejectedSteps,
    finalDamping: damping,
    converged,
    modelName:
      'Levenberg–Marquardt nonlinear regression for y = a exp(bx)',
    limitationDescription:
      'The implementation uses diagonal damping on the two-parameter normal equations. Convergence still depends on the starting values and data scaling.',
  }
}
