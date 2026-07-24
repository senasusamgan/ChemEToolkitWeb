import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SingleStageLeachingRecoveryCalculationError,
  calculateSingleStageLeachingRecovery,
} from '../../src/features/mass-transfer/single-stage-leaching-recovery/engine.ts'

test('calculates ideal leaching recovery', () => {
  const result =
    calculateSingleStageLeachingRecovery({
      insolubleSolidFlowRate: 100,
      solubleSoluteFlowRate: 20,
      pureSolventFlowRate: 100,
      retainedSolventPerInsolubleSolid: 0.4,
    })

  assert.ok(
    Math.abs(result.equilibriumSoluteRatio - 0.2) <
      1e-12,
  )
  assert.equal(result.retainedSolventFlowRate, 40)
  assert.equal(result.soluteRecoveredInOverflow, 12)
  assert.equal(result.soluteRetainedWithUnderflow, 8)
  assert.ok(
    Math.abs(result.soluteRecoveryFraction - 0.6) <
      1e-12,
  )
  assert.ok(
    Math.abs(result.soluteBalanceResidual) < 1e-12,
  )
})

test('handles a solute-free feed', () => {
  const result =
    calculateSingleStageLeachingRecovery({
      insolubleSolidFlowRate: 100,
      solubleSoluteFlowRate: 0,
      pureSolventFlowRate: 100,
      retainedSolventPerInsolubleSolid: 0.4,
    })

  assert.equal(result.equilibriumSoluteRatio, 0)
  assert.equal(result.soluteRecoveredInOverflow, 0)
  assert.equal(result.soluteRecoveryFraction, 0)
})

test('rejects invalid flow and no-overflow states', () => {
  assert.throws(
    () =>
      calculateSingleStageLeachingRecovery({
        insolubleSolidFlowRate: 100,
        solubleSoluteFlowRate: 20,
        pureSolventFlowRate: 40,
        retainedSolventPerInsolubleSolid: 0.4,
      }),
    (error: unknown) =>
      error instanceof
        SingleStageLeachingRecoveryCalculationError &&
      error.code === 'noOverflowSolution',
  )

  assert.throws(
    () =>
      calculateSingleStageLeachingRecovery({
        insolubleSolidFlowRate: 100,
        solubleSoluteFlowRate: -1,
        pureSolventFlowRate: 100,
        retainedSolventPerInsolubleSolid: 0.4,
      }),
    (error: unknown) =>
      error instanceof
        SingleStageLeachingRecoveryCalculationError &&
      error.code === 'negativeSoluteFlow',
  )
})
