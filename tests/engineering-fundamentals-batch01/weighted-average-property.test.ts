import assert from 'node:assert/strict'
import test from 'node:test'
import {
  WeightedAveragePropertyCalculationError,
  calculateWeightedAverageProperty,
} from '../../src/features/engineering-fundamentals/weighted-average-property/engine.ts'

const CALCULATOR_ID =
  'weightedAverageProperty'

const example = {
  items: [
    {
      value: 10,
      weight: 1,
    },
    {
      value: 20,
      weight: 2,
    },
    {
      value: 40,
      weight: 1,
    },
  ],
}

test(`${CALCULATOR_ID} reproduces a verified weighted mean`, () => {
  const result =
    calculateWeightedAverageProperty(
      example,
    )

  assert.ok(
    Math.abs(
      result.weightedAverage - 22.5,
    ) < 1e-12,
  )

  assert.equal(
    result.weightedSum,
    90,
  )

  assert.equal(
    result.totalWeight,
    4,
  )

  assert.deepEqual(
    result.normalizedWeights,
    [
      0.25,
      0.5,
      0.25,
    ],
  )
})

test(`${CALCULATOR_ID} is invariant to uniform weight scaling`, () => {
  const base =
    calculateWeightedAverageProperty(
      example,
    )

  const scaled =
    calculateWeightedAverageProperty({
      items:
        example.items.map(
          (item) => ({
            ...item,
            weight:
              item.weight * 10,
          }),
        ),
    })

  assert.ok(
    Math.abs(
      scaled.weightedAverage -
        base.weightedAverage,
    ) < 1e-12,
  )
})

test(`${CALCULATOR_ID} permits zero-weight entries`, () => {
  const result =
    calculateWeightedAverageProperty({
      items: [
        {
          value: 10,
          weight: 1,
        },
        {
          value: 999,
          weight: 0,
        },
      ],
    })

  assert.equal(
    result.weightedAverage,
    10,
  )
})

test(`${CALCULATOR_ID} rejects negative weights`, () => {
  assert.throws(
    () =>
      calculateWeightedAverageProperty({
        items: [
          {
            value: 10,
            weight: 1,
          },
          {
            value: 20,
            weight: -1,
          },
        ],
      }),
    (error) =>
      error instanceof
        WeightedAveragePropertyCalculationError &&
      error.code ===
        'negativeWeight',
  )
})

test(`${CALCULATOR_ID} rejects zero total weight`, () => {
  assert.throws(
    () =>
      calculateWeightedAverageProperty({
        items: [
          {
            value: 10,
            weight: 0,
          },
          {
            value: 20,
            weight: 0,
          },
        ],
      }),
    (error) =>
      error instanceof
        WeightedAveragePropertyCalculationError &&
      error.code ===
        'zeroTotalWeight',
  )
})
