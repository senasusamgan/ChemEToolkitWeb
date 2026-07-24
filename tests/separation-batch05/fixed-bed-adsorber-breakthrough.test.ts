import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FixedBedAdsorberBreakthroughCalculationError,
  calculateFixedBedAdsorberBreakthrough,
} from '../../src/features/separation-processes/fixed-bed-adsorber-breakthrough/engine.ts'

test('calculates breakthrough time from usable capacity', () => {
  const result = calculateFixedBedAdsorberBreakthrough({
    adsorbentMass: 500,
    workingAdsorptionCapacity: 0.12,
    capacityUtilizationFraction: 0.75,
    feedVolumetricFlowRate: 10,
    inletSoluteConcentration: 0.05,
    breakthroughConcentrationFraction: 0.05,
  })
  assert.equal(result.usableSoluteCapacity, 45)
  assert.ok(Math.abs(result.removedSoluteLoadingRate - 0.475) < 1e-12)
  assert.ok(Math.abs(result.breakthroughTime - 94.73684210526316) < 1e-10)
})

test('more adsorbent increases breakthrough time', () => {
  const small = calculateFixedBedAdsorberBreakthrough({
    adsorbentMass: 100,
    workingAdsorptionCapacity: 0.1,
    capacityUtilizationFraction: 0.8,
    feedVolumetricFlowRate: 5,
    inletSoluteConcentration: 0.05,
    breakthroughConcentrationFraction: 0.05,
  })
  const large = calculateFixedBedAdsorberBreakthrough({
    adsorbentMass: 200,
    workingAdsorptionCapacity: 0.1,
    capacityUtilizationFraction: 0.8,
    feedVolumetricFlowRate: 5,
    inletSoluteConcentration: 0.05,
    breakthroughConcentrationFraction: 0.05,
  })
  assert.equal(large.breakthroughTime, 2 * small.breakthroughTime)
})

test('rejects breakthrough ratio of one', () => {
  assert.throws(
    () => calculateFixedBedAdsorberBreakthrough({
      adsorbentMass: 100,
      workingAdsorptionCapacity: 0.1,
      capacityUtilizationFraction: 0.8,
      feedVolumetricFlowRate: 5,
      inletSoluteConcentration: 0.05,
      breakthroughConcentrationFraction: 1,
    }),
    (error: unknown) =>
      error instanceof FixedBedAdsorberBreakthroughCalculationError &&
      error.code === 'fractionOutOfRange',
  )
})
