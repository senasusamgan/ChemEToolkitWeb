import type {
  OneDimensionalWaveEquationInput,
  OneDimensionalWaveEquationResult,
} from './types.ts'

export type OneDimensionalWaveEquationErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidNodeCount'
  | 'unstableCourantNumber'
  | 'numericalFailure'

const messages: Record<
  OneDimensionalWaveEquationErrorCode,
  string
> = {
  nonFiniteInput:
    'All wave-equation inputs must be finite.',
  nonPositiveProperty:
    'Wave speed, domain length, final time and time step must be greater than zero.',
  invalidNodeCount:
    'Spatial nodes must be an integer from 3 through 501.',
  unstableCourantNumber:
    'The explicit wave scheme requires the Courant number to be at most one.',
  numericalFailure:
    'The wave-equation calculation produced a non-finite result.',
}

export class OneDimensionalWaveEquationCalculationError extends Error {
  readonly code: OneDimensionalWaveEquationErrorCode

  constructor(code: OneDimensionalWaveEquationErrorCode) {
    super(messages[code])
    this.name =
      'OneDimensionalWaveEquationCalculationError'
    this.code = code
  }
}

export function calculateOneDimensionalWaveEquation(
  input: OneDimensionalWaveEquationInput,
): OneDimensionalWaveEquationResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new OneDimensionalWaveEquationCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.waveSpeed <= 0 ||
    input.domainLength <= 0 ||
    input.finalTime <= 0 ||
    input.timeStep <= 0
  ) {
    throw new OneDimensionalWaveEquationCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    !Number.isInteger(input.spatialNodes) ||
    input.spatialNodes < 3 ||
    input.spatialNodes > 501
  ) {
    throw new OneDimensionalWaveEquationCalculationError(
      'invalidNodeCount',
    )
  }

  const spatialStep =
    input.domainLength /
    (input.spatialNodes - 1)

  const timeSteps =
    Math.ceil(input.finalTime / input.timeStep)

  const effectiveTimeStep =
    input.finalTime / timeSteps

  const courantNumber =
    input.waveSpeed *
    effectiveTimeStep /
    spatialStep

  if (courantNumber > 1 + 1e-12) {
    throw new OneDimensionalWaveEquationCalculationError(
      'unstableCourantNumber',
    )
  }

  const initial = Array.from(
    { length: input.spatialNodes },
    (_, index) => {
      const x = index * spatialStep
      return (
        input.initialAmplitude *
        Math.sin(Math.PI * x / input.domainLength)
      )
    },
  )

  initial[0] = 0
  initial[input.spatialNodes - 1] = 0

  const courantSquared = courantNumber ** 2

  let previous = [...initial]
  let current = new Array<number>(
    input.spatialNodes,
  ).fill(0)

  for (let i = 1; i < input.spatialNodes - 1; i += 1) {
    current[i] =
      previous[i] +
      0.5 *
      courantSquared *
      (
        previous[i + 1] -
        2 * previous[i] +
        previous[i - 1]
      )
  }

  current[0] = 0
  current[input.spatialNodes - 1] = 0

  for (let step = 1; step < timeSteps; step += 1) {
    const next = new Array<number>(
      input.spatialNodes,
    ).fill(0)

    for (let i = 1; i < input.spatialNodes - 1; i += 1) {
      next[i] =
        2 * current[i] -
        previous[i] +
        courantSquared *
        (
          current[i + 1] -
          2 * current[i] +
          current[i - 1]
        )
    }

    previous = current
    current = next
  }

  if (!current.every(Number.isFinite)) {
    throw new OneDimensionalWaveEquationCalculationError(
      'numericalFailure',
    )
  }

  const centerIndex =
    Math.floor((input.spatialNodes - 1) / 2)

  const centerDisplacement =
    current[centerIndex]

  const maximumAbsoluteDisplacement =
    Math.max(...current.map(Math.abs))

  const rootMeanSquareDisplacement =
    Math.sqrt(
      current.reduce(
        (sum, value) => sum + value ** 2,
        0,
      ) / current.length,
    )

  return {
    centerDisplacement,
    maximumAbsoluteDisplacement,
    rootMeanSquareDisplacement,
    spatialStep,
    effectiveTimeStep,
    timeSteps,
    courantNumber,
    profile: current,
    modelName:
      'Explicit second-order central-difference solution of the one-dimensional wave equation',
    limitationDescription:
      'The string has fixed endpoints, zero initial velocity and a single sine-mode initial displacement. Stability requires cΔt/Δx ≤ 1.',
  }
}
