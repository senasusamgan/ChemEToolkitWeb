import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MonteCarloIntegrationCalculationError,
  calculateMonteCarloIntegration,
} from '../../src/features/numerical-methods/monte-carlo-integration/engine.ts'

test('estimates the integral of x cubed', () => {
  const result = calculateMonteCarloIntegration({
    lowerBound: 0,
    upperBound: 2,
    coefficient3: 1,
    coefficient2: 0,
    coefficient1: 0,
    coefficient0: 0,
    sampleCount: 200000,
    randomSeed: 12345,
  })
  assert.equal(result.exactIntegral, 4)
  assert.ok(result.absoluteError < 0.03)
  assert.ok(result.standardError > 0)
})

test('same seed gives the same estimate', () => {
  const input = {
    lowerBound: -1,
    upperBound: 1,
    coefficient3: 0,
    coefficient2: 1,
    coefficient1: 0,
    coefficient0: 0,
    sampleCount: 10000,
    randomSeed: 99,
  }
  const first = calculateMonteCarloIntegration(input)
  const second = calculateMonteCarloIntegration(input)
  assert.equal(first.integralEstimate, second.integralEstimate)
})

test('rejects fewer than ten samples', () => {
  assert.throws(
    () => calculateMonteCarloIntegration({
      lowerBound: 0,
      upperBound: 1,
      coefficient3: 0,
      coefficient2: 0,
      coefficient1: 1,
      coefficient0: 0,
      sampleCount: 5,
      randomSeed: 1,
    }),
    (error: unknown) =>
      error instanceof MonteCarloIntegrationCalculationError &&
      error.code === 'invalidSampleCount',
  )
})
