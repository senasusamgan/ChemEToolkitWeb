import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateReversibleReactions,
} from '../../src/features/reaction-engineering/batch08/engine.ts'

const example = {
  initialConcentrationA: 1,
  initialConcentrationB: 0,
  forwardRateConstant: 0.08,
  reverseRateConstant: 0.02,
  reactionTime: 30,
}

test('approaches the analytical reversible equilibrium', () => {
  const result = calculateReversibleReactions(example)
  assert.ok(Math.abs(result.equilibriumConcentrationA - 0.2) < 1e-15)
  assert.ok(Math.abs(result.finalConcentrationA - (0.2 + 0.8 * Math.exp(-3))) < 1e-15)
})

test('conserves total concentration', () => {
  const result = calculateReversibleReactions(example)
  assert.ok(Math.abs(result.finalConcentrationA + result.finalConcentrationB - 1) < 1e-15)
})

test('rejects zero rate constant', () => {
  assert.throws(
    () => calculateReversibleReactions({ ...example, reverseRateConstant: 0 }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch08CalculationError &&
      error.code === 'invalidReversibleInputs',
  )
})
