import assert from 'node:assert/strict'
import test from 'node:test'
import {
  OverrideSelectiveControlCalculationError,
  calculateOverrideSelectiveControl,
} from '../../src/features/process-control/override-selective-control/engine.ts'

test('high selector chooses the highest constraint demand', () => {
  const result = calculateOverrideSelectiveControl({
    selectorMode: 1,
    normalControllerDemand: 55,
    firstConstraintDemand: 72,
    secondConstraintDemand: 48,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.selectedDemand, 72)
  assert.equal(result.selectedSource, 'Constraint controller 1')
  assert.equal(result.overrideActive, true)
  assert.equal(result.constrainedOutput, 72)
})

test('low selector chooses the lowest demand and clamps output', () => {
  const result = calculateOverrideSelectiveControl({
    selectorMode: -1,
    normalControllerDemand: 40,
    firstConstraintDemand: -10,
    secondConstraintDemand: 30,
    minimumOutput: 0,
    maximumOutput: 100,
  })

  assert.equal(result.selectedDemand, -10)
  assert.equal(result.constrainedOutput, 0)
  assert.equal(result.outputWasClamped, true)
})

test('rejects an unsupported selector mode', () => {
  assert.throws(
    () => calculateOverrideSelectiveControl({
      selectorMode: 0,
      normalControllerDemand: 55,
      firstConstraintDemand: 72,
      secondConstraintDemand: 48,
      minimumOutput: 0,
      maximumOutput: 100,
    }),
    (error: unknown) =>
      error instanceof
        OverrideSelectiveControlCalculationError &&
      error.code === 'invalidSelectorMode',
  )
})
