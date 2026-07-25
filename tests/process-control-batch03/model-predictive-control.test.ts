import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateModelPredictiveControl, ProcessControlBatch03CalculationError } from '../../src/features/process-control/batch03/engine.ts'
const example = { processGain: 2, processTimeConstant: 8, sampleTime: 1, predictionHorizon: 12, controlPenalty: 2, currentOutput: 2, setpoint: 10, previousInput: 1, maximumMoveMagnitude: 2 }

test('recommends a positive move toward a higher setpoint', () => {
  const result = calculateModelPredictiveControl(example)
  assert.ok(Number(result.items[1].value) > 0)
  assert.ok(Number(result.headlineValue) > example.previousInput)
  assert.ok(Number(result.items[3].value) > Number(result.items[2].value))
})

test('enforces the move limit', () => {
  const result = calculateModelPredictiveControl({ ...example, setpoint: 100, maximumMoveMagnitude: 0.25 })
  assert.equal(result.items[1].value, 0.25)
  assert.equal(result.items[5].value, 'Yes')
})

test('rejects zero prediction horizon', () => {
  assert.throws(() => calculateModelPredictiveControl({ ...example, predictionHorizon: 0 }), (error: unknown) => error instanceof ProcessControlBatch03CalculationError && error.code === 'invalidParameter')
})
