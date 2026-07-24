import assert from 'node:assert/strict'
import test from 'node:test'
import {
  KremserStrippingStagesCalculationError,
  calculateKremserStrippingStages,
} from '../../src/features/separation-processes/kremser-stripping-stages/engine.ts'

test('estimates Kremser stripping stages', () => {
  const result = calculateKremserStrippingStages({
    factor: 1.8,
    targetRemovalFraction: 0.9,
  })
  assert.ok(result.requiredIntegerStages >= 1)
  assert.ok(result.achievedRemovalFraction >= 0.9)
})

test('more favorable factor lowers stage count', () => {
  const low = calculateKremserStrippingStages({
    factor: 1.2,
    targetRemovalFraction: 0.9,
  })
  const high = calculateKremserStrippingStages({
    factor: 2,
    targetRemovalFraction: 0.9,
  })
  assert.ok(high.requiredIntegerStages <= low.requiredIntegerStages)
})

test('rejects non-positive stripping factor', () => {
  assert.throws(
    () => calculateKremserStrippingStages({
      factor: 0,
      targetRemovalFraction: 0.9,
    }),
    (error: unknown) =>
      error instanceof KremserStrippingStagesCalculationError &&
      error.code === 'nonPositiveFactor',
  )
})
