import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateBypassDeadVolumeReactor,
} from '../../src/features/reaction-engineering/batch02/engine.ts'

const example = {
  nominalReactorVolume: 10,
  volumetricFlowRate: 0.1,
  firstOrderRateConstant: 0.02,
  bypassFraction: 0.08,
  deadVolumeFraction: 0.15,
}

test('calculates active hydraulic quantities', () => {
  const result =
    calculateBypassDeadVolumeReactor(
      example,
    )

  assert.equal(
    result.activeReactorVolume,
    8.5,
  )

  assert.ok(
    Math.abs(
      result.reactingFlowRate -
      0.092,
    ) < 1e-15,
  )
})

test('overall conversion includes bypass dilution', () => {
  const result =
    calculateBypassDeadVolumeReactor(
      example,
    )

  const expected =
    0.92 *
    (
      1 -
      Math.exp(
        -0.02 *
        8.5 /
        0.092,
      )
    )

  assert.ok(
    Math.abs(
      result.overallConversion -
      expected,
    ) < 1e-15,
  )
})

test('rejects a bypass fraction equal to one', () => {
  assert.throws(
    () =>
      calculateBypassDeadVolumeReactor({
        ...example,
        bypassFraction: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch02CalculationError &&
      error.code ===
        'invalidBypassDeadVolumeInputs',
  )
})
