import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LinearInterpolationCalculationError,
  calculateLinearInterpolation,
} from '../../src/features/engineering-fundamentals/linear-interpolation/engine.ts'

const CALCULATOR_ID =
  'linearInterpolationCalculator'

test(`${CALCULATOR_ID} reproduces a verified interpolation case`, () => {
  const result =
    calculateLinearInterpolation({
      firstX: 0,
      firstY: 20,
      secondX: 10,
      secondY: 80,
      targetX: 4,
    })

  assert.ok(
    Math.abs(
      result.interpolatedY - 44,
    ) < 1e-12,
  )

  assert.ok(
    Math.abs(
      result.interpolationFraction - 0.4,
    ) < 1e-12,
  )

  assert.equal(
    result.isExtrapolation,
    false,
  )
})

test(`${CALCULATOR_ID} supports descending x-values`, () => {
  const result =
    calculateLinearInterpolation({
      firstX: 10,
      firstY: 80,
      secondX: 0,
      secondY: 20,
      targetX: 4,
    })

  assert.ok(
    Math.abs(
      result.interpolatedY - 44,
    ) < 1e-12,
  )
})

test(`${CALCULATOR_ID} identifies extrapolation`, () => {
  const result =
    calculateLinearInterpolation({
      firstX: 0,
      firstY: 0,
      secondX: 10,
      secondY: 100,
      targetX: 12,
    })

  assert.equal(
    result.interpolatedY,
    120,
  )

  assert.equal(
    result.isExtrapolation,
    true,
  )
})

test(`${CALCULATOR_ID} rejects duplicate x-values`, () => {
  assert.throws(
    () =>
      calculateLinearInterpolation({
        firstX: 5,
        firstY: 10,
        secondX: 5,
        secondY: 20,
        targetX: 5,
      }),
    (error) =>
      error instanceof
        LinearInterpolationCalculationError &&
      error.code ===
        'duplicateAbscissa',
  )
})
