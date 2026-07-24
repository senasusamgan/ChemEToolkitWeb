import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RelativeVolatilityBinaryVLECalculationError,
  calculateRelativeVolatilityBinaryVLE,
} from '../../src/features/mass-transfer/relative-volatility-binary-vle/engine.ts'

test('converts and inverts binary equilibrium compositions', () => {
  const forward =
    calculateRelativeVolatilityBinaryVLE({
      mode: 'liquidToVapor',
      relativeVolatility: 2.5,
      specifiedMoleFraction: 0.4,
    })

  assert.ok(
    Math.abs(
      forward.vaporMoleFraction - 0.625,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      forward.vaporEnrichmentFactor - 1.5625,
    ) < 1e-12,
  )

  const inverse =
    calculateRelativeVolatilityBinaryVLE({
      mode: 'vaporToLiquid',
      relativeVolatility: 2.5,
      specifiedMoleFraction: 0.625,
    })

  assert.ok(
    Math.abs(
      inverse.liquidMoleFraction - 0.4,
    ) < 1e-12,
  )
})

test('handles pure-component boundary', () => {
  const result =
    calculateRelativeVolatilityBinaryVLE({
      mode: 'liquidToVapor',
      relativeVolatility: 2.5,
      specifiedMoleFraction: 0,
    })

  assert.equal(result.vaporMoleFraction, 0)
  assert.equal(
    result.vaporEnrichmentFactor,
    2.5,
  )
})

test('rejects invalid volatility and composition', () => {
  assert.throws(
    () =>
      calculateRelativeVolatilityBinaryVLE({
        mode: 'liquidToVapor',
        relativeVolatility: 1,
        specifiedMoleFraction: 0.4,
      }),
    (error: unknown) =>
      error instanceof
        RelativeVolatilityBinaryVLECalculationError &&
      error.code ===
        'relativeVolatilityNotGreaterThanOne',
  )

  assert.throws(
    () =>
      calculateRelativeVolatilityBinaryVLE({
        mode: 'liquidToVapor',
        relativeVolatility: 2,
        specifiedMoleFraction: 1.1,
      }),
    (error: unknown) =>
      error instanceof
        RelativeVolatilityBinaryVLECalculationError &&
      error.code === 'moleFractionOutOfRange',
  )
})
