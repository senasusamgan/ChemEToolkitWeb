import type {
  CubicRouthHurwitzStabilityInput,
  CubicRouthHurwitzStabilityResult,
} from './types.ts'

export type CubicRouthHurwitzStabilityErrorCode =
  | 'nonFiniteInput'
  | 'zeroLeadingCoefficient'
  | 'zeroSecondCoefficient'
  | 'numericalFailure'

const messages: Record<
  CubicRouthHurwitzStabilityErrorCode,
  string
> = {
  nonFiniteInput:
    'All cubic coefficients must be finite.',
  zeroLeadingCoefficient:
    'The s³ coefficient cannot be zero for a cubic polynomial.',
  zeroSecondCoefficient:
    'A zero s² coefficient creates a special Routh-table case that is outside this compact calculator.',
  numericalFailure:
    'The Routh–Hurwitz calculation produced a non-finite result.',
}

export class CubicRouthHurwitzStabilityCalculationError
  extends Error {
  readonly code: CubicRouthHurwitzStabilityErrorCode

  constructor(code: CubicRouthHurwitzStabilityErrorCode) {
    super(messages[code])
    this.name =
      'CubicRouthHurwitzStabilityCalculationError'
    this.code = code
  }
}

function countSignChanges(values: number[]): number {
  let changes = 0
  let previousSign = 0

  for (const value of values) {
    if (Math.abs(value) < 1e-12) {
      continue
    }

    const sign = value > 0 ? 1 : -1

    if (previousSign !== 0 && sign !== previousSign) {
      changes += 1
    }

    previousSign = sign
  }

  return changes
}

export function calculateCubicRouthHurwitzStability(
  input: CubicRouthHurwitzStabilityInput,
): CubicRouthHurwitzStabilityResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new CubicRouthHurwitzStabilityCalculationError(
      'nonFiniteInput',
    )
  }

  if (Math.abs(input.coefficient3) < 1e-15) {
    throw new CubicRouthHurwitzStabilityCalculationError(
      'zeroLeadingCoefficient',
    )
  }

  const leadingSign = input.coefficient3 > 0 ? 1 : -1
  const normalizedCoefficient3 =
    input.coefficient3 * leadingSign
  const normalizedCoefficient2 =
    input.coefficient2 * leadingSign
  const normalizedCoefficient1 =
    input.coefficient1 * leadingSign
  const normalizedCoefficient0 =
    input.coefficient0 * leadingSign

  if (Math.abs(normalizedCoefficient2) < 1e-15) {
    throw new CubicRouthHurwitzStabilityCalculationError(
      'zeroSecondCoefficient',
    )
  }

  const stabilityDeterminant =
    normalizedCoefficient2 * normalizedCoefficient1 -
    normalizedCoefficient3 * normalizedCoefficient0
  const thirdRowFirstElement =
    stabilityDeterminant / normalizedCoefficient2
  const firstColumn = [
    normalizedCoefficient3,
    normalizedCoefficient2,
    thirdRowFirstElement,
    normalizedCoefficient0,
  ]
  const minimumFirstColumnValue = Math.min(...firstColumn)
  const rightHalfPlaneRootCount =
    countSignChanges(firstColumn)
  const hasNearZero = firstColumn.some(
    (value) => Math.abs(value) < 1e-12,
  )
  const asymptoticallyStable = firstColumn.every(
    (value) => value > 1e-12,
  )
  const stabilityClassification =
    asymptoticallyStable
      ? 'Asymptotically stable'
      : hasNearZero
        ? 'Marginal or special Routh case'
        : 'Unstable'

  const results = [
    normalizedCoefficient3,
    normalizedCoefficient2,
    normalizedCoefficient1,
    normalizedCoefficient0,
    thirdRowFirstElement,
    stabilityDeterminant,
    minimumFirstColumnValue,
    rightHalfPlaneRootCount,
  ]

  if (!results.every(Number.isFinite)) {
    throw new CubicRouthHurwitzStabilityCalculationError(
      'numericalFailure',
    )
  }

  return {
    normalizedCoefficient3,
    normalizedCoefficient2,
    normalizedCoefficient1,
    normalizedCoefficient0,
    thirdRowFirstElement,
    stabilityDeterminant,
    minimumFirstColumnValue,
    rightHalfPlaneRootCount,
    stabilityClassification,
    modelName:
      'Routh–Hurwitz first-column test for a cubic characteristic polynomial',
    limitationDescription:
      'Exact zero rows and epsilon substitutions require a full symbolic Routh-table treatment. This calculator flags near-zero first-column cases for further review.',
  }
}
