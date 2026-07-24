import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DistillationOperatingLinesCalculationError,
  calculateDistillationOperatingLines,
} from '../../src/features/mass-transfer/distillation-operating-lines/engine.ts'

const example = {
  relativeVolatility: 2.5,
  distillateLightMoleFraction: 0.95,
  bottomsLightMoleFraction: 0.05,
  feedLightMoleFraction: 0.5,
  refluxRatio: 2.5,
  feedQuality: 1,
}

test('calculates saturated-liquid operating lines and minimum reflux', () => {
  const result = calculateDistillationOperatingLines(example)

  assert.ok(Math.abs(result.rectifyingSlope - 0.7142857142857143) < 1e-12)
  assert.ok(Math.abs(result.feedIntersectionVaporMoleFraction - 0.6285714285714286) < 1e-12)
  assert.ok(Math.abs(result.strippingSlope - 1.2857142857142856) < 1e-12)
  assert.ok(Math.abs(result.minimumRefluxRatio - 1.1) < 1e-10)
})

test('handles the saturated-vapor horizontal q-line', () => {
  const result = calculateDistillationOperatingLines({
    ...example,
    feedQuality: 0,
  })

  assert.ok(Math.abs(result.feedIntersectionLiquidMoleFraction - 0.32) < 1e-12)
  assert.ok(Math.abs(result.feedIntersectionVaporMoleFraction - 0.5) < 1e-12)
  assert.ok(Math.abs(result.feedLineSlope ?? Number.NaN) < 1e-14)
})

test('rejects invalid specifications and insufficient reflux', () => {
  assert.throws(
    () =>
      calculateDistillationOperatingLines({
        ...example,
        feedLightMoleFraction: 0.99,
      }),
    (error: unknown) =>
      error instanceof DistillationOperatingLinesCalculationError &&
      error.code === 'invalidCompositionOrdering',
  )

  assert.throws(
    () =>
      calculateDistillationOperatingLines({
        ...example,
        refluxRatio: 1.1,
      }),
    (error: unknown) =>
      error instanceof DistillationOperatingLinesCalculationError &&
      error.code === 'refluxAtOrBelowMinimum',
  )
})
