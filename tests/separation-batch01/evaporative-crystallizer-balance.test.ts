import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EvaporativeCrystallizerBalanceCalculationError,
  calculateEvaporativeCrystallizerBalance,
} from '../../src/features/separation-processes/evaporative-crystallizer-balance/engine.ts'

test('solves evaporative crystallizer balances', () => {
  const result = calculateEvaporativeCrystallizerBalance({
    feedMassFlowRate: 1000,
    feedSoluteMassFraction: 0.2,
    motherLiquorSoluteMassFraction: 0.35,
    solventEvaporationRate: 500,
    crystalPurity: 1,
  })
  assert.ok(Math.abs(result.productCrystalRate - 38.46153846153846) < 1e-10)
  assert.ok(Math.abs(result.motherLiquorRate - 461.53846153846155) < 1e-10)
  assert.ok(Math.abs(result.soluteBalanceResidual) < 1e-10)
})

test('supports impure crystals', () => {
  const result = calculateEvaporativeCrystallizerBalance({
    feedMassFlowRate: 1000,
    feedSoluteMassFraction: 0.25,
    motherLiquorSoluteMassFraction: 0.35,
    solventEvaporationRate: 500,
    crystalPurity: 0.95,
  })
  assert.ok(result.productCrystalRate > 0)
  assert.ok(result.soluteRecoveryFraction < 1)
})

test('rejects states without positive crystallization', () => {
  assert.throws(
    () => calculateEvaporativeCrystallizerBalance({
      feedMassFlowRate: 1000,
      feedSoluteMassFraction: 0.1,
      motherLiquorSoluteMassFraction: 0.35,
      solventEvaporationRate: 100,
      crystalPurity: 1,
    }),
    (error: unknown) =>
      error instanceof EvaporativeCrystallizerBalanceCalculationError &&
      error.code === 'noCrystallization',
  )
})
