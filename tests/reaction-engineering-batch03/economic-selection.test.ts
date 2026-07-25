import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateEconomicReactorSelection,
} from '../../src/features/reaction-engineering/batch03/engine.ts'

const example = {
  inletConcentration: 1000,
  volumetricFlowRate: 0.1,
  firstOrderRateConstant: 0.02,
  targetConversion: 0.8,
  cstrInstalledCostPerVolume: 500_000,
  pfrInstalledCostPerVolume: 700_000,
  cstrAnnualOperatingCost: 300_000,
  pfrAnnualOperatingCost: 220_000,
  projectLifeYears: 10,
}

test('calculates first-order CSTR and PFR volumes', () => {
  const result =
    calculateEconomicReactorSelection(
      example,
    )

  assert.ok(
    Math.abs(
      result.requiredCSTRVolume -
      20,
    ) < 1e-12,
  )

  assert.ok(
    Math.abs(
      result.requiredPFRVolume -
      (
        0.1 *
        -Math.log(0.2) /
        0.02
      ),
    ) < 1e-12,
  )
})

test('selects the lower lifecycle-cost reactor', () => {
  const result =
    calculateEconomicReactorSelection(
      example,
    )

  const expected =
    result.cstrLifecycleCost <
    result.pfrLifecycleCost
      ? 'CSTR'
      : 'PFR'

  assert.equal(
    result.preferredReactor,
    expected,
  )
})

test('rejects conversion equal to one', () => {
  assert.throws(
    () =>
      calculateEconomicReactorSelection({
        ...example,
        targetConversion: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch03CalculationError &&
      error.code ===
        'invalidEconomicInputs',
  )
})
