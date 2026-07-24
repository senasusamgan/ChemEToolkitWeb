import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ConstantPressureFilterSizingCalculationError,
  calculateConstantPressureFilterSizing,
} from '../../src/features/separation-processes/constant-pressure-filter-sizing/engine.ts'

test('calculates Ruth filtration time', () => {
  const result = calculateConstantPressureFilterSizing({
    filtrateViscosity: 0.001,
    specificCakeResistance: 1e11,
    drySolidsPerFiltrateVolume: 50,
    filterArea: 10,
    pressureDrop: 200000,
    filterMediumResistance: 5e9,
    targetFiltrateVolume: 5,
  })
  assert.ok(Math.abs(result.cakeTime - 3125) < 1e-9)
  assert.ok(Math.abs(result.mediumTime - 12.5) < 1e-9)
  assert.ok(Math.abs(result.totalFiltrationTime - 3137.5) < 1e-9)
})

test('accepts zero medium resistance', () => {
  const result = calculateConstantPressureFilterSizing({
    filtrateViscosity: 0.001,
    specificCakeResistance: 1e10,
    drySolidsPerFiltrateVolume: 20,
    filterArea: 5,
    pressureDrop: 100000,
    filterMediumResistance: 0,
    targetFiltrateVolume: 1,
  })
  assert.equal(result.mediumTime, 0)
})

test('rejects negative medium resistance', () => {
  assert.throws(
    () => calculateConstantPressureFilterSizing({
      filtrateViscosity: 0.001,
      specificCakeResistance: 1e10,
      drySolidsPerFiltrateVolume: 20,
      filterArea: 5,
      pressureDrop: 100000,
      filterMediumResistance: -1,
      targetFiltrateVolume: 1,
    }),
    (error: unknown) =>
      error instanceof ConstantPressureFilterSizingCalculationError &&
      error.code === 'negativeMediumResistance',
  )
})
