import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateNonInteractingTankSystem, ProcessControlBatch03CalculationError } from '../../src/features/process-control/batch03/engine.ts'
const example = { firstTankArea: 2, firstTankResistance: 1.5, secondTankArea: 3, secondTankResistance: 2, inletFlowStep: 1, evaluationTime: 20, integrationSteps: 2000 }

test('produces positive levels and closes volume balance', () => {
  const result = calculateNonInteractingTankSystem(example)
  assert.ok(Number(result.items[0].value) > 0)
  assert.ok(Number(result.headlineValue) > 0)
  assert.ok(Math.abs(Number(result.items[7].value)) < 1e-8)
})

test('approaches analytical steady-state levels', () => {
  const result = calculateNonInteractingTankSystem({ ...example, evaluationTime: 200, integrationSteps: 20000 })
  assert.ok(Math.abs(Number(result.items[0].value) - Number(result.items[5].value)) < 1e-6)
  assert.ok(Math.abs(Number(result.headlineValue) - Number(result.items[6].value)) < 1e-6)
})

test('rejects zero resistance', () => {
  assert.throws(() => calculateNonInteractingTankSystem({ ...example, secondTankResistance: 0 }), (error: unknown) => error instanceof ProcessControlBatch03CalculationError && error.code === 'invalidParameter')
})
