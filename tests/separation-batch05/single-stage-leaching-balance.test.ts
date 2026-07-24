import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SingleStageLeachingBalanceCalculationError,
  calculateSingleStageLeachingBalance,
} from '../../src/features/separation-processes/single-stage-leaching-balance/engine.ts'

test('solves a single-stage leaching balance', () => {
  const result = calculateSingleStageLeachingBalance({
    dryInertSolidMass: 100,
    initialSolutionMass: 50,
    initialSolutionSoluteFraction: 0.2,
    freshSolventMass: 100,
    retainedSolutionPerDrySolid: 0.5,
  })
  assert.equal(result.totalMixedSolutionMass, 150)
  assert.equal(result.retainedUnderflowSolutionMass, 50)
  assert.equal(result.overflowExtractSolutionMass, 100)
  assert.ok(Math.abs(result.mixedSolutionSoluteFraction - 1 / 15) < 1e-12)
  assert.ok(Math.abs(result.soluteBalanceResidual) < 1e-12)
})

test('more wash solvent lowers extract concentration', () => {
  const low = calculateSingleStageLeachingBalance({
    dryInertSolidMass: 100,
    initialSolutionMass: 50,
    initialSolutionSoluteFraction: 0.2,
    freshSolventMass: 50,
    retainedSolutionPerDrySolid: 0.5,
  })
  const high = calculateSingleStageLeachingBalance({
    dryInertSolidMass: 100,
    initialSolutionMass: 50,
    initialSolutionSoluteFraction: 0.2,
    freshSolventMass: 150,
    retainedSolutionPerDrySolid: 0.5,
  })
  assert.ok(high.mixedSolutionSoluteFraction < low.mixedSolutionSoluteFraction)
  assert.ok(high.soluteInExtract > low.soluteInExtract)
})

test('rejects a case with no overflow extract', () => {
  assert.throws(
    () => calculateSingleStageLeachingBalance({
      dryInertSolidMass: 100,
      initialSolutionMass: 20,
      initialSolutionSoluteFraction: 0.2,
      freshSolventMass: 20,
      retainedSolutionPerDrySolid: 0.5,
    }),
    (error: unknown) =>
      error instanceof SingleStageLeachingBalanceCalculationError &&
      error.code === 'noOverflowExtract',
  )
})
