import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateReactiveDistillationBasics,
} from '../../src/features/reaction-engineering/batch07/engine.ts'

const example = {
  initialConcentrationA: 1,
  initialConcentrationB: 1,
  equilibriumConstant: 4,
  stageProductRemovalFraction: 0.5,
  equilibriumStages: 5,
}

test('conserves material across reactants and product', () => {
  const result =
    calculateReactiveDistillationBasics(
      example,
    )

  assert.ok(
    Math.abs(
      result.remainingConcentrationA +
      result.totalProductFormed -
      1,
    ) < 1e-10,
  )

  assert.ok(
    Math.abs(
      result.remainingConcentrationB +
      result.totalProductFormed -
      1,
    ) < 1e-10,
  )
})

test('stagewise product removal enhances conversion', () => {
  const result =
    calculateReactiveDistillationBasics(
      example,
    )

  assert.ok(
    result.conversionEnhancementOverSingleStage >
    0,
  )

  assert.equal(
    result.stageConversionsA.length,
    5,
  )
})

test('rejects non-integer stage count', () => {
  assert.throws(
    () =>
      calculateReactiveDistillationBasics({
        ...example,
        equilibriumStages: 4.5,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch07CalculationError &&
      error.code ===
        'invalidReactiveDistillationInputs',
  )
})
