import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ConstantPressureFiltrationCalculationError,
  calculateConstantPressureFiltration,
} from '../../src/features/mass-transfer/constant-pressure-filtration/engine.ts'

const example = {
  filtrateViscosity: 0.001,
  pressureDrop: 200_000,
  filterArea: 0.5,
  specificCakeResistance: 5e10,
  slurrySolidsPerFiltrateVolume: 20,
  filterMediumResistance: 1e10,
  targetFiltrateVolume: 0.2,
}

test('constant-pressure filtration reproduces the verified reference case', () => {
  const result = calculateConstantPressureFiltration(example)
  assert.ok(Math.abs(result.filtrationTime - 420) < 1e-10)
  assert.ok(Math.abs(result.depositedCakeMass - 4) < 1e-12)
  assert.ok(Math.abs(result.finalCakeResistance - 4e11) < 1e-2)
  assert.ok(Math.abs(result.initialFiltrateFlowRate - 0.01) < 1e-14)
  assert.ok(Math.abs(result.finalFiltrateFlowRate - 0.00024390243902439024) < 1e-16)
  assert.ok(Math.abs(result.cakeResistanceFraction - 0.975609756097561) < 1e-14)
})

test('doubling filtration pressure halves filtration time', () => {
  const base = calculateConstantPressureFiltration(example)
  const doubled = calculateConstantPressureFiltration({ ...example, pressureDrop: 400_000 })
  assert.ok(Math.abs(doubled.filtrationTime - base.filtrationTime / 2) < 1e-12)
})

test('filtration validates physical inputs', () => {
  assert.throws(
    () => calculateConstantPressureFiltration({ ...example, filterArea: 0 }),
    (error) => error instanceof ConstantPressureFiltrationCalculationError && error.code === 'nonPositiveProperty',
  )
})
