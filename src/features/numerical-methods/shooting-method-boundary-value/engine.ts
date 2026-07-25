import type {
  ShootingMethodBoundaryValueInput,
  ShootingMethodBoundaryValueResult,
} from './types.ts'

export type ShootingMethodBoundaryValueErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveDomain'
  | 'invalidIntegrationSteps'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'duplicateSlopeGuesses'
  | 'secantFailure'
  | 'numericalFailure'

const messages: Record<
  ShootingMethodBoundaryValueErrorCode,
  string
> = {
  nonFiniteInput:
    'All shooting-method inputs must be finite.',
  nonPositiveDomain:
    'Domain length must be greater than zero.',
  invalidIntegrationSteps:
    'Integration steps must be an integer from 10 through 100,000.',
  invalidTolerance:
    'Boundary tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  duplicateSlopeGuesses:
    'The two initial slope guesses must be different.',
  secantFailure:
    'The secant update became singular.',
  numericalFailure:
    'The shooting calculation produced a non-finite result.',
}

export class ShootingMethodBoundaryValueCalculationError extends Error {
  readonly code: ShootingMethodBoundaryValueErrorCode

  constructor(code: ShootingMethodBoundaryValueErrorCode) {
    super(messages[code])
    this.name =
      'ShootingMethodBoundaryValueCalculationError'
    this.code = code
  }
}

interface IntegrationResult {
  finalValue: number
  profile: number[]
}

function integrate(
  slope: number,
  input: ShootingMethodBoundaryValueInput,
): IntegrationResult {
  const step =
    input.domainLength / input.integrationSteps

  let y = input.leftBoundaryValue
  let velocity = slope
  const profile = [y]

  const derivatives = (
    currentY: number,
    currentVelocity: number,
  ): [number, number] => [
    currentVelocity,
    -input.frequencySquared * currentY,
  ]

  for (let i = 0; i < input.integrationSteps; i += 1) {
    const [k1y, k1v] = derivatives(y, velocity)
    const [k2y, k2v] = derivatives(
      y + 0.5 * step * k1y,
      velocity + 0.5 * step * k1v,
    )
    const [k3y, k3v] = derivatives(
      y + 0.5 * step * k2y,
      velocity + 0.5 * step * k2v,
    )
    const [k4y, k4v] = derivatives(
      y + step * k3y,
      velocity + step * k3v,
    )

    y +=
      step *
      (k1y + 2 * k2y + 2 * k3y + k4y) /
      6

    velocity +=
      step *
      (k1v + 2 * k2v + 2 * k3v + k4v) /
      6

    profile.push(y)
  }

  return {
    finalValue: y,
    profile,
  }
}

export function calculateShootingMethodBoundaryValue(
  input: ShootingMethodBoundaryValueInput,
): ShootingMethodBoundaryValueResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.domainLength <= 0) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'nonPositiveDomain',
    )
  }

  if (
    !Number.isInteger(input.integrationSteps) ||
    input.integrationSteps < 10 ||
    input.integrationSteps > 100_000
  ) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'invalidIntegrationSteps',
    )
  }

  if (input.boundaryTolerance <= 0) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'invalidMaximumIterations',
    )
  }

  if (input.initialSlopeGuess1 === input.initialSlopeGuess2) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'duplicateSlopeGuesses',
    )
  }

  let slope1 = input.initialSlopeGuess1
  let slope2 = input.initialSlopeGuess2
  let result1 = integrate(slope1, input)
  let result2 = integrate(slope2, input)
  let residual1 =
    result1.finalValue - input.rightBoundaryValue
  let residual2 =
    result2.finalValue - input.rightBoundaryValue

  let iterations = 0
  let converged =
    Math.abs(residual2) <= input.boundaryTolerance

  while (
    !converged &&
    iterations < input.maximumIterations
  ) {
    const denominator = residual2 - residual1

    if (Math.abs(denominator) < 1e-18) {
      throw new ShootingMethodBoundaryValueCalculationError(
        'secantFailure',
      )
    }

    const slope3 =
      slope2 -
      residual2 *
      (slope2 - slope1) /
      denominator

    const result3 = integrate(slope3, input)
    const residual3 =
      result3.finalValue - input.rightBoundaryValue

    slope1 = slope2
    residual1 = residual2
    result1 = result2

    slope2 = slope3
    residual2 = residual3
    result2 = result3
    iterations += 1

    converged =
      Math.abs(residual2) <= input.boundaryTolerance
  }

  const centerIndex =
    Math.floor(result2.profile.length / 2)

  const centerValue = result2.profile[centerIndex]

  if (
    ![
      slope2,
      result2.finalValue,
      residual2,
      centerValue,
      ...result2.profile,
    ].every(Number.isFinite)
  ) {
    throw new ShootingMethodBoundaryValueCalculationError(
      'numericalFailure',
    )
  }

  return {
    initialSlope: slope2,
    achievedRightBoundary: result2.finalValue,
    boundaryResidual: residual2,
    centerValue,
    iterations,
    converged,
    profile: result2.profile,
    modelName:
      'Shooting method with secant slope updates and RK4 integration',
    limitationDescription:
      'The boundary-value equation is y″ + ω²y = 0. Near resonance, the boundary condition may be ill-conditioned or non-unique.',
  }
}
