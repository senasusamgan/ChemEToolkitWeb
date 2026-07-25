import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateGaussianPlumeDispersion,
} from '../../src/features/process-safety-economics/batch05/engine.ts'

const example = {
  sourceEmissionRate: 1,
  windSpeed: 5,
  crosswindDistance: 0,
  receptorHeight: 1.5,
  effectiveReleaseHeight: 20,
  horizontalDispersionCoefficient: 30,
  verticalDispersionCoefficient: 15,
}

test('calculates reflected Gaussian plume concentration', () => {
  const result =
    calculateGaussianPlumeDispersion(
      example,
    )

  const prefactor =
    1 /
    (
      2 *
      Math.PI *
      5 *
      30 *
      15
    )

  const expected =
    prefactor *
    (
      Math.exp(
        -((1.5 - 20) ** 2) /
        (2 * 15 ** 2),
      ) +
      Math.exp(
        -((1.5 + 20) ** 2) /
        (2 * 15 ** 2),
      )
    )

  assert.ok(
    Math.abs(
      result.receptorConcentration -
      expected,
    ) < 1e-15,
  )
})

test('crosswind displacement lowers concentration', () => {
  const center =
    calculateGaussianPlumeDispersion(
      example,
    )

  const offset =
    calculateGaussianPlumeDispersion({
      ...example,
      crosswindDistance: 60,
    })

  assert.ok(
    offset.receptorConcentration <
    center.receptorConcentration,
  )
})

test('rejects zero wind speed', () => {
  assert.throws(
    () =>
      calculateGaussianPlumeDispersion({
        ...example,
        windSpeed: 0,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch05CalculationError &&
      error.code ===
        'invalidGaussianPlumeInputs',
  )
})
