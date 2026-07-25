import assert from 'node:assert/strict'
import test from 'node:test'
import {
  InternalModelControlAnalysisCalculationError,
  calculateInternalModelControlAnalysis,
} from '../../src/features/process-control/internal-model-control-analysis/engine.ts'

test('nominal model gives the expected filtered closed-loop magnitude', () => {
  const result = calculateInternalModelControlAnalysis({
    actualProcessGain: 2,
    actualTimeConstant: 5,
    actualDeadTime: 1,
    modelProcessGain: 2,
    modelTimeConstant: 5,
    modelDeadTime: 1,
    filterTimeConstant: 3,
    angularFrequency: 0.2,
  })

  const expected =
    1 / Math.sqrt(1 + (0.2 * 3) ** 2)

  assert.ok(result.modelMismatchMagnitude < 1e-12)
  assert.ok(
    Math.abs(result.closedLoopMagnitude - expected) <
    1e-12,
  )
  assert.ok(
    Math.abs(
      result.nominalClosedLoopMagnitude -
      expected,
    ) < 1e-12,
  )
})

test('model mismatch changes the robust closed-loop result', () => {
  const nominal = calculateInternalModelControlAnalysis({
    actualProcessGain: 2,
    actualTimeConstant: 5,
    actualDeadTime: 1,
    modelProcessGain: 2,
    modelTimeConstant: 5,
    modelDeadTime: 1,
    filterTimeConstant: 3,
    angularFrequency: 0.4,
  })

  const mismatched = calculateInternalModelControlAnalysis({
    actualProcessGain: 2.4,
    actualTimeConstant: 7,
    actualDeadTime: 1.5,
    modelProcessGain: 2,
    modelTimeConstant: 5,
    modelDeadTime: 1,
    filterTimeConstant: 3,
    angularFrequency: 0.4,
  })

  assert.ok(mismatched.modelMismatchMagnitude > 0)
  assert.notEqual(
    mismatched.closedLoopMagnitude,
    nominal.closedLoopMagnitude,
  )
})

test('rejects zero model process gain', () => {
  assert.throws(
    () => calculateInternalModelControlAnalysis({
      actualProcessGain: 2,
      actualTimeConstant: 5,
      actualDeadTime: 1,
      modelProcessGain: 0,
      modelTimeConstant: 5,
      modelDeadTime: 1,
      filterTimeConstant: 3,
      angularFrequency: 0.2,
    }),
    (error: unknown) =>
      error instanceof
        InternalModelControlAnalysisCalculationError &&
      error.code === 'zeroProcessGain',
  )
})
