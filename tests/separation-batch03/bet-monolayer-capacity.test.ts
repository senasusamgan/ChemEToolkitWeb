import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BetMonolayerCapacityCalculationError,
  calculateBetMonolayerCapacity,
} from '../../src/features/separation-processes/bet-monolayer-capacity/engine.ts'

test('calculates BET monolayer capacity and constant', () => {
  const result = calculateBetMonolayerCapacity({
    betSlope: 0.018,
    betIntercept: 0.002,
    molecularCrossSectionArea: 0.162,
  })
  assert.ok(Math.abs(result.monolayerCapacity - 50) < 1e-12)
  assert.equal(result.betConstant, 10)
  assert.ok(result.specificSurfaceArea > 0)
})

test('larger molecular area gives larger surface area', () => {
  const small = calculateBetMonolayerCapacity({
    betSlope: 0.018,
    betIntercept: 0.002,
    molecularCrossSectionArea: 0.10,
  })
  const large = calculateBetMonolayerCapacity({
    betSlope: 0.018,
    betIntercept: 0.002,
    molecularCrossSectionArea: 0.20,
  })
  assert.ok(large.specificSurfaceArea > small.specificSurfaceArea)
})

test('rejects non-positive fit values', () => {
  assert.throws(
    () => calculateBetMonolayerCapacity({
      betSlope: 0,
      betIntercept: 0.002,
      molecularCrossSectionArea: 0.162,
    }),
    (error: unknown) =>
      error instanceof BetMonolayerCapacityCalculationError &&
      error.code === 'nonPositiveProperty',
  )
})
