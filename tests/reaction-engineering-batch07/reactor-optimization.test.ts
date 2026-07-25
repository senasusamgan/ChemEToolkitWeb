import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateReactorOptimization,
} from '../../src/features/reaction-engineering/batch07/engine.ts'

const example = {
  inletConcentrationA: 1000,
  volumetricFlowRate: 0.01,
  firstOrderRateConstant: 0.02,
  annualOperatingHours: 8000,
  productValuePerMole: 0.001,
  annualizedReactorCostPerVolume: 200_000,
  minimumConversion: 0.1,
  maximumConversion: 0.99,
}

test('finds an optimum inside the selected bounds', () => {
  const result =
    calculateReactorOptimization(
      example,
    )

  assert.ok(
    result.optimumConversion >=
    example.minimumConversion,
  )

  assert.ok(
    result.optimumConversion <=
    example.maximumConversion,
  )

  assert.equal(
    result.optimizationGridPoints,
    5001,
  )
})

test('returns internally consistent economic values', () => {
  const result =
    calculateReactorOptimization(
      example,
    )

  assert.ok(
    Math.abs(
      result.optimumAnnualMargin -
      (
        result.annualProductValue -
        result.annualizedReactorCost
      ),
    ) < 1e-6,
  )
})

test('rejects reversed conversion bounds', () => {
  assert.throws(
    () =>
      calculateReactorOptimization({
        ...example,
        minimumConversion: 0.9,
        maximumConversion: 0.5,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch07CalculationError &&
      error.code ===
        'invalidOptimizationInputs',
  )
})
