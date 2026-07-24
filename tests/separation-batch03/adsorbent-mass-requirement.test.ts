import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AdsorbentMassRequirementCalculationError,
  calculateAdsorbentMassRequirement,
} from '../../src/features/separation-processes/adsorbent-mass-requirement/engine.ts'

test('calculates adsorbent demand from working capacity', () => {
  const result = calculateAdsorbentMassRequirement({
    feedMassFlowRate: 1000,
    soluteMassFraction: 0.02,
    targetRemovalFraction: 0.9,
    workingAdsorptionCapacity: 0.15,
    utilizationFraction: 0.8,
  })
  assert.equal(result.feedSoluteRate, 20)
  assert.equal(result.soluteRemovedRate, 18)
  assert.ok(Math.abs(result.requiredAdsorbentRate - 150) < 1e-12)
})

test('lower utilization increases adsorbent demand', () => {
  const high = calculateAdsorbentMassRequirement({
    feedMassFlowRate: 1000,
    soluteMassFraction: 0.02,
    targetRemovalFraction: 0.9,
    workingAdsorptionCapacity: 0.15,
    utilizationFraction: 0.9,
  })
  const low = calculateAdsorbentMassRequirement({
    feedMassFlowRate: 1000,
    soluteMassFraction: 0.02,
    targetRemovalFraction: 0.9,
    workingAdsorptionCapacity: 0.15,
    utilizationFraction: 0.5,
  })
  assert.ok(low.requiredAdsorbentRate > high.requiredAdsorbentRate)
})

test('rejects invalid removal fraction', () => {
  assert.throws(
    () => calculateAdsorbentMassRequirement({
      feedMassFlowRate: 1000,
      soluteMassFraction: 0.02,
      targetRemovalFraction: 1.2,
      workingAdsorptionCapacity: 0.15,
      utilizationFraction: 0.8,
    }),
    (error: unknown) =>
      error instanceof AdsorbentMassRequirementCalculationError &&
      error.code === 'fractionOutOfRange',
  )
})
