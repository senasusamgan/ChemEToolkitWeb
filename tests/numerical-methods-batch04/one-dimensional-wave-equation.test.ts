import assert from 'node:assert/strict'
import test from 'node:test'
import {
  OneDimensionalWaveEquationCalculationError,
  calculateOneDimensionalWaveEquation,
} from '../../src/features/numerical-methods/one-dimensional-wave-equation/engine.ts'

test('returns near-zero center displacement after a quarter period', () => {
  const result = calculateOneDimensionalWaveEquation({
    waveSpeed: 2,
    domainLength: 1,
    initialAmplitude: 1,
    finalTime: 0.25,
    spatialNodes: 101,
    timeStep: 0.0025,
  })
  assert.ok(Math.abs(result.centerDisplacement) < 0.02)
  assert.ok(result.courantNumber <= 1)
})

test('very short time preserves amplitude approximately', () => {
  const result = calculateOneDimensionalWaveEquation({
    waveSpeed: 1,
    domainLength: 1,
    initialAmplitude: 2,
    finalTime: 0.001,
    spatialNodes: 101,
    timeStep: 0.001,
  })
  assert.ok(result.maximumAbsoluteDisplacement > 1.99)
  assert.ok(result.maximumAbsoluteDisplacement <= 2.001)
})

test('rejects an unstable Courant number', () => {
  assert.throws(
    () => calculateOneDimensionalWaveEquation({
      waveSpeed: 10,
      domainLength: 1,
      initialAmplitude: 1,
      finalTime: 1,
      spatialNodes: 101,
      timeStep: 0.1,
    }),
    (error: unknown) =>
      error instanceof OneDimensionalWaveEquationCalculationError &&
      error.code === 'unstableCourantNumber',
  )
})
