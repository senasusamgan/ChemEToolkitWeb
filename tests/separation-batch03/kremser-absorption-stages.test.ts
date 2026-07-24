import assert from 'node:assert/strict'
import test from 'node:test'
import {
  KremserAbsorptionStagesCalculationError,
  calculateKremserAbsorptionStages,
} from '../../src/features/separation-processes/kremser-absorption-stages/engine.ts'

test('estimates Kremser absorption stages', () => {
  const result = calculateKremserAbsorptionStages({
    factor: 1.5,
    targetRemovalFraction: 0.95,
  })
  assert.ok(result.requiredIntegerStages >= 1)
  assert.ok(result.achievedRemovalFraction >= 0.95)
})

test('uses the A equals one limiting relation', () => {
  const result = calculateKremserAbsorptionStages({
    factor: 1,
    targetRemovalFraction: 0.8,
  })
  assert.equal(result.limitingCaseUsed, true)
  assert.equal(result.requiredIntegerStages, 5)
})

test('rejects invalid removal target', () => {
  assert.throws(
    () => calculateKremserAbsorptionStages({
      factor: 1.5,
      targetRemovalFraction: 1,
    }),
    (error: unknown) =>
      error instanceof KremserAbsorptionStagesCalculationError &&
      error.code === 'removalOutOfRange',
  )
})
