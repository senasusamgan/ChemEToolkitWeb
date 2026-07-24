import type {
  NumericalJacobianInput,
  NumericalJacobianResult,
} from './types.ts'

export type NumericalJacobianErrorCode =
  | 'nonFiniteInput'
  | 'invalidStep'
  | 'numericalFailure'

const messages: Record<NumericalJacobianErrorCode, string> = {
  nonFiniteInput:
    'All numerical-Jacobian inputs must be finite.',
  invalidStep:
    'Both finite-difference step sizes must be greater than zero.',
  numericalFailure:
    'The numerical Jacobian produced a non-finite result.',
}

export class NumericalJacobianCalculationError extends Error {
  readonly code: NumericalJacobianErrorCode

  constructor(code: NumericalJacobianErrorCode) {
    super(messages[code])
    this.name = 'NumericalJacobianCalculationError'
    this.code = code
  }
}

function functions(
  x: number,
  y: number,
  input: NumericalJacobianInput,
): [number, number] {
  return [
    x ** 2 + y ** 2 - input.circleConstant,
    Math.exp(x) + y - input.exponentialConstant,
  ]
}

export function calculateNumericalJacobian(
  input: NumericalJacobianInput,
): NumericalJacobianResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new NumericalJacobianCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.stepX <= 0 || input.stepY <= 0) {
    throw new NumericalJacobianCalculationError(
      'invalidStep',
    )
  }

  const fxPlus = functions(
    input.x + input.stepX,
    input.y,
    input,
  )
  const fxMinus = functions(
    input.x - input.stepX,
    input.y,
    input,
  )
  const fyPlus = functions(
    input.x,
    input.y + input.stepY,
    input,
  )
  const fyMinus = functions(
    input.x,
    input.y - input.stepY,
    input,
  )

  const j11 =
    (fxPlus[0] - fxMinus[0]) /
    (2 * input.stepX)
  const j21 =
    (fxPlus[1] - fxMinus[1]) /
    (2 * input.stepX)
  const j12 =
    (fyPlus[0] - fyMinus[0]) /
    (2 * input.stepY)
  const j22 =
    (fyPlus[1] - fyMinus[1]) /
    (2 * input.stepY)

  const analyticalJ11 = 2 * input.x
  const analyticalJ12 = 2 * input.y
  const analyticalJ21 = Math.exp(input.x)
  const analyticalJ22 = 1

  const determinant =
    j11 * j22 - j12 * j21

  const maximumAbsoluteError = Math.max(
    Math.abs(j11 - analyticalJ11),
    Math.abs(j12 - analyticalJ12),
    Math.abs(j21 - analyticalJ21),
    Math.abs(j22 - analyticalJ22),
  )

  const rowNorm1 = Math.abs(j11) + Math.abs(j12)
  const rowNorm2 = Math.abs(j21) + Math.abs(j22)
  const matrixInfinityNorm = Math.max(rowNorm1, rowNorm2)

  const inverseInfinityNorm =
    Math.abs(determinant) < 1e-30
      ? Number.POSITIVE_INFINITY
      : Math.max(
          (Math.abs(j22) + Math.abs(j12)) /
            Math.abs(determinant),
          (Math.abs(j21) + Math.abs(j11)) /
            Math.abs(determinant),
        )

  const conditionIndicator =
    matrixInfinityNorm * inverseInfinityNorm

  const results = [
    j11, j12, j21, j22,
    determinant,
    analyticalJ11,
    analyticalJ12,
    analyticalJ21,
    analyticalJ22,
    maximumAbsoluteError,
    conditionIndicator,
  ]

  if (!results.every(Number.isFinite)) {
    throw new NumericalJacobianCalculationError(
      'numericalFailure',
    )
  }

  return {
    j11,
    j12,
    j21,
    j22,
    determinant,
    analyticalJ11,
    analyticalJ12,
    analyticalJ21,
    analyticalJ22,
    maximumAbsoluteError,
    conditionIndicator,
    modelName:
      'Second-order central finite-difference Jacobian',
    limitationDescription:
      'The test system is x² + y² − c₁ and exp(x) + y − c₂. Step sizes that are too small can amplify floating-point cancellation.',
  }
}
