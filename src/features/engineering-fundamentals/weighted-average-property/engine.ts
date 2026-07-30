import type {
  WeightedAveragePropertyInput,
  WeightedAveragePropertyResult,
} from './types.ts'

export type WeightedAveragePropertyErrorCode =
  | 'insufficientItems'
  | 'nonFiniteInput'
  | 'negativeWeight'
  | 'zeroTotalWeight'
  | 'numericalFailure'

export class WeightedAveragePropertyCalculationError extends Error {
  readonly code: WeightedAveragePropertyErrorCode

  constructor(code: WeightedAveragePropertyErrorCode) {
    super(
      code === 'insufficientItems'
        ? 'At least two value–weight pairs are required.'
        : code === 'nonFiniteInput'
          ? 'All property values and weights must be finite numbers.'
          : code === 'negativeWeight'
            ? 'Weights cannot be negative.'
            : code === 'zeroTotalWeight'
              ? 'At least one weight must be greater than zero.'
              : 'The weighted-average calculation did not produce finite results.',
    )

    this.name = 'WeightedAveragePropertyCalculationError'
    this.code = code
  }
}

export function calculateWeightedAverageProperty(
  input: WeightedAveragePropertyInput,
): WeightedAveragePropertyResult {
  if (input.items.length < 2) {
    throw new WeightedAveragePropertyCalculationError(
      'insufficientItems',
    )
  }

  const values =
    input.items.flatMap(
      (item) => [
        item.value,
        item.weight,
      ],
    )

  if (!values.every(Number.isFinite)) {
    throw new WeightedAveragePropertyCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.items.some(
      (item) =>
        item.weight < 0,
    )
  ) {
    throw new WeightedAveragePropertyCalculationError(
      'negativeWeight',
    )
  }

  const totalWeight =
    input.items.reduce(
      (total, item) =>
        total + item.weight,
      0,
    )

  if (totalWeight <= 0) {
    throw new WeightedAveragePropertyCalculationError(
      'zeroTotalWeight',
    )
  }

  const weightedSum =
    input.items.reduce(
      (total, item) =>
        total +
        item.value * item.weight,
      0,
    )

  const weightedAverage =
    weightedSum / totalWeight

  const normalizedWeights =
    input.items.map(
      (item) =>
        item.weight / totalWeight,
    )

  const activeValues =
    input.items
      .filter(
        (item) =>
          item.weight > 0,
      )
      .map(
        (item) =>
          item.value,
      )

  const minimumActiveValue =
    Math.min(...activeValues)

  const maximumActiveValue =
    Math.max(...activeValues)

  const results = [
    totalWeight,
    weightedSum,
    weightedAverage,
    minimumActiveValue,
    maximumActiveValue,
    ...normalizedWeights,
  ]

  if (!results.every(Number.isFinite)) {
    throw new WeightedAveragePropertyCalculationError(
      'numericalFailure',
    )
  }

  return {
    weightedAverage,
    weightedSum,
    totalWeight,
    normalizedWeights,
    minimumActiveValue,
    maximumActiveValue,
    modelName: 'Normalized weighted arithmetic mean',
    limitationDescription:
      'Weights are normalized automatically. The method assumes the supplied property values can be combined using a linear weighted-average model.',
  }
}
