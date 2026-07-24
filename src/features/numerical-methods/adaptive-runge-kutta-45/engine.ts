import type {
  AdaptiveRungeKutta45Input,
  AdaptiveRungeKutta45Result,
} from './types.ts'

export type AdaptiveRungeKutta45ErrorCode =
  | 'nonFiniteInput'
  | 'invalidInterval'
  | 'invalidTolerance'
  | 'invalidStep'
  | 'invalidMaximumSteps'
  | 'stepLimitExceeded'
  | 'stepUnderflow'
  | 'numericalFailure'

const messages: Record<
  AdaptiveRungeKutta45ErrorCode,
  string
> = {
  nonFiniteInput:
    'All adaptive RK45 inputs must be finite.',
  invalidInterval:
    'Final x must be greater than initial x.',
  invalidTolerance:
    'Absolute and relative tolerances must be greater than zero.',
  invalidStep:
    'Initial step size must be greater than zero.',
  invalidMaximumSteps:
    'Maximum steps must be a positive integer.',
  stepLimitExceeded:
    'The adaptive solver exceeded the maximum number of attempts.',
  stepUnderflow:
    'The required adaptive step became too small.',
  numericalFailure:
    'The adaptive integration produced a non-finite result.',
}

export class AdaptiveRungeKutta45CalculationError extends Error {
  readonly code: AdaptiveRungeKutta45ErrorCode

  constructor(code: AdaptiveRungeKutta45ErrorCode) {
    super(messages[code])
    this.name =
      'AdaptiveRungeKutta45CalculationError'
    this.code = code
  }
}

function derivative(
  y: number,
  coefficientA: number,
  forcingB: number,
): number {
  return coefficientA * y + forcingB
}

export function calculateAdaptiveRungeKutta45(
  input: AdaptiveRungeKutta45Input,
): AdaptiveRungeKutta45Result {
  const values = [
    input.initialX,
    input.finalX,
    input.initialY,
    input.coefficientA,
    input.forcingB,
    input.initialStepSize,
    input.absoluteTolerance,
    input.relativeTolerance,
    input.maximumSteps,
  ]

  if (!values.every(Number.isFinite)) {
    throw new AdaptiveRungeKutta45CalculationError(
      'nonFiniteInput',
    )
  }

  if (input.finalX <= input.initialX) {
    throw new AdaptiveRungeKutta45CalculationError(
      'invalidInterval',
    )
  }

  if (input.initialStepSize <= 0) {
    throw new AdaptiveRungeKutta45CalculationError(
      'invalidStep',
    )
  }

  if (
    input.absoluteTolerance <= 0 ||
    input.relativeTolerance <= 0
  ) {
    throw new AdaptiveRungeKutta45CalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumSteps) ||
    input.maximumSteps <= 0
  ) {
    throw new AdaptiveRungeKutta45CalculationError(
      'invalidMaximumSteps',
    )
  }

  let x = input.initialX
  let y = input.initialY
  let h = Math.min(
    input.initialStepSize,
    input.finalX - input.initialX,
  )

  let acceptedSteps = 0
  let rejectedSteps = 0
  let totalAttempts = 0
  let minimumAcceptedStep = Number.POSITIVE_INFINITY
  let maximumAcceptedStep = 0
  let lastErrorEstimate = 0

  const minimumStep =
    1e-14 *
    Math.max(
      1,
      Math.abs(input.initialX),
      Math.abs(input.finalX),
    )

  while (x < input.finalX) {
    if (totalAttempts >= input.maximumSteps) {
      throw new AdaptiveRungeKutta45CalculationError(
        'stepLimitExceeded',
      )
    }

    if (h < minimumStep) {
      throw new AdaptiveRungeKutta45CalculationError(
        'stepUnderflow',
      )
    }

    if (x + h > input.finalX) {
      h = input.finalX - x
    }

    const f = (value: number) =>
      derivative(
        value,
        input.coefficientA,
        input.forcingB,
      )

    const k1 = f(y)
    const k2 = f(y + h * (1 / 5) * k1)
    const k3 = f(
      y +
      h *
      (
        3 / 40 * k1 +
        9 / 40 * k2
      ),
    )
    const k4 = f(
      y +
      h *
      (
        44 / 45 * k1 -
        56 / 15 * k2 +
        32 / 9 * k3
      ),
    )
    const k5 = f(
      y +
      h *
      (
        19372 / 6561 * k1 -
        25360 / 2187 * k2 +
        64448 / 6561 * k3 -
        212 / 729 * k4
      ),
    )
    const k6 = f(
      y +
      h *
      (
        9017 / 3168 * k1 -
        355 / 33 * k2 +
        46732 / 5247 * k3 +
        49 / 176 * k4 -
        5103 / 18656 * k5
      ),
    )

    const y5 =
      y +
      h *
      (
        35 / 384 * k1 +
        500 / 1113 * k3 +
        125 / 192 * k4 -
        2187 / 6784 * k5 +
        11 / 84 * k6
      )

    const k7 = f(y5)

    const y4 =
      y +
      h *
      (
        5179 / 57600 * k1 +
        7571 / 16695 * k3 +
        393 / 640 * k4 -
        92097 / 339200 * k5 +
        187 / 2100 * k6 +
        1 / 40 * k7
      )

    const errorEstimate = Math.abs(y5 - y4)
    const scale =
      input.absoluteTolerance +
      input.relativeTolerance *
      Math.max(Math.abs(y), Math.abs(y5))

    const normalizedError =
      errorEstimate / scale

    totalAttempts += 1
    lastErrorEstimate = errorEstimate

    if (
      !Number.isFinite(y5) ||
      !Number.isFinite(normalizedError)
    ) {
      throw new AdaptiveRungeKutta45CalculationError(
        'numericalFailure',
      )
    }

    const accepted =
      normalizedError <= 1

    if (accepted) {
      x += h
      y = y5
      acceptedSteps += 1
      minimumAcceptedStep =
        Math.min(minimumAcceptedStep, h)
      maximumAcceptedStep =
        Math.max(maximumAcceptedStep, h)
    } else {
      rejectedSteps += 1
    }

    const factor =
      normalizedError === 0
        ? 5
        : Math.min(
            5,
            Math.max(
              0.2,
              0.9 *
              normalizedError ** (-0.2),
            ),
          )

    h *= factor
  }

  if (
    !Number.isFinite(y) ||
    acceptedSteps === 0
  ) {
    throw new AdaptiveRungeKutta45CalculationError(
      'numericalFailure',
    )
  }

  return {
    finalY: y,
    acceptedSteps,
    rejectedSteps,
    totalAttempts,
    minimumAcceptedStep,
    maximumAcceptedStep,
    lastErrorEstimate,
    finalStepSize: h,
    modelName:
      'Dormand–Prince embedded Runge–Kutta 4/5',
    limitationDescription:
      'This calculator integrates y′ = ay + b. It uses local error control but is not intended for stiff equations.',
  }
}
