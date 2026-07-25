import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch06CalculationError,
  calculateValveCharacteristics,
} from '../../src/features/process-control/batch06/engine.ts'

test('linear characteristic follows valve travel', () => {
  const result =
    calculateValveCharacteristics({
      characteristicMode: 1,
      ratedFlowCoefficient: 100,
      valveTravelPercent: 60,
      rangeability: 50,
      pressureDrop: 25,
      liquidSpecificGravity: 1,
    })

  assert.ok(
    Math.abs(
      result.normalizedFlowCoefficient -
      0.6,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.effectiveFlowCoefficient -
      60,
    ) < 1e-12,
  )
  assert.equal(
    result.estimatedLiquidFlowRate,
    300,
  )
})

test('equal-percentage Cv increases with travel', () => {
  const low =
    calculateValveCharacteristics({
      characteristicMode: 2,
      ratedFlowCoefficient: 100,
      valveTravelPercent: 30,
      rangeability: 50,
      pressureDrop: 25,
      liquidSpecificGravity: 1,
    })

  const high =
    calculateValveCharacteristics({
      characteristicMode: 2,
      ratedFlowCoefficient: 100,
      valveTravelPercent: 70,
      rangeability: 50,
      pressureDrop: 25,
      liquidSpecificGravity: 1,
    })

  assert.ok(
    high.effectiveFlowCoefficient >
    low.effectiveFlowCoefficient,
  )
})

test('rejects an unsupported characteristic mode', () => {
  assert.throws(
    () =>
      calculateValveCharacteristics({
        characteristicMode: 4,
        ratedFlowCoefficient: 100,
        valveTravelPercent: 50,
        rangeability: 50,
        pressureDrop: 25,
        liquidSpecificGravity: 1,
      }),
    (error: unknown) =>
      error instanceof
        ProcessControlBatch06CalculationError &&
      error.code ===
        'invalidValveSettings',
  )
})
