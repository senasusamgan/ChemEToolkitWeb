import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculateEquipmentCostScaling,
} from '../../src/features/process-safety-economics/batch01/engine.ts'

test('scales equipment cost by capacity exponent', () => {
  const result =
    calculateEquipmentCostScaling({
      referenceEquipmentCost:
        1_000_000,
      referenceCapacity: 100,
      targetCapacity: 250,
      scalingExponent: 0.6,
    })

  assert.ok(
    Math.abs(
      result.scaledEquipmentCost -
      1_000_000 * 2.5 ** 0.6,
    ) < 1e-9,
  )
})

test('detects economies of scale', () => {
  const result =
    calculateEquipmentCostScaling({
      referenceEquipmentCost:
        1000,
      referenceCapacity: 10,
      targetCapacity: 20,
      scalingExponent: 0.6,
    })

  assert.equal(
    result.economiesOfScaleObserved,
    true,
  )
  assert.ok(
    result.targetUnitCost <
    result.referenceUnitCost,
  )
})

test('rejects zero reference capacity', () => {
  assert.throws(
    () =>
      calculateEquipmentCostScaling({
        referenceEquipmentCost:
          1000,
        referenceCapacity: 0,
        targetCapacity: 20,
        scalingExponent: 0.6,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch01CalculationError &&
      error.code ===
        'invalidEquipmentScalingInputs',
  )
})
