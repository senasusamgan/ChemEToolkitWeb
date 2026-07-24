import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BinaryDistillationBalanceCalculationError,
  calculateBinaryDistillationBalance,
} from '../../src/features/separation-processes/binary-distillation-balance/engine.ts'

test('solves binary product flow rates', () => {
  const result = calculateBinaryDistillationBalance({
    feedFlowRate: 100,
    feedLightKeyFraction: 0.45,
    distillateLightKeyFraction: 0.95,
    bottomsLightKeyFraction: 0.05,
  })
  assert.ok(Math.abs(result.distillateFlowRate - 44.44444444444444) < 1e-12)
  assert.ok(Math.abs(result.bottomsFlowRate - 55.55555555555556) < 1e-12)
  assert.ok(Math.abs(result.totalBalanceResidual) < 1e-12)
})

test('recovers light key predominantly in distillate', () => {
  const result = calculateBinaryDistillationBalance({
    feedFlowRate: 200,
    feedLightKeyFraction: 0.5,
    distillateLightKeyFraction: 0.9,
    bottomsLightKeyFraction: 0.1,
  })
  assert.ok(result.lightKeyRecoveryToDistillate > 0.8)
  assert.ok(result.heavyKeyRecoveryToBottoms > 0.8)
})

test('rejects invalid composition ordering', () => {
  assert.throws(
    () => calculateBinaryDistillationBalance({
      feedFlowRate: 100,
      feedLightKeyFraction: 0.5,
      distillateLightKeyFraction: 0.4,
      bottomsLightKeyFraction: 0.1,
    }),
    (error: unknown) =>
      error instanceof BinaryDistillationBalanceCalculationError &&
      error.code === 'invalidCompositionOrdering',
  )
})
