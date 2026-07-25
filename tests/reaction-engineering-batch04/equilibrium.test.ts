import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateEquilibriumConversion,
} from '../../src/features/reaction-engineering/batch04/engine.ts'

test('solves the symmetric equilibrium case', () => {
  const result = calculateEquilibriumConversion({
    initialConcentrationA: 1,
    initialConcentrationB: 1,
    equilibriumConstant: 4,
  })
  const expected = (9 - Math.sqrt(17)) / 8
  assert.ok(Math.abs(result.equilibriumExtent - expected) < 1e-12)
  assert.ok(result.equilibriumResidual < 1e-10)
})

test('conversion respects the limiting reactant', () => {
  const result = calculateEquilibriumConversion({
    initialConcentrationA: 1,
    initialConcentrationB: 2,
    equilibriumConstant: 2,
  })
  assert.equal(result.limitingReactant, 'Reactant A')
  assert.ok(result.conversionA > result.conversionB)
})

test('rejects zero equilibrium constant', () => {
  assert.throws(
    () => calculateEquilibriumConversion({
      initialConcentrationA: 1,
      initialConcentrationB: 1,
      equilibriumConstant: 0,
    }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch04CalculationError &&
      error.code === 'invalidEquilibriumInputs',
  )
})
