import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LaplaceEquationFiniteDifferenceCalculationError,
  calculateLaplaceEquationFiniteDifference,
} from '../../src/features/numerical-methods/laplace-equation-finite-difference/engine.ts'

test('uniform boundaries give a uniform field', () => {
  const result = calculateLaplaceEquationFiniteDifference({
    topBoundary: 25,
    bottomBoundary: 25,
    leftBoundary: 25,
    rightBoundary: 25,
    interiorNodesPerSide: 5,
    tolerance: 1e-10,
    maximumIterations: 1000,
    relaxationFactor: 1.2,
  })
  assert.ok(result.grid.flat().every(
    (value) => Math.abs(value - 25) < 1e-10,
  ))
})

test('solution remains inside boundary extrema', () => {
  const result = calculateLaplaceEquationFiniteDifference({
    topBoundary: 100,
    bottomBoundary: 0,
    leftBoundary: 0,
    rightBoundary: 0,
    interiorNodesPerSide: 9,
    tolerance: 1e-7,
    maximumIterations: 10000,
    relaxationFactor: 1.5,
  })
  assert.equal(result.converged, true)
  assert.ok(result.centerValue > 0)
  assert.ok(result.centerValue < 100)
  assert.ok(result.minimumValue >= 0)
  assert.ok(result.maximumValue <= 100)
})

test('rejects relaxation factor of two', () => {
  assert.throws(
    () => calculateLaplaceEquationFiniteDifference({
      topBoundary: 1,
      bottomBoundary: 0,
      leftBoundary: 0,
      rightBoundary: 0,
      interiorNodesPerSide: 5,
      tolerance: 1e-6,
      maximumIterations: 1000,
      relaxationFactor: 2,
    }),
    (error: unknown) =>
      error instanceof LaplaceEquationFiniteDifferenceCalculationError &&
      error.code === 'invalidRelaxationFactor',
  )
})
