import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateLevenspielPlotSizing,
} from '../../src/features/reaction-engineering/batch05/engine.ts'

const example = {
  inletMolarFlowRate: 10,
  conversions: [0, 0.2, 0.4, 0.6, 0.8],
  inverseRates: [0.1, 0.12, 0.18, 0.3, 0.6],
}

test('integrates the Levenspiel plot by trapezoids', () => {
  const result =
    calculateLevenspielPlotSizing(
      example,
    )

  const area =
    0.2 *
    (
      0.1 +
      0.12
    ) /
    2 +
    0.2 *
    (
      0.12 +
      0.18
    ) /
    2 +
    0.2 *
    (
      0.18 +
      0.3
    ) /
    2 +
    0.2 *
    (
      0.3 +
      0.6
    ) /
    2

  assert.ok(
    Math.abs(
      result.integratedArea -
      area,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.pfrVolume -
      10 *
      area,
    ) < 1e-15,
  )
})

test('calculates endpoint CSTR volume', () => {
  const result =
    calculateLevenspielPlotSizing(
      example,
    )

  assert.ok(
    Math.abs(
      result.cstrVolumeToFinalConversion -
      4.8,
    ) < 1e-15,
  )
})

test('rejects non-increasing conversion points', () => {
  assert.throws(
    () =>
      calculateLevenspielPlotSizing({
        ...example,
        conversions: [0, 0.2, 0.2, 0.6, 0.8],
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch05CalculationError &&
      error.code ===
        'invalidLevenspielInputs',
  )
})
