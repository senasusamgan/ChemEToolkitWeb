import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SingleStageGasAbsorptionCalculationError,
  calculateSingleStageGasAbsorption,
} from '../../src/features/separation-processes/single-stage-gas-absorption/engine.ts'

test('solves one ideal gas absorption stage', () => {
  const result = calculateSingleStageGasAbsorption({
    gasCarrierMolarFlowRate: 100,
    liquidCarrierMolarFlowRate: 150,
    inletGasSoluteRatio: 0.08,
    inletLiquidSoluteRatio: 0.005,
    equilibriumSlope: 1.2,
  })
  assert.ok(result.outletGasSoluteRatio < 0.08)
  assert.ok(result.outletLiquidSoluteRatio > 0.005)
  assert.ok(result.soluteAbsorbedRate > 0)
  assert.ok(Math.abs(result.soluteBalanceResidual) < 1e-12)
})

test('more solvent increases gas removal', () => {
  const low = calculateSingleStageGasAbsorption({
    gasCarrierMolarFlowRate: 100,
    liquidCarrierMolarFlowRate: 80,
    inletGasSoluteRatio: 0.08,
    inletLiquidSoluteRatio: 0.005,
    equilibriumSlope: 1.2,
  })
  const high = calculateSingleStageGasAbsorption({
    gasCarrierMolarFlowRate: 100,
    liquidCarrierMolarFlowRate: 200,
    inletGasSoluteRatio: 0.08,
    inletLiquidSoluteRatio: 0.005,
    equilibriumSlope: 1.2,
  })
  assert.ok(high.gasSoluteRemovalFraction > low.gasSoluteRemovalFraction)
})

test('rejects no absorption driving force', () => {
  assert.throws(
    () => calculateSingleStageGasAbsorption({
      gasCarrierMolarFlowRate: 100,
      liquidCarrierMolarFlowRate: 150,
      inletGasSoluteRatio: 0.01,
      inletLiquidSoluteRatio: 0.02,
      equilibriumSlope: 1,
    }),
    (error: unknown) =>
      error instanceof SingleStageGasAbsorptionCalculationError &&
      error.code === 'noAbsorptionDrivingForce',
  )
})
