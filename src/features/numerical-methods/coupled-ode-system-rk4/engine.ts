import type {
  CoupledODESystemRK4Input,
  CoupledODESystemRK4Result,
} from './types.ts'

export type CoupledODESystemRK4ErrorCode =
  | 'nonFiniteInput'
  | 'invalidInterval'
  | 'invalidStep'
  | 'numericalFailure'

const messages: Record<
  CoupledODESystemRK4ErrorCode,
  string
> = {
  nonFiniteInput:
    'All coupled RK4 inputs must be finite.',
  invalidInterval:
    'Final x must be greater than initial x.',
  invalidStep:
    'Step size must be positive and divide the interval.',
  numericalFailure:
    'The coupled integration produced a non-finite result.',
}

export class CoupledODESystemRK4CalculationError extends Error {
  readonly code: CoupledODESystemRK4ErrorCode

  constructor(code: CoupledODESystemRK4ErrorCode) {
    super(messages[code])
    this.name =
      'CoupledODESystemRK4CalculationError'
    this.code = code
  }
}

function derivatives(
  y1: number,
  y2: number,
  input: CoupledODESystemRK4Input,
): [number, number] {
  return [
    input.a11 * y1 + input.a12 * y2 + input.b1,
    input.a21 * y1 + input.a22 * y2 + input.b2,
  ]
}

export function calculateCoupledODESystemRK4(
  input: CoupledODESystemRK4Input,
): CoupledODESystemRK4Result {
  const values = [
    input.initialX,
    input.finalX,
    input.initialY1,
    input.initialY2,
    input.a11,
    input.a12,
    input.a21,
    input.a22,
    input.b1,
    input.b2,
    input.stepSize,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CoupledODESystemRK4CalculationError(
      'nonFiniteInput',
    )
  }

  if (input.finalX <= input.initialX) {
    throw new CoupledODESystemRK4CalculationError(
      'invalidInterval',
    )
  }

  if (input.stepSize <= 0) {
    throw new CoupledODESystemRK4CalculationError(
      'invalidStep',
    )
  }

  const rawSteps =
    (input.finalX - input.initialX) /
    input.stepSize
  const stepCount = Math.round(rawSteps)

  if (
    stepCount < 1 ||
    Math.abs(rawSteps - stepCount) > 1e-9
  ) {
    throw new CoupledODESystemRK4CalculationError(
      'invalidStep',
    )
  }

  let y1 = input.initialY1
  let y2 = input.initialY2

  for (let step = 0; step < stepCount; step += 1) {
    const [k11, k12] = derivatives(y1, y2, input)
    const [k21, k22] = derivatives(
      y1 + 0.5 * input.stepSize * k11,
      y2 + 0.5 * input.stepSize * k12,
      input,
    )
    const [k31, k32] = derivatives(
      y1 + 0.5 * input.stepSize * k21,
      y2 + 0.5 * input.stepSize * k22,
      input,
    )
    const [k41, k42] = derivatives(
      y1 + input.stepSize * k31,
      y2 + input.stepSize * k32,
      input,
    )

    y1 +=
      input.stepSize *
      (k11 + 2 * k21 + 2 * k31 + k41) /
      6

    y2 +=
      input.stepSize *
      (k12 + 2 * k22 + 2 * k32 + k42) /
      6
  }

  const stateNorm = Math.hypot(y1, y2)

  if (
    ![y1, y2, stateNorm].every(Number.isFinite)
  ) {
    throw new CoupledODESystemRK4CalculationError(
      'numericalFailure',
    )
  }

  return {
    finalY1: y1,
    finalY2: y2,
    stepCount,
    finalX: input.finalX,
    stateNorm,
    modelName:
      'Classical fourth-order Runge–Kutta for a two-state linear system',
    limitationDescription:
      'The implemented system is y′ = Ay + b with constant 2×2 coefficients. Strongly stiff systems require an implicit method.',
  }
}
