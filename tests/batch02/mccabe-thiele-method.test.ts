import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateMcCabeThieleMethod } from '../../src/features/mass-transfer/mccabe-thiele-method/engine.ts'

const example = {
  relativeVolatility: 2.5,
  distillateLightMoleFraction: 0.95,
  bottomsLightMoleFraction: 0.05,
  feedLightMoleFraction: 0.5,
  refluxRatio: 2.5,
  feedQuality: 1,
}

test('steps the column and calculates the feed stage', () => {
  const result = calculateMcCabeThieleMethod(example)

  assert.ok(
    Math.abs(
      result.continuousTheoreticalStageCount -
        9.37557178499915,
    ) < 1e-10,
  )
  assert.equal(result.requiredWholeStageCount, 10)
  assert.equal(result.feedStageNumber, 5)
  assert.ok(Math.abs(result.minimumRefluxRatio - 1.1) < 1e-10)
})

test('produces a physical fractional final stage', () => {
  const result = calculateMcCabeThieleMethod(example)

  assert.equal(result.stageLiquidCompositions.length, 10)
  assert.ok(result.finalStageFraction > 0)
  assert.ok(result.finalStageFraction < 1)
  assert.ok(
    result.stageLiquidCompositions[
      result.stageLiquidCompositions.length - 1
    ] < 0.05,
  )
})

test('inherits operating-line validation', () => {
  assert.throws(() =>
    calculateMcCabeThieleMethod({
      ...example,
      relativeVolatility: 1,
    }),
  )

  assert.throws(() =>
    calculateMcCabeThieleMethod({
      ...example,
      refluxRatio: 1.1,
    }),
  )
})
