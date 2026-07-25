import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateBypassFractionEstimator,
} from '../../src/features/reaction-engineering/batch01/engine.ts'

const example = {
  earlyBypassTracerArea: 8,
  totalRecoveredTracerArea: 100,
  injectedTracerArea: 105,
  reactorVolume: 10,
  totalVolumetricFlowRate: 0.1,
}

test('calculates bypass and active-flow fractions', () => {
  const result =
    calculateBypassFractionEstimator(
      example,
    )

  assert.equal(
    result.bypassFraction,
    0.08,
  )

  assert.equal(
    result.activeFlowFraction,
    0.92,
  )
})

test('calculates nominal and active-path space times', () => {
  const result =
    calculateBypassFractionEstimator(
      example,
    )

  assert.equal(
    result.nominalSpaceTime,
    100,
  )

  assert.ok(
    Math.abs(
      result.activePathSpaceTime -
      10 /
      0.092,
    ) < 1e-12,
  )
})

test('rejects early area greater than total area', () => {
  assert.throws(
    () =>
      calculateBypassFractionEstimator({
        ...example,
        earlyBypassTracerArea: 101,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch01CalculationError &&
      error.code ===
        'invalidBypassInputs',
  )
})
