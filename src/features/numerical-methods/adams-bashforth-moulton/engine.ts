import type {
  AdamsBashforthMoultonInput,
  AdamsBashforthMoultonResult,
} from './types.ts'

export type AdamsBashforthMoultonErrorCode =
  | 'nonFiniteInput'
  | 'invalidInterval'
  | 'invalidStep'
  | 'insufficientSteps'
  | 'numericalFailure'

const messages: Record<
  AdamsBashforthMoultonErrorCode,
  string
> = {
  nonFiniteInput:
    'All Adams–Bashforth–Moulton inputs must be finite.',
  invalidInterval:
    'Final x must be greater than initial x.',
  invalidStep:
    'Step size must be greater than zero and divide the integration interval.',
  insufficientSteps:
    'At least four uniform steps are required.',
  numericalFailure:
    'The integration produced a non-finite result.',
}

export class AdamsBashforthMoultonCalculationError extends Error {
  readonly code: AdamsBashforthMoultonErrorCode

  constructor(code: AdamsBashforthMoultonErrorCode) {
    super(messages[code])
    this.name =
      'AdamsBashforthMoultonCalculationError'
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

function rk4Step(
  y: number,
  h: number,
  coefficientA: number,
  forcingB: number,
): number {
  const k1 = derivative(y, coefficientA, forcingB)
  const k2 = derivative(
    y + 0.5 * h * k1,
    coefficientA,
    forcingB,
  )
  const k3 = derivative(
    y + 0.5 * h * k2,
    coefficientA,
    forcingB,
  )
  const k4 = derivative(
    y + h * k3,
    coefficientA,
    forcingB,
  )

  return y + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6
}

export function calculateAdamsBashforthMoulton(
  input: AdamsBashforthMoultonInput,
): AdamsBashforthMoultonResult {
  const values = [
    input.initialX,
    input.finalX,
    input.initialY,
    input.coefficientA,
    input.forcingB,
    input.stepSize,
  ]

  if (!values.every(Number.isFinite)) {
    throw new AdamsBashforthMoultonCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.finalX <= input.initialX) {
    throw new AdamsBashforthMoultonCalculationError(
      'invalidInterval',
    )
  }

  if (input.stepSize <= 0) {
    throw new AdamsBashforthMoultonCalculationError(
      'invalidStep',
    )
  }

  const rawStepCount =
    (input.finalX - input.initialX) /
    input.stepSize

  const stepCount = Math.round(rawStepCount)

  if (Math.abs(rawStepCount - stepCount) > 1e-9) {
    throw new AdamsBashforthMoultonCalculationError(
      'invalidStep',
    )
  }

  if (stepCount < 4) {
    throw new AdamsBashforthMoultonCalculationError(
      'insufficientSteps',
    )
  }

  const yValues: number[] = [input.initialY]
  const fValues: number[] = [
    derivative(
      input.initialY,
      input.coefficientA,
      input.forcingB,
    ),
  ]

  for (let index = 0; index < 3; index += 1) {
    const nextY = rk4Step(
      yValues[index],
      input.stepSize,
      input.coefficientA,
      input.forcingB,
    )
    yValues.push(nextY)
    fValues.push(
      derivative(
        nextY,
        input.coefficientA,
        input.forcingB,
      ),
    )
  }

  let lastPredictor = yValues[3]
  let lastCorrector = yValues[3]
  let maximumCorrectionMagnitude = 0

  for (let n = 3; n < stepCount; n += 1) {
    const predictor =
      yValues[n] +
      input.stepSize *
      (
        55 * fValues[n] -
        59 * fValues[n - 1] +
        37 * fValues[n - 2] -
        9 * fValues[n - 3]
      ) /
      24

    const predictedDerivative =
      derivative(
        predictor,
        input.coefficientA,
        input.forcingB,
      )

    const corrector =
      yValues[n] +
      input.stepSize *
      (
        9 * predictedDerivative +
        19 * fValues[n] -
        5 * fValues[n - 1] +
        fValues[n - 2]
      ) /
      24

    const correctionMagnitude =
      Math.abs(corrector - predictor)

    maximumCorrectionMagnitude =
      Math.max(
        maximumCorrectionMagnitude,
        correctionMagnitude,
      )

    yValues.push(corrector)
    fValues.push(
      derivative(
        corrector,
        input.coefficientA,
        input.forcingB,
      ),
    )

    lastPredictor = predictor
    lastCorrector = corrector
  }

  const finalY = yValues[stepCount]

  const results = [
    finalY,
    lastPredictor,
    lastCorrector,
    maximumCorrectionMagnitude,
  ]

  if (!results.every(Number.isFinite)) {
    throw new AdamsBashforthMoultonCalculationError(
      'numericalFailure',
    )
  }

  return {
    finalY,
    finalX: input.finalX,
    stepCount,
    lastPredictor,
    lastCorrector,
    lastCorrectionMagnitude:
      Math.abs(lastCorrector - lastPredictor),
    maximumCorrectionMagnitude,
    modelName:
      'AB4 predictor with AM4 corrector and RK4 startup',
    limitationDescription:
      'This calculator integrates the linear test equation y′ = ay + b on a uniform grid. Stiff systems require a dedicated implicit solver.',
  }
}
