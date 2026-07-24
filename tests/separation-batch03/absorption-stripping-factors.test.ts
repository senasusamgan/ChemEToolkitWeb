import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AbsorptionStrippingFactorsCalculationError,
  calculateAbsorptionStrippingFactors,
} from '../../src/features/separation-processes/absorption-stripping-factors/engine.ts'

test('calculates reciprocal absorption and stripping factors', () => {
  const result = calculateAbsorptionStrippingFactors({
    liquidMolarFlowRate: 120,
    gasMolarFlowRate: 80,
    equilibriumSlope: 1.2,
  })
  assert.equal(result.absorptionFactor, 1.25)
  assert.equal(result.strippingFactor, 0.8)
  assert.ok(Math.abs(result.absorptionFactor * result.strippingFactor - 1) < 1e-12)
})

test('identifies the limiting case', () => {
  const result = calculateAbsorptionStrippingFactors({
    liquidMolarFlowRate: 100,
    gasMolarFlowRate: 100,
    equilibriumSlope: 1,
  })
  assert.equal(result.absorptionFactor, 1)
  assert.match(result.absorptionAssessment, /limiting/)
})

test('rejects zero gas flow', () => {
  assert.throws(
    () => calculateAbsorptionStrippingFactors({
      liquidMolarFlowRate: 100,
      gasMolarFlowRate: 0,
      equilibriumSlope: 1,
    }),
    (error: unknown) =>
      error instanceof AbsorptionStrippingFactorsCalculationError &&
      error.code === 'nonPositiveProperty',
  )
})
