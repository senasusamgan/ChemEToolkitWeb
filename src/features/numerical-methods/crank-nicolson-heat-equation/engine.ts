import type {
  CrankNicolsonHeatEquationInput,
  CrankNicolsonHeatEquationResult,
} from './types.ts'

export type CrankNicolsonHeatEquationErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidNodeCount'
  | 'numericalFailure'

const messages: Record<
  CrankNicolsonHeatEquationErrorCode,
  string
> = {
  nonFiniteInput:
    'All Crank–Nicolson inputs must be finite.',
  nonPositiveProperty:
    'Thermal diffusivity, slab length, final time and time step must be greater than zero.',
  invalidNodeCount:
    'Spatial nodes must be an integer of at least 3.',
  numericalFailure:
    'The Crank–Nicolson solution produced a non-finite result.',
}

export class CrankNicolsonHeatEquationCalculationError extends Error {
  readonly code: CrankNicolsonHeatEquationErrorCode

  constructor(code: CrankNicolsonHeatEquationErrorCode) {
    super(messages[code])
    this.name =
      'CrankNicolsonHeatEquationCalculationError'
    this.code = code
  }
}

function solveTridiagonal(
  lower: number[],
  diagonal: number[],
  upper: number[],
  rhs: number[],
): number[] {
  const n = diagonal.length
  const cPrime = new Array<number>(n).fill(0)
  const dPrime = new Array<number>(n).fill(0)

  if (Math.abs(diagonal[0]) < 1e-15) {
    throw new CrankNicolsonHeatEquationCalculationError(
      'numericalFailure',
    )
  }

  cPrime[0] = n > 1 ? upper[0] / diagonal[0] : 0
  dPrime[0] = rhs[0] / diagonal[0]

  for (let i = 1; i < n; i += 1) {
    const denominator =
      diagonal[i] - lower[i - 1] * cPrime[i - 1]

    if (Math.abs(denominator) < 1e-15) {
      throw new CrankNicolsonHeatEquationCalculationError(
        'numericalFailure',
      )
    }

    cPrime[i] =
      i < n - 1
        ? upper[i] / denominator
        : 0

    dPrime[i] =
      (
        rhs[i] -
        lower[i - 1] * dPrime[i - 1]
      ) /
      denominator
  }

  const solution = new Array<number>(n).fill(0)
  solution[n - 1] = dPrime[n - 1]

  for (let i = n - 2; i >= 0; i -= 1) {
    solution[i] =
      dPrime[i] -
      cPrime[i] * solution[i + 1]
  }

  return solution
}

export function calculateCrankNicolsonHeatEquation(
  input: CrankNicolsonHeatEquationInput,
): CrankNicolsonHeatEquationResult {
  const values = [
    input.thermalDiffusivity,
    input.slabLength,
    input.initialTemperature,
    input.leftBoundaryTemperature,
    input.rightBoundaryTemperature,
    input.finalTime,
    input.spatialNodes,
    input.timeStep,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CrankNicolsonHeatEquationCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.thermalDiffusivity <= 0 ||
    input.slabLength <= 0 ||
    input.finalTime <= 0 ||
    input.timeStep <= 0
  ) {
    throw new CrankNicolsonHeatEquationCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    !Number.isInteger(input.spatialNodes) ||
    input.spatialNodes < 3
  ) {
    throw new CrankNicolsonHeatEquationCalculationError(
      'invalidNodeCount',
    )
  }

  const timeSteps = Math.ceil(
    input.finalTime / input.timeStep,
  )
  const effectiveTimeStep =
    input.finalTime / timeSteps
  const spatialStep =
    input.slabLength /
    (input.spatialNodes - 1)
  const fourierNumber =
    input.thermalDiffusivity *
    effectiveTimeStep /
    spatialStep ** 2

  const interiorCount = input.spatialNodes - 2
  const lower = new Array<number>(
    Math.max(0, interiorCount - 1),
  ).fill(-0.5 * fourierNumber)
  const diagonal = new Array<number>(
    interiorCount,
  ).fill(1 + fourierNumber)
  const upper = new Array<number>(
    Math.max(0, interiorCount - 1),
  ).fill(-0.5 * fourierNumber)

  let profile = new Array<number>(
    input.spatialNodes,
  ).fill(input.initialTemperature)

  profile[0] = input.leftBoundaryTemperature
  profile[input.spatialNodes - 1] =
    input.rightBoundaryTemperature

  for (let step = 0; step < timeSteps; step += 1) {
    const rhs = new Array<number>(
      interiorCount,
    ).fill(0)

    for (let i = 0; i < interiorCount; i += 1) {
      const node = i + 1

      rhs[i] =
        0.5 * fourierNumber * profile[node - 1] +
        (1 - fourierNumber) * profile[node] +
        0.5 * fourierNumber * profile[node + 1]
    }

    rhs[0] +=
      0.5 *
      fourierNumber *
      input.leftBoundaryTemperature

    rhs[interiorCount - 1] +=
      0.5 *
      fourierNumber *
      input.rightBoundaryTemperature

    const interior = solveTridiagonal(
      lower,
      diagonal,
      upper,
      rhs,
    )

    profile = [
      input.leftBoundaryTemperature,
      ...interior,
      input.rightBoundaryTemperature,
    ]
  }

  if (!profile.every(Number.isFinite)) {
    throw new CrankNicolsonHeatEquationCalculationError(
      'numericalFailure',
    )
  }

  const centerIndex =
    Math.floor((input.spatialNodes - 1) / 2)
  const centerTemperature =
    profile[centerIndex]
  const minimumTemperature =
    Math.min(...profile)
  const maximumTemperature =
    Math.max(...profile)
  const averageTemperature =
    profile.reduce(
      (sum, value) => sum + value,
      0,
    ) / profile.length

  return {
    centerTemperature,
    minimumTemperature,
    maximumTemperature,
    averageTemperature,
    spatialStep,
    effectiveTimeStep,
    timeSteps,
    fourierNumber,
    profile,
    modelName:
      'Crank–Nicolson finite-difference solution of the one-dimensional transient heat equation',
    limitationDescription:
      'The slab has constant thermal diffusivity and fixed boundary temperatures. Internal heat generation and temperature-dependent properties are not included.',
  }
}
