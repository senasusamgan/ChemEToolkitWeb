import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CubicRouthHurwitzStabilityCalculationError,
  calculateCubicRouthHurwitzStability,
} from '../../src/features/process-control/cubic-routh-hurwitz-stability/engine.ts'

test('classifies a stable cubic polynomial', () => {
  const result = calculateCubicRouthHurwitzStability({
    coefficient3: 1,
    coefficient2: 6,
    coefficient1: 11,
    coefficient0: 6,
  })
  assert.equal(
    result.stabilityClassification,
    'Asymptotically stable',
  )
  assert.equal(result.stabilityDeterminant, 60)
  assert.equal(result.thirdRowFirstElement, 10)
  assert.equal(result.rightHalfPlaneRootCount, 0)
})

test('counts two right-half-plane roots for an unstable case', () => {
  const result = calculateCubicRouthHurwitzStability({
    coefficient3: 1,
    coefficient2: 2,
    coefficient1: 1,
    coefficient0: 4,
  })
  assert.equal(result.stabilityClassification, 'Unstable')
  assert.equal(result.thirdRowFirstElement, -1)
  assert.equal(result.rightHalfPlaneRootCount, 2)
})

test('rejects the zero second-row special case', () => {
  assert.throws(
    () => calculateCubicRouthHurwitzStability({
      coefficient3: 1,
      coefficient2: 0,
      coefficient1: 2,
      coefficient0: 1,
    }),
    (error: unknown) =>
      error instanceof
        CubicRouthHurwitzStabilityCalculationError &&
      error.code === 'zeroSecondCoefficient',
  )
})
