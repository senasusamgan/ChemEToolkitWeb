import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch05CalculationError,
  calculateMIMODecoupling,
} from '../../src/features/process-control/batch05/engine.ts'

test('solves the 2x2 steady-state input targets', () => {
  const result = calculateMIMODecoupling({
    k11: 2, k12: 0.4, k21: 0.3, k22: 1.5,
    outputTarget1: 5, outputTarget2: 3,
  })
  assert.ok(Math.abs(
    2 * result.manipulatedInput1 +
    0.4 * result.manipulatedInput2 - 5,
  ) < 1e-12)
  assert.ok(Math.abs(
    0.3 * result.manipulatedInput1 +
    1.5 * result.manipulatedInput2 - 3,
  ) < 1e-12)
})

test('RGA rows sum to one', () => {
  const result = calculateMIMODecoupling({
    k11: 2, k12: 0.4, k21: 0.3, k22: 1.5,
    outputTarget1: 5, outputTarget2: 3,
  })
  assert.ok(Math.abs(
    result.relativeGain11 + result.relativeGain12 - 1,
  ) < 1e-12)
})

test('rejects a singular matrix', () => {
  assert.throws(
    () => calculateMIMODecoupling({
      k11: 1, k12: 2, k21: 2, k22: 4,
      outputTarget1: 1, outputTarget2: 1,
    }),
    (error: unknown) =>
      error instanceof ProcessControlBatch05CalculationError &&
      error.code === 'singularMatrix',
  )
})
