import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CrosscurrentExtractionStagesCalculationError,
  calculateCrosscurrentExtractionStages,
} from '../../src/features/separation-processes/crosscurrent-extraction-stages/engine.ts'

test('estimates equal-solvent crosscurrent stages', () => {
  const result = calculateCrosscurrentExtractionStages({
    distributionCoefficient: 2.5,
    solventToRaffinateRatioPerStage: 0.4,
    targetSoluteRecoveryFraction: 0.95,
  })
  assert.equal(result.extractionFactorPerStage, 1)
  assert.equal(result.raffinateFractionPerStage, 0.5)
  assert.equal(result.requiredIntegerStages, 5)
  assert.ok(result.achievedRecoveryFraction >= 0.95)
})

test('more solvent reduces stage requirement', () => {
  const low = calculateCrosscurrentExtractionStages({
    distributionCoefficient: 2,
    solventToRaffinateRatioPerStage: 0.2,
    targetSoluteRecoveryFraction: 0.9,
  })
  const high = calculateCrosscurrentExtractionStages({
    distributionCoefficient: 2,
    solventToRaffinateRatioPerStage: 0.8,
    targetSoluteRecoveryFraction: 0.9,
  })
  assert.ok(high.requiredIntegerStages < low.requiredIntegerStages)
})

test('rejects invalid recovery target', () => {
  assert.throws(
    () => calculateCrosscurrentExtractionStages({
      distributionCoefficient: 2,
      solventToRaffinateRatioPerStage: 0.5,
      targetSoluteRecoveryFraction: 0,
    }),
    (error: unknown) =>
      error instanceof CrosscurrentExtractionStagesCalculationError &&
      error.code === 'recoveryOutOfRange',
  )
})
