import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch09CalculationError,
  calculateTanksInSeriesRTD,
} from '../../src/features/reaction-engineering/batch09/engine.ts'

const example = {
  meanResidenceTime: 100,
  tanksInSeries: 5,
  evaluationTime: 100,
}

test('calculates Erlang density at dimensionless time one', () => {
  const result =
    calculateTanksInSeriesRTD(
      example,
    )

  const expectedDimensionless =
    5 ** 5 /
    24 *
    Math.exp(-5)

  assert.ok(
    Math.abs(
      result.exitAgeDensity -
      expectedDimensionless /
      100,
    ) < 1e-15,
  )
})

test('variance equals mean-time squared divided by tank count', () => {
  const result =
    calculateTanksInSeriesRTD(
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
      calculateTanksInSeriesRTD({
        ...example,
        tanksInSeries: 4.5,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch09CalculationError &&
      error.code ===
        'invalidTanksInputs',
  )
})
