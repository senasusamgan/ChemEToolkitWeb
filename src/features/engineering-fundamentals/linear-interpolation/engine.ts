import type {
  LinearInterpolationInput,
  LinearInterpolationResult,
} from './types.ts'

export type LinearInterpolationErrorCode =
  | 'nonFiniteInput'
  | 'duplicateAbscissa'
  | 'numericalFailure'

export class LinearInterpolationCalculationError extends Error {
  readonly code: LinearInterpolationErrorCode

  constructor(code: LinearInterpolationErrorCode) {
    super(
      code === 'nonFiniteInput'
        ? 'All interpolation inputs must be finite numbers.'
        : code === 'duplicateAbscissa'
          ? 'The two known x-values must be different.'
          : 'The interpolation calculation did not produce a finite result.',
    )

    this.name = 'LinearInterpolationCalculationError'
    this.code = code
  }
}

export function calculateLinearInterpolation(
  input: LinearInterpolationInput,
): LinearInterpolationResult {
  const values = [
    input.firstX,
    input.firstY,
    input.secondX,
    input.secondY,
    input.targetX,
  ]

  if (!values.every(Number.isFinite)) {
    throw new LinearInterpolationCalculationError('nonFiniteInput')
  }

  if (input.firstX === input.secondX) {
    throw new LinearInterpolationCalculationError('duplicateAbscissa')
  }

  const intervalWidth =
    input.secondX - input.firstX

  const interpolationFraction =
    (input.targetX - input.firstX) /
    intervalWidth

  const interpolatedY =
    input.firstY +
    interpolationFraction *
      (input.secondY - input.firstY)

  const lowerX =
    Math.min(
      input.firstX,
      input.secondX,
    )

  const upperX =
    Math.max(
      input.firstX,
      input.secondX,
    )

  const isExtrapolation =
    input.targetX < lowerX ||
    input.targetX > upperX

  if (
    ![
      intervalWidth,
      interpolationFraction,
      interpolatedY,
    ].every(Number.isFinite)
  ) {
    throw new LinearInterpolationCalculationError('numericalFailure')
  }

  return {
    interpolatedY,
    interpolationFraction,
    intervalWidth,
    isExtrapolation,
    modelName: 'Two-point linear interpolation',
    limitationDescription:
      'Assumes the relationship between the two supplied points is linear. Values outside the supplied x-range are extrapolations.',
  }
}
