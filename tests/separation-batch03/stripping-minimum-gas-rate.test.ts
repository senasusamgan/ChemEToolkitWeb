import assert from 'node:assert/strict'
import test from 'node:test'
import {
  StrippingMinimumGasRateCalculationError,
  calculateStrippingMinimumGasRate,
} from '../../src/features/separation-processes/stripping-minimum-gas-rate/engine.ts'

test('calculates minimum stripping gas rate', () => {
  const result = calculateStrippingMinimumGasRate({
    liquidMolarFlowRate: 100,
    inletLiquidSoluteRatio: 0.08,
    outletLiquidSoluteRatio: 0.01,
    equilibriumSlope: 1.5,
    inletGasSoluteRatio: 0,
  })
  assert.ok(Math.abs(result.soluteRemovedRate - 7) < 1e-12)
  assert.ok(Math.abs(result.minimumGasMolarFlowRate - 58.333333333333336) < 1e-10)
})

test('solute in entering gas increases minimum gas flow', () => {
  const clean = calculateStrippingMinimumGasRate({
    liquidMolarFlowRate: 100,
    inletLiquidSoluteRatio: 0.08,
    outletLiquidSoluteRatio: 0.01,
    equilibriumSlope: 1.5,
    inletGasSoluteRatio: 0,
  })
  const contaminated = calculateStrippingMinimumGasRate({
    liquidMolarFlowRate: 100,
    inletLiquidSoluteRatio: 0.08,
    outletLiquidSoluteRatio: 0.01,
    equilibriumSlope: 1.5,
    inletGasSoluteRatio: 0.02,
  })
  assert.ok(contaminated.minimumGasMolarFlowRate > clean.minimumGasMolarFlowRate)
})

test('rejects insufficient gas-phase driving force', () => {
  assert.throws(
    () => calculateStrippingMinimumGasRate({
      liquidMolarFlowRate: 100,
      inletLiquidSoluteRatio: 0.08,
      outletLiquidSoluteRatio: 0.01,
      equilibriumSlope: 1,
      inletGasSoluteRatio: 0.09,
    }),
    (error: unknown) =>
      error instanceof StrippingMinimumGasRateCalculationError &&
      error.code === 'insufficientDrivingForce',
  )
})
