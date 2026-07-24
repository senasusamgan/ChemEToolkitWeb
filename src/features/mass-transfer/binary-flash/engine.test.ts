import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BinaryFlashCalculationError,
  calculateBinaryFlash,
} from './engine.ts'

test('solves a two-phase binary flash', () => {
  const result = calculateBinaryFlash({
    feedFlowRate: 100,
    feedLightMoleFraction: 0.5,
    lightComponentKValue: 2,
    heavyComponentKValue: 0.5,
  })

  assert.equal(result.phaseState, 'twoPhase')
  assert.ok(Math.abs(result.vaporFraction - 0.5) < 1e-12)
  assert.ok(
    Math.abs(result.liquidLightMoleFraction - 1 / 3) <
      1e-12,
  )
  assert.ok(
    Math.abs(result.vaporLightMoleFraction - 2 / 3) <
      1e-12,
  )
  assert.ok(Math.abs(result.vaporFlowRate - 50) < 1e-12)
})

test('identifies bubble and dew boundaries', () => {
  const bubble = calculateBinaryFlash({
    feedFlowRate: 1,
    feedLightMoleFraction: 1 / 3,
    lightComponentKValue: 2,
    heavyComponentKValue: 0.5,
  })

  assert.equal(bubble.phaseState, 'bubblePoint')
  assert.equal(bubble.vaporFraction, 0)

  const dew = calculateBinaryFlash({
    feedFlowRate: 1,
    feedLightMoleFraction: 2 / 3,
    lightComponentKValue: 2,
    heavyComponentKValue: 0.5,
  })

  assert.equal(dew.phaseState, 'dewPoint')
  assert.equal(dew.vaporFraction, 1)
})

test('rejects invalid inputs', () => {
  assert.throws(
    () =>
      calculateBinaryFlash({
        feedFlowRate: 0,
        feedLightMoleFraction: 0.5,
        lightComponentKValue: 2,
        heavyComponentKValue: 0.5,
      }),
    (error: unknown) =>
      error instanceof BinaryFlashCalculationError &&
      error.code === 'nonPositiveFeedFlow',
  )

  assert.throws(
    () =>
      calculateBinaryFlash({
        feedFlowRate: 1,
        feedLightMoleFraction: 1.1,
        lightComponentKValue: 2,
        heavyComponentKValue: 0.5,
      }),
    (error: unknown) =>
      error instanceof BinaryFlashCalculationError &&
      error.code === 'feedCompositionOutOfRange',
  )

  assert.throws(
    () =>
      calculateBinaryFlash({
        feedFlowRate: 1,
        feedLightMoleFraction: 0.5,
        lightComponentKValue: 0.5,
        heavyComponentKValue: 2,
      }),
    (error: unknown) =>
      error instanceof BinaryFlashCalculationError &&
      error.code === 'invalidKValueOrdering',
  )
})
