import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateToxicExposureDoseScreening,
} from '../../src/features/process-safety-economics/batch05/engine.ts'

const example = {
  exposureConcentration: 500,
  exposureDuration: 30,
  concentrationExponent: 2,
  referenceDose: 10_000_000,
}

test('calculates concentration-time toxic dose', () => {
  const result =
    calculateToxicExposureDoseScreening(
      example,
    )

  assert.equal(
    result.concentrationTerm,
    250_000,
  )
  assert.equal(
    result.toxicDose,
    7_500_000,
  )
  assert.equal(
    result.doseRatio,
    0.75,
  )
})

test('higher duration increases dose linearly', () => {
  const short =
    calculateToxicExposureDoseScreening(
      example,
    )

  const long =
    calculateToxicExposureDoseScreening({
      ...example,
      exposureDuration: 60,
    })

  assert.equal(
    long.toxicDose /
    short.toxicDose,
    2,
  )
})

test('rejects zero exponent', () => {
  assert.throws(
    () =>
      calculateToxicExposureDoseScreening({
        ...example,
        concentrationExponent: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch05CalculationError &&
      error.code ===
        'invalidToxicDoseInputs',
  )
})
