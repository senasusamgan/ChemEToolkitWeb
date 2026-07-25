import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch06CalculationError,
  calculatePBRPressureDropEffects,
} from '../../src/features/reaction-engineering/batch06/engine.ts'

const example = {
  inletMolarFlowRateA: 10,
  inletConcentrationA: 1000,
  catalystWeight: 200,
  massSpecificFirstOrderRateConstant: 0.00002,
  pressureDropCoefficient: 0.002,
  inletPressure: 500_000,
}

test('calculates outlet pressure ratio', () => {
  const result =
    calculatePBRPressureDropEffects(
      example,
    )

  assert.ok(
    Math.abs(
      result.outletPressureRatio -
      Math.sqrt(0.6),
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.outletPressure -
      500_000 *
      Math.sqrt(0.6),
    ) < 1e-9,
  )
})

test('pressure drop reduces conversion', () => {
  const result =
    calculatePBRPressureDropEffects(
      example,
    )

  assert.ok(
    result.conversionWithPressureDrop <
    result.conversionWithoutPressureDrop,
  )

  assert.ok(
    result.conversionPenalty > 0,
  )
})

test('rejects pressure-drop product equal to one', () => {
  assert.throws(
    () =>
      calculatePBRPressureDropEffects({
        ...example,
        pressureDropCoefficient: 0.005,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch06CalculationError &&
      error.code ===
        'pressureDropLimitExceeded',
  )
})
