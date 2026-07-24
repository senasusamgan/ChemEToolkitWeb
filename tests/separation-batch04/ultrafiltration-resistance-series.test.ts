import assert from 'node:assert/strict'
import test from 'node:test'
import {
  UltrafiltrationResistanceSeriesCalculationError,
  calculateUltrafiltrationResistanceSeries,
} from '../../src/features/separation-processes/ultrafiltration-resistance-series/engine.ts'

test('calculates UF flux from resistance series', () => {
  const result = calculateUltrafiltrationResistanceSeries({
    transmembranePressure: 200000,
    filtrateViscosity: 0.001,
    membraneResistance: 1e12,
    foulingResistance: 5e11,
    cakeResistance: 1.5e12,
    membraneArea: 20,
  })
  assert.equal(result.totalResistance, 3e12)
  assert.ok(Math.abs(result.permeateFlux - 6.666666666666667e-5) < 1e-16)
  assert.ok(Math.abs(result.permeateFluxLitresPerSquareMetreHour - 240) < 1e-10)
})

test('resistance fractions sum to one', () => {
  const result = calculateUltrafiltrationResistanceSeries({
    transmembranePressure: 100000,
    filtrateViscosity: 0.001,
    membraneResistance: 1e12,
    foulingResistance: 1e12,
    cakeResistance: 2e12,
    membraneArea: 5,
  })
  assert.ok(Math.abs(
    result.membraneResistanceFraction +
    result.foulingResistanceFraction +
    result.cakeResistanceFraction -
    1
  ) < 1e-12)
})

test('rejects negative fouling resistance', () => {
  assert.throws(
    () => calculateUltrafiltrationResistanceSeries({
      transmembranePressure: 100000,
      filtrateViscosity: 0.001,
      membraneResistance: 1e12,
      foulingResistance: -1,
      cakeResistance: 1e12,
      membraneArea: 5,
    }),
    (error: unknown) =>
      error instanceof UltrafiltrationResistanceSeriesCalculationError &&
      error.code === 'negativeResistance',
  )
})
