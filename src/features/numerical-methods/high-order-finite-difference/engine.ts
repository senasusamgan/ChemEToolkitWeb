import type {
  HighOrderFiniteDifferenceInput,
  HighOrderFiniteDifferenceResult,
} from './types.ts'

export type HighOrderFiniteDifferenceErrorCode =
  | 'nonFiniteInput'
  | 'invalidStep'
  | 'numericalFailure'

const messages: Record<
  HighOrderFiniteDifferenceErrorCode,
  string
> = {
  nonFiniteInput:
    'All high-order finite-difference inputs must be finite.',
  invalidStep:
    'Step size must be greater than zero.',
  numericalFailure:
    'The finite-difference calculation produced a non-finite result.',
}

export class HighOrderFiniteDifferenceCalculationError extends Error {
  readonly code: HighOrderFiniteDifferenceErrorCode

  constructor(code: HighOrderFiniteDifferenceErrorCode) {
    super(messages[code])
    this.name =
      'HighOrderFiniteDifferenceCalculationError'
    this.code = code
  }
}

function polynomial(
  x: number,
  input: HighOrderFiniteDifferenceInput,
): number {
  return (
    input.coefficient4 * x ** 4 +
    input.coefficient3 * x ** 3 +
    input.coefficient2 * x ** 2 +
    input.coefficient1 * x +
    input.coefficient0
  )
}

export function calculateHighOrderFiniteDifference(
  input: HighOrderFiniteDifferenceInput,
): HighOrderFiniteDifferenceResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new HighOrderFiniteDifferenceCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.stepSize <= 0) {
    throw new HighOrderFiniteDifferenceCalculationError(
      'invalidStep',
    )
  }

  const x = input.evaluationX
  const h = input.stepSize

  const fm2 = polynomial(x - 2 * h, input)
  const fm1 = polynomial(x - h, input)
  const f0 = polynomial(x, input)
  const fp1 = polynomial(x + h, input)
  const fp2 = polynomial(x + 2 * h, input)

  const firstDerivative =
    (
      fm2 -
      8 * fm1 +
      8 * fp1 -
      fp2
    ) /
    (12 * h)

  const secondDerivative =
    (
      -fp2 +
      16 * fp1 -
      30 * f0 +
      16 * fm1 -
      fm2
    ) /
    (12 * h ** 2)

  const exactFirstDerivative =
    4 * input.coefficient4 * x ** 3 +
    3 * input.coefficient3 * x ** 2 +
    2 * input.coefficient2 * x +
    input.coefficient1

  const exactSecondDerivative =
    12 * input.coefficient4 * x ** 2 +
    6 * input.coefficient3 * x +
    2 * input.coefficient2

  const firstDerivativeAbsoluteError =
    Math.abs(
      firstDerivative -
      exactFirstDerivative,
    )

  const secondDerivativeAbsoluteError =
    Math.abs(
      secondDerivative -
      exactSecondDerivative,
    )

  const results = [
    firstDerivative,
    secondDerivative,
    exactFirstDerivative,
    exactSecondDerivative,
    firstDerivativeAbsoluteError,
    secondDerivativeAbsoluteError,
  ]

  if (!results.every(Number.isFinite)) {
    throw new HighOrderFiniteDifferenceCalculationError(
      'numericalFailure',
    )
  }

  return {
    firstDerivative,
    secondDerivative,
    exactFirstDerivative,
    exactSecondDerivative,
    firstDerivativeAbsoluteError,
    secondDerivativeAbsoluteError,
    modelName:
      'Five-point fourth-order central finite differences',
    limitationDescription:
      'The demonstration function is a quartic polynomial. Very small step sizes may amplify floating-point cancellation.',
  }
}
