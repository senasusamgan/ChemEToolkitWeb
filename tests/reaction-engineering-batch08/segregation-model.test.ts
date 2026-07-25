import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateSegregationModelConversion,
} from '../../src/features/reaction-engineering/batch08/engine.ts'

const example = {
  times: [0, 50, 100, 150, 200],
  eValues: [0, 0.006, 0.012, 0.002, 0],
  firstOrderRateConstant: 0.02,
}

test('integrates first-order survival over the RTD', () => {
  const result = calculateSegregationModelConversion(example)
  assert.ok(result.segregationConversion > 0)
  assert.ok(result.segregationConversion < 1)
  assert.equal(result.integrationSegments, 4)
})

test('conversion lies between CSTR and PFR benchmarks', () => {
  const result = calculateSegregationModelConversion(example)
  assert.ok(result.segregationConversion > result.idealCSTRConversionAtMeanTime)
  assert.ok(result.segregationConversion < result.idealPFRConversionAtMeanTime)
})

test('rejects negative E values', () => {
  assert.throws(
    () => calculateSegregationModelConversion({ ...example, eValues: [0, 0.006, -0.01, 0.002, 0] }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch08CalculationError &&
      error.code === 'invalidSegregationInputs',
  )
})
