import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateSemibatchReactor,
} from '../../src/features/reaction-engineering/batch08/engine.ts'

const example = {
  initialLiquidVolume: 1,
  initialConcentrationA: 100,
  feedVolumetricFlowRate: 0.005,
  feedConcentrationB: 100,
  secondOrderRateConstant: 0.0005,
  feedDuration: 100,
}

test('calculates final liquid volume and fed B moles', () => {
  const result = calculateSemibatchReactor(example)
  assert.ok(Math.abs(result.finalLiquidVolume - 1.5) < 1e-10)
  assert.ok(Math.abs(result.fedMolesB - 50) < 1e-12)
})

test('conserves A and product stoichiometry', () => {
  const result = calculateSemibatchReactor(example)
  assert.ok(Math.abs(result.finalMolesA + result.finalMolesProduct - 100) < 1e-7)
  assert.ok(Math.abs(result.productYieldFromA - result.conversionA) < 1e-9)
})

test('rejects zero feed rate', () => {
  assert.throws(
    () => calculateSemibatchReactor({ ...example, feedVolumetricFlowRate: 0 }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch08CalculationError &&
      error.code === 'invalidSemibatchInputs',
  )
})
