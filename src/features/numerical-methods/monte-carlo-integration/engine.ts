import type {
  MonteCarloIntegrationInput,
  MonteCarloIntegrationResult,
} from './types.ts'

export type MonteCarloIntegrationErrorCode =
  | 'nonFiniteInput'
  | 'invalidBounds'
  | 'invalidSampleCount'
  | 'invalidSeed'
  | 'numericalFailure'

const messages: Record<
  MonteCarloIntegrationErrorCode,
  string
> = {
  nonFiniteInput:
    'All Monte Carlo inputs must be finite.',
  invalidBounds:
    'Upper bound must be greater than lower bound.',
  invalidSampleCount:
    'Sample count must be an integer from 10 through 10,000,000.',
  invalidSeed:
    'Random seed must be an integer.',
  numericalFailure:
    'The Monte Carlo calculation produced a non-finite result.',
}

export class MonteCarloIntegrationCalculationError extends Error {
  readonly code: MonteCarloIntegrationErrorCode

  constructor(code: MonteCarloIntegrationErrorCode) {
    super(messages[code])
    this.name =
      'MonteCarloIntegrationCalculationError'
    this.code = code
  }
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state =
      (1664525 * state + 1013904223) >>> 0

    return state / 4294967296
  }
}

function polynomial(
  x: number,
  input: MonteCarloIntegrationInput,
): number {
  return (
    input.coefficient3 * x ** 3 +
    input.coefficient2 * x ** 2 +
    input.coefficient1 * x +
    input.coefficient0
  )
}

export function calculateMonteCarloIntegration(
  input: MonteCarloIntegrationInput,
): MonteCarloIntegrationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new MonteCarloIntegrationCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.upperBound <= input.lowerBound) {
    throw new MonteCarloIntegrationCalculationError(
      'invalidBounds',
    )
  }

  if (
    !Number.isInteger(input.sampleCount) ||
    input.sampleCount < 10 ||
    input.sampleCount > 10_000_000
  ) {
    throw new MonteCarloIntegrationCalculationError(
      'invalidSampleCount',
    )
  }

  if (!Number.isInteger(input.randomSeed)) {
    throw new MonteCarloIntegrationCalculationError(
      'invalidSeed',
    )
  }

  const random = createRandom(input.randomSeed)
  const width =
    input.upperBound - input.lowerBound

  let mean = 0
  let m2 = 0

  for (let i = 1; i <= input.sampleCount; i += 1) {
    const x =
      input.lowerBound +
      width * random()
    const value = polynomial(x, input)
    const delta = value - mean
    mean += delta / i
    m2 += delta * (value - mean)
  }

  const variance =
    m2 / (input.sampleCount - 1)
  const sampleStandardDeviation =
    Math.sqrt(Math.max(0, variance))
  const integralEstimate =
    width * mean
  const standardError =
    width *
    sampleStandardDeviation /
    Math.sqrt(input.sampleCount)

  const exactAntiderivative = (x: number) =>
    input.coefficient3 * x ** 4 / 4 +
    input.coefficient2 * x ** 3 / 3 +
    input.coefficient1 * x ** 2 / 2 +
    input.coefficient0 * x

  const exactIntegral =
    exactAntiderivative(input.upperBound) -
    exactAntiderivative(input.lowerBound)

  const absoluteError =
    Math.abs(integralEstimate - exactIntegral)
  const confidenceLower95 =
    integralEstimate - 1.96 * standardError
  const confidenceUpper95 =
    integralEstimate + 1.96 * standardError

  const results = [
    integralEstimate,
    exactIntegral,
    absoluteError,
    standardError,
    confidenceLower95,
    confidenceUpper95,
    mean,
    sampleStandardDeviation,
  ]

  if (!results.every(Number.isFinite)) {
    throw new MonteCarloIntegrationCalculationError(
      'numericalFailure',
    )
  }

  return {
    integralEstimate,
    exactIntegral,
    absoluteError,
    standardError,
    confidenceLower95,
    confidenceUpper95,
    sampleMean: mean,
    sampleStandardDeviation,
    modelName:
      'Seeded plain Monte Carlo integration with uniform sampling',
    limitationDescription:
      'The integrand is a cubic polynomial. Statistical error decreases approximately with the inverse square root of sample count.',
  }
}
