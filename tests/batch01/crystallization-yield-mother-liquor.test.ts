import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CrystallizationYieldMotherLiquorCalculationError,
  calculateCrystallizationYieldMotherLiquor,
} from '../../src/features/mass-transfer/crystallization-yield-mother-liquor/engine.ts'

const example = {
  feedSolutionMass: 1000,
  feedSoluteMassFraction: 0.3,
  evaporatedSolventMass: 100,
  finalSolubilityRatio: 0.25,
  crystalSoluteMassFraction: 1,
}

test('crystallization computes pure-crystal recovery and mother liquor', () => {
  const result = calculateCrystallizationYieldMotherLiquor(example)
  assert.equal(result.phaseState, 'crystalsFormed')
  assert.ok(Math.abs(result.supersaturationRatio - 2) < 1e-12)
  assert.ok(Math.abs(result.crystalMass - 150) < 1e-12)
  assert.ok(Math.abs(result.motherLiquorTotalMass - 750) < 1e-12)
  assert.ok(Math.abs(result.soluteRecoveryFraction - 0.5) < 1e-12)
  assert.ok(Math.abs(result.totalMassBalanceResidual) < 1e-12)
})

test('crystallization accounts for solvent-containing crystals', () => {
  const result = calculateCrystallizationYieldMotherLiquor({ ...example, crystalSoluteMassFraction: 0.8 })
  assert.ok(Math.abs(result.crystalMass - 200) < 1e-12)
  assert.ok(Math.abs(result.crystalSoluteMass - 160) < 1e-12)
  assert.ok(Math.abs(result.crystalSolventMass - 40) < 1e-12)
  assert.ok(Math.abs(result.motherLiquorTotalMass - 700) < 1e-12)
})

test('crystallization identifies an undersaturated solution and validates inputs', () => {
  const unsaturated = calculateCrystallizationYieldMotherLiquor({ ...example, feedSoluteMassFraction: 0.1, evaporatedSolventMass: 0 })
  assert.equal(unsaturated.phaseState, 'undersaturated')
  assert.equal(unsaturated.crystalMass, 0)
  assert.throws(
    () => calculateCrystallizationYieldMotherLiquor({ ...example, evaporatedSolventMass: 700 }),
    (error) => error instanceof CrystallizationYieldMotherLiquorCalculationError && error.code === 'evaporationRemovesAllSolvent',
  )
})
