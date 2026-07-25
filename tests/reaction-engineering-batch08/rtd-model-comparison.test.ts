import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateRTDModelComparison,
} from '../../src/features/reaction-engineering/batch08/engine.ts'

const example = {
  meanResidenceTime: 100,
  residenceTimeVariance: 1000,
  firstOrderRateConstant: 0.02,
}

test('calculates equivalent tanks and Peclet number', () => {
  const result = calculateRTDModelComparison(example)
  assert.equal(result.dimensionlessVariance, 0.1)
  assert.equal(result.equivalentTanksInSeries, 10)
  assert.equal(result.equivalentPecletNumber, 20)
})

test('nonideal predictions remain between mixed and plug-flow limits', () => {
  const result = calculateRTDModelComparison(example)
  assert.ok(result.tanksInSeriesConversion > result.idealCSTRConversion)
  assert.ok(result.tanksInSeriesConversion < result.idealPFRConversion)
  assert.ok(result.axialDispersionConversion > result.idealCSTRConversion)
  assert.ok(result.axialDispersionConversion < result.idealPFRConversion)
})

test('rejects zero variance', () => {
  assert.throws(
    () => calculateRTDModelComparison({ ...example, residenceTimeVariance: 0 }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch08CalculationError &&
      error.code === 'invalidRTDModelInputs',
  )
})
