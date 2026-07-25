import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateMonodBioreactorDesign,
} from '../../src/features/reaction-engineering/batch05/engine.ts'

const example = {
  volumetricFlowRate: 10,
  feedSubstrateConcentration: 20,
  targetEffluentSubstrateConcentration: 2,
  maximumSpecificGrowthRate: 0.5,
  monodHalfSaturationConstant: 1,
  biomassYieldCoefficient: 0.6,
  biomassDecayRate: 0.05,
}

test('calculates Monod growth and reactor volume', () => {
  const result =
    calculateMonodBioreactorDesign(
      example,
    )

  const gross =
    0.5 *
    2 /
    3

  const net =
    gross -
    0.05

  assert.ok(
    Math.abs(
      result.grossSpecificGrowthRate -
      gross,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.requiredReactorVolume -
      10 /
      net,
    ) < 1e-12,
  )
})

test('operating dilution stays below washout dilution', () => {
  const result =
    calculateMonodBioreactorDesign(
      example,
    )

  assert.ok(
    result.dilutionRate <
    result.washoutDilutionRate,
  )

  assert.ok(
    result.washoutSafetyMargin >
    0,
  )
})

test('rejects a no-growth effluent target', () => {
  assert.throws(
    () =>
      calculateMonodBioreactorDesign({
        ...example,
        targetEffluentSubstrateConcentration: 0.01,
        biomassDecayRate: 0.1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch05CalculationError &&
      error.code ===
        'noPositiveNetGrowth',
  )
})
