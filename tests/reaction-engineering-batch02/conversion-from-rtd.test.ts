import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateConversionFromRTD,
} from '../../src/features/reaction-engineering/batch02/engine.ts'

const example = {
  meanResidenceTime: 100,
  residenceTimeVariance: 1000,
  firstOrderRateConstant: 0.02,
}

test('calculates equivalent tanks from RTD moments', () => {
  const result =
    calculateConversionFromRTD(
      example,
    )

  assert.equal(
    result.dimensionlessVariance,
    0.1,
  )

  assert.equal(
    result.equivalentTanksInSeries,
    10,
  )
})

test('RTD conversion lies between CSTR and PFR limits', () => {
  const result =
    calculateConversionFromRTD(
      example,
    )

  assert.ok(
    result.rtdBasedConversion >
    result.idealCSTRConversion,
  )

  assert.ok(
    result.rtdBasedConversion <
    result.idealPFRConversion,
  )
})

test('rejects zero variance', () => {
  assert.throws(
    () =>
      calculateConversionFromRTD({
        ...example,
        residenceTimeVariance: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch02CalculationError &&
      error.code ===
        'invalidConversionFromRTDInputs',
  )
})
