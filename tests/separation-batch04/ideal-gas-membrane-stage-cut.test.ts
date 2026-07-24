import assert from 'node:assert/strict'
import test from 'node:test'
import {
  IdealGasMembraneStageCutCalculationError,
  calculateIdealGasMembraneStageCut,
} from '../../src/features/separation-processes/ideal-gas-membrane-stage-cut/engine.ts'

test('solves ideal stage cut and recovery', () => {
  const result = calculateIdealGasMembraneStageCut({
    feedSoluteFraction: 0.3,
    permeateSoluteFraction: 0.75,
    retentateSoluteFraction: 0.1,
  })
  assert.ok(Math.abs(result.stageCut - 0.3076923076923077) < 1e-12)
  assert.ok(Math.abs(result.soluteRecoveryToPermeate - 0.7692307692307693) < 1e-12)
  assert.ok(Math.abs(result.soluteBalanceResidual) < 1e-12)
})

test('flow fractions sum to one', () => {
  const result = calculateIdealGasMembraneStageCut({
    feedSoluteFraction: 0.4,
    permeateSoluteFraction: 0.8,
    retentateSoluteFraction: 0.2,
  })
  assert.ok(Math.abs(
    result.permeateFlowPerUnitFeed +
    result.retentateFlowPerUnitFeed -
    1
  ) < 1e-12)
})

test('rejects invalid composition ordering', () => {
  assert.throws(
    () => calculateIdealGasMembraneStageCut({
      feedSoluteFraction: 0.3,
      permeateSoluteFraction: 0.2,
      retentateSoluteFraction: 0.1,
    }),
    (error: unknown) =>
      error instanceof IdealGasMembraneStageCutCalculationError &&
      error.code === 'invalidCompositionOrdering',
  )
})
