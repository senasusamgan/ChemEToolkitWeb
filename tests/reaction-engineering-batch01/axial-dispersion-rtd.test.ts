import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateAxialDispersionRTD,
} from '../../src/features/reaction-engineering/batch01/engine.ts'

const example = {
  meanResidenceTime: 100,
  pecletNumber: 20,
  evaluationTime: 100,
}

test('evaluates the RTD at mean residence time', () => {
  const result =
    calculateAxialDispersionRTD(
      example,
    )

  assert.equal(
    result.dimensionlessTime,
    1,
  )

  assert.ok(
    Math.abs(
      result.dimensionlessExitAgeDensity -
      Math.sqrt(
        20 /
        (
          4 *
          Math.PI
        ),
      ),
    ) < 1e-12,
  )
})

test('variance follows two divided by Peclet number', () => {
  const result =
    calculateAxialDispersionRTD(
      example,
    )

  assert.equal(
    result.dimensionlessVariance,
    0.1,
  )

  assert.ok(
    result.cumulativeExitFraction >
    0 &&
    result.cumulativeExitFraction <
    1,
  )
})

test('rejects zero Peclet number', () => {
  assert.throws(
    () =>
      calculateAxialDispersionRTD({
        ...example,
        pecletNumber: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch01CalculationError &&
      error.code ===
        'invalidAxialDispersionInputs',
  )
})
