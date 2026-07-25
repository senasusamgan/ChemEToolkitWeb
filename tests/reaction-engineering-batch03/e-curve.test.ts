import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateECurveGenerator,
} from '../../src/features/reaction-engineering/batch03/engine.ts'

const example = {
  meanResidenceTime: 100,
  tanksInSeries: 5,
  evaluationTime: 100,
}

test('calculates E-curve value at dimensionless time one', () => {
  const result =
    calculateECurveGenerator(
      example,
    )

  const expected =
    5 ** 5 /
    24 *
    Math.exp(-5)

  assert.ok(
    Math.abs(
      result.dimensionlessExitAgeDensity -
      expected,
    ) < 1e-15,
  )
})

test('variance follows one divided by tank count', () => {
  const result =
    calculateECurveGenerator(
      example,
    )

  assert.equal(
    result.dimensionlessVariance,
    0.2,
  )

  assert.equal(
    result.residenceTimeVariance,
    2000,
  )
})

test('rejects non-integer tank count', () => {
  assert.throws(
    () =>
      calculateECurveGenerator({
        ...example,
        tanksInSeries: 4.5,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch03CalculationError &&
      error.code ===
        'invalidECurveInputs',
  )
})
