import assert from 'node:assert/strict'
import test from 'node:test'
import {
  InteractingTankSystemCalculationError,
  calculateInteractingTankSystem,
} from '../../src/features/process-control/interacting-tank-system/engine.ts'

const example = {
  firstTankArea: 2,
  secondTankArea: 3,
  interTankResistance: 1.5,
  outletResistance: 2,
  inletFlowStep: 1,
  evaluationTime: 20,
  integrationSteps: 2000,
}

test('produces positive transient levels and a volume balance', () => {
  const result = calculateInteractingTankSystem(example)

  assert.ok(result.firstTankLevel > result.secondTankLevel)
  assert.ok(result.secondTankLevel > 0)
  assert.ok(result.outletFlow > 0)
  assert.ok(
    Math.abs(result.volumeBalanceResidual) < 1e-8,
  )
})

test('approaches the analytical steady-state levels', () => {
  const result = calculateInteractingTankSystem({
    ...example,
    evaluationTime: 200,
    integrationSteps: 20000,
  })

  assert.ok(
    Math.abs(
      result.firstTankLevel -
      result.firstSteadyStateLevel,
    ) < 1e-5,
  )
  assert.ok(
    Math.abs(
      result.secondTankLevel -
      result.secondSteadyStateLevel,
    ) < 1e-5,
  )
})

test('rejects zero tank area', () => {
  assert.throws(
    () => calculateInteractingTankSystem({
      ...example,
      firstTankArea: 0,
    }),
    (error: unknown) =>
      error instanceof InteractingTankSystemCalculationError &&
      error.code === 'nonPositiveGeometry',
  )
})
