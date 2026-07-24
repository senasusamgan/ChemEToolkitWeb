import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ExtractionSolventRequirementCalculationError,
  calculateExtractionSolventRequirement,
} from '../../src/features/separation-processes/extraction-solvent-requirement/engine.ts'

test('calculates fresh solvent requirement', () => {
  const result = calculateExtractionSolventRequirement({
    raffinateCarrierFlowRate: 100,
    distributionCoefficient: 3,
    targetSoluteRecoveryFraction: 0.8,
  })
  assert.ok(Math.abs(result.requiredSolventFlowRate - 133.33333333333337) < 1e-10)
  assert.ok(Math.abs(result.extractionFactor - 4) < 1e-12)
  assert.ok(Math.abs(result.achievedRecoveryFraction - 0.8) < 1e-12)
})

test('higher distribution coefficient lowers solvent demand', () => {
  const lowD = calculateExtractionSolventRequirement({
    raffinateCarrierFlowRate: 100,
    distributionCoefficient: 2,
    targetSoluteRecoveryFraction: 0.8,
  })
  const highD = calculateExtractionSolventRequirement({
    raffinateCarrierFlowRate: 100,
    distributionCoefficient: 4,
    targetSoluteRecoveryFraction: 0.8,
  })
  assert.ok(highD.requiredSolventFlowRate < lowD.requiredSolventFlowRate)
})

test('rejects complete recovery target', () => {
  assert.throws(
    () => calculateExtractionSolventRequirement({
      raffinateCarrierFlowRate: 100,
      distributionCoefficient: 3,
      targetSoluteRecoveryFraction: 1,
    }),
    (error: unknown) =>
      error instanceof ExtractionSolventRequirementCalculationError &&
      error.code === 'recoveryOutOfRange',
  )
})
