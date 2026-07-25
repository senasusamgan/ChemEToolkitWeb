import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BlockDiagramAlgebraCalculationError,
  calculateBlockDiagramAlgebra,
} from '../../src/features/process-control/block-diagram-algebra/engine.ts'

test('reduces two series blocks with negative feedback', () => {
  const result = calculateBlockDiagramAlgebra({
    firstForwardGain: 2,
    secondForwardGain: 3,
    feedbackGain: 0.5,
    inputSignal: 4,
  })
  assert.equal(result.seriesForwardGain, 6)
  assert.equal(result.loopGain, 3)
  assert.equal(result.closedLoopGain, 1.5)
  assert.equal(result.outputSignal, 6)
  assert.equal(result.errorSignal, 1)
  assert.equal(result.sensitivity, 0.25)
})

test('returns the series gain when feedback is zero', () => {
  const result = calculateBlockDiagramAlgebra({
    firstForwardGain: 4,
    secondForwardGain: 0.5,
    feedbackGain: 0,
    inputSignal: 3,
  })
  assert.equal(result.closedLoopGain, 2)
  assert.equal(result.outputSignal, 6)
})

test('rejects a singular feedback denominator', () => {
  assert.throws(
    () => calculateBlockDiagramAlgebra({
      firstForwardGain: 1,
      secondForwardGain: 1,
      feedbackGain: -1,
      inputSignal: 1,
    }),
    (error: unknown) =>
      error instanceof BlockDiagramAlgebraCalculationError &&
      error.code === 'singularFeedbackDenominator',
  )
})
