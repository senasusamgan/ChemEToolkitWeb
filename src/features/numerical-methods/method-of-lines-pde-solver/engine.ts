import type {
  MethodOfLinesPDESolverInput,
  MethodOfLinesPDESolverResult,
} from './types.ts'

export type MethodOfLinesPDESolverErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidNodeCount'
  | 'unstableTimeStep'
  | 'numericalFailure'

const messages: Record<
  MethodOfLinesPDESolverErrorCode,
  string
> = {
  nonFiniteInput:
    'All method-of-lines inputs must be finite.',
  nonPositiveProperty:
    'Diffusivity, domain length, final time and time step must be greater than zero.',
  invalidNodeCount:
    'Interior nodes must be an integer from 1 through 100.',
  unstableTimeStep:
    'The explicit RK4 step is too large for the spatial discretization. Reduce Δt.',
  numericalFailure:
    'The method-of-lines integration produced a non-finite result.',
}

export class MethodOfLinesPDESolverCalculationError extends Error {
  readonly code: MethodOfLinesPDESolverErrorCode

  constructor(code: MethodOfLinesPDESolverErrorCode) {
    super(messages[code])
    this.name =
      'MethodOfLinesPDESolverCalculationError'
    this.code = code
  }
}

function derivative(
  interior: number[],
  input: MethodOfLinesPDESolverInput,
  spatialStep: number,
): number[] {
  const full = [
    input.leftBoundary,
    ...interior,
    input.rightBoundary,
  ]

  return interior.map(
    (_, index) =>
      input.diffusivity *
      (
        full[index] -
        2 * full[index + 1] +
        full[index + 2]
      ) /
      spatialStep ** 2,
  )
}

function addScaled(
  base: number[],
  increment: number[],
  scale: number,
): number[] {
  return base.map(
    (value, index) =>
      value + scale * increment[index],
  )
}

export function calculateMethodOfLinesPDESolver(
  input: MethodOfLinesPDESolverInput,
): MethodOfLinesPDESolverResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new MethodOfLinesPDESolverCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.diffusivity <= 0 ||
    input.domainLength <= 0 ||
    input.finalTime <= 0 ||
    input.timeStep <= 0
  ) {
    throw new MethodOfLinesPDESolverCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    !Number.isInteger(input.interiorNodes) ||
    input.interiorNodes < 1 ||
    input.interiorNodes > 100
  ) {
    throw new MethodOfLinesPDESolverCalculationError(
      'invalidNodeCount',
    )
  }

  const spatialStep =
    input.domainLength /
    (input.interiorNodes + 1)
  const timeSteps =
    Math.ceil(input.finalTime / input.timeStep)
  const effectiveTimeStep =
    input.finalTime / timeSteps
  const explicitStabilityNumber =
    input.diffusivity *
    effectiveTimeStep /
    spatialStep ** 2

  if (explicitStabilityNumber > 0.6) {
    throw new MethodOfLinesPDESolverCalculationError(
      'unstableTimeStep',
    )
  }

  let interior = new Array<number>(
    input.interiorNodes,
  ).fill(input.initialInteriorValue)

  for (let step = 0; step < timeSteps; step += 1) {
    const k1 =
      derivative(interior, input, spatialStep)
    const k2 =
      derivative(
        addScaled(
          interior,
          k1,
          0.5 * effectiveTimeStep,
        ),
        input,
        spatialStep,
      )
    const k3 =
      derivative(
        addScaled(
          interior,
          k2,
          0.5 * effectiveTimeStep,
        ),
        input,
        spatialStep,
      )
    const k4 =
      derivative(
        addScaled(
          interior,
          k3,
          effectiveTimeStep,
        ),
        input,
        spatialStep,
      )

    interior = interior.map(
      (value, index) =>
        value +
        effectiveTimeStep *
        (
          k1[index] +
          2 * k2[index] +
          2 * k3[index] +
          k4[index]
        ) /
        6,
    )
  }

  const profile = [
    input.leftBoundary,
    ...interior,
    input.rightBoundary,
  ]

  if (!profile.every(Number.isFinite)) {
    throw new MethodOfLinesPDESolverCalculationError(
      'numericalFailure',
    )
  }

  const centerIndex =
    Math.floor((profile.length - 1) / 2)
  const centerValue =
    profile[centerIndex]
  const minimumValue =
    Math.min(...profile)
  const maximumValue =
    Math.max(...profile)
  const averageValue =
    profile.reduce(
      (sum, value) => sum + value,
      0,
    ) / profile.length

  return {
    centerValue,
    minimumValue,
    maximumValue,
    averageValue,
    spatialStep,
    timeSteps,
    effectiveTimeStep,
    explicitStabilityNumber,
    profile,
    modelName:
      'Method of lines for the one-dimensional diffusion equation with RK4 time integration',
    limitationDescription:
      'The spatial derivative uses second-order central differences and fixed boundary values. The explicit RK4 time step must remain sufficiently small.',
  }
}
