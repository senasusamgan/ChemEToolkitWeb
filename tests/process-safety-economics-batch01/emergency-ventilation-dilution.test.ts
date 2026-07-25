import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculateEmergencyVentilationDilution,
} from '../../src/features/process-safety-economics/batch01/engine.ts'

const example = {
  enclosureVolume: 1000,
  ventilationFlowRate: 2,
  initialConcentration: 1000,
  targetConcentration: 200,
  elapsedTime: 600,
}

test('calculates well-mixed exponential dilution', () => {
  const result =
    calculateEmergencyVentilationDilution(
      example,
    )

  assert.equal(
    result.exchangeTimeConstant,
    500,
  )
  assert.ok(
    Math.abs(
      result.concentrationAtElapsedTime -
      1000 * Math.exp(-1.2),
    ) < 1e-12,
  )
})

test('calculates time to target concentration', () => {
  const result =
    calculateEmergencyVentilationDilution(
      example,
    )

  assert.ok(
    Math.abs(
      result.timeToTarget -
      500 * Math.log(5),
    ) < 1e-12,
  )
})

test('rejects a target above initial concentration', () => {
  assert.throws(
    () =>
      calculateEmergencyVentilationDilution({
        ...example,
        targetConcentration: 1200,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch01CalculationError &&
      error.code ===
        'invalidVentilationInputs',
  )
})
