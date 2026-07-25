import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RiddersRootFinderCalculationError,
  calculateRiddersRootFinder,
} from '../../src/features/numerical-methods/ridders-root-finder/engine.ts'

test('finds the real root of x cubed minus 2x minus 5', () => {
  const result = calculateRiddersRootFinder({
    coefficient3: 1,
    coefficient2: 0,
    coefficient1: -2,
    coefficient0: -5,
    lowerBound: 2,
    upperBound: 3,
    tolerance: 1e-12,
    maximumIterations: 100,
  })
  assert.equal(result.converged, true)
  assert.ok(Math.abs(result.functionAtRoot) < 1e-10)
  assert.ok(Math.abs(result.root - 2.0945514815) < 1e-8)
})

test('returns an endpoint root immediately', () => {
  const result = calculateRiddersRootFinder({
    coefficient3: 0,
    coefficient2: 0,
    coefficient1: 1,
    coefficient0: -2,
    lowerBound: 2,
    upperBound: 4,
    tolerance: 1e-10,
    maximumIterations: 100,
  })
  assert.equal(result.root, 2)
  assert.equal(result.iterations, 0)
})

test('rejects a bracket without a sign change', () => {
  assert.throws(
    () => calculateRiddersRootFinder({
      coefficient3: 0,
      coefficient2: 1,
      coefficient1: 0,
      coefficient0: 1,
      lowerBound: -1,
      upperBound: 1,
      tolerance: 1e-8,
      maximumIterations: 100,
    }),
    (error: unknown) =>
      error instanceof RiddersRootFinderCalculationError &&
      error.code === 'rootNotBracketed',
  )
})
