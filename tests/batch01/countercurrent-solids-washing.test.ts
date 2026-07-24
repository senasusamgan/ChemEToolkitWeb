import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CountercurrentSolidsWashingCalculationError,
  calculateCountercurrentSolidsWashing,
} from '../../src/features/mass-transfer/countercurrent-solids-washing/engine.ts'

const example = {
  insolubleSolidFlowRate: 100,
  retainedSolventPerInsolubleSolid: 0.5,
  freshWashSolventFlowRate: 100,
  feedUnderflowSoluteRatio: 0.2,
  freshWashSoluteRatio: 0,
  numberOfIdealStages: 3,
}

test('countercurrent washing solves the coupled stage balances', () => {
  const result = calculateCountercurrentSolidsWashing(example)
  assert.equal(result.numberOfIdealStages, 3)
  assert.ok(Math.abs(result.washingFactor - 2) < 1e-12)
  assert.ok(Math.abs(result.productOverflowSoluteRatio - 0.09333333333333334) < 1e-12)
  assert.ok(Math.abs(result.finalUnderflowSoluteRatio - 0.013333333333333334) < 1e-12)
  assert.ok(Math.abs(result.soluteRemovalFraction - 0.9333333333333333) < 1e-12)
  assert.ok(Math.abs(result.soluteBalanceResidual) < 1e-12)
})

test('one washing stage reduces to one ideal mixing-settling contact', () => {
  const result = calculateCountercurrentSolidsWashing({ ...example, numberOfIdealStages: 1 })
  assert.ok(Math.abs(result.finalUnderflowSoluteRatio - 0.06666666666666667) < 1e-12)
  assert.ok(Math.abs(result.soluteRemovalFraction - 0.6666666666666666) < 1e-12)
})

test('countercurrent washing rejects a fractional stage count', () => {
  assert.throws(
    () => calculateCountercurrentSolidsWashing({ ...example, numberOfIdealStages: 2.5 }),
    (error) => error instanceof CountercurrentSolidsWashingCalculationError && error.code === 'invalidStageCount',
  )
})
