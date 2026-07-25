import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateRecyclePFR,
} from '../../src/features/reaction-engineering/batch07/engine.ts'

const example = {
  freshFeedConcentrationA: 1000,
  freshVolumetricFlowRate: 0.01,
  firstOrderRateConstant: 0.02,
  reactorVolume: 1,
  recycleRatio: 2,
}

test('satisfies recycle mixer and reactor relations', () => {
  const result =
    calculateRecyclePFR(
      example,
    )

  assert.ok(
    Math.abs(
      result.reactorOutletConcentrationA -
      result.singlePassDecayFactor *
      result.mixedInletConcentrationA,
    ) < 1e-12,
  )

  const mixerConcentration =
    (
      1000 +
      2 *
      result.reactorOutletConcentrationA
    ) /
    3

  assert.ok(
    Math.abs(
      result.mixedInletConcentrationA -
      mixerConcentration,
    ) < 1e-10,
  )
})

test('zero recycle reduces to an ordinary PFR', () => {
  const result =
    calculateRecyclePFR({
      ...example,
      recycleRatio: 0,
    })

  const expected =
    1 -
    Math.exp(
      -0.02 *
      1 /
      0.01,
    )

  assert.ok(
    Math.abs(
      result.overallConversionA -
      expected,
    ) < 1e-15,
  )
})

test('rejects negative recycle ratio', () => {
  assert.throws(
    () =>
      calculateRecyclePFR({
        ...example,
        recycleRatio: -1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch07CalculationError &&
      error.code ===
        'invalidRecyclePFRInputs',
  )
})
