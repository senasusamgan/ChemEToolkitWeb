import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SingleStageLiquidLiquidExtractionCalculationError,
  calculateSingleStageLiquidLiquidExtraction,
} from '../../src/features/mass-transfer/single-stage-liquid-liquid-extraction/engine.ts'

test('solves one equilibrium extraction stage', () => {
  const result =
    calculateSingleStageLiquidLiquidExtraction({
      raffinateCarrierFlowRate: 100,
      solventCarrierFlowRate: 50,
      feedSoluteRatio: 0.2,
      enteringSolventSoluteRatio: 0,
      distributionCoefficient: 3,
    })

  assert.ok(
    Math.abs(
      result.raffinateOutletSoluteRatio - 0.08,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.extractOutletSoluteRatio - 0.24,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(result.transferRateMagnitude - 12) <
      1e-12,
  )
  assert.ok(
    Math.abs(
      result.raffinateRemovalFraction - 0.6,
    ) < 1e-12,
  )
})

test('returns zero transfer at equilibrium', () => {
  const result =
    calculateSingleStageLiquidLiquidExtraction({
      raffinateCarrierFlowRate: 100,
      solventCarrierFlowRate: 50,
      feedSoluteRatio: 0.2,
      enteringSolventSoluteRatio: 0.6,
      distributionCoefficient: 3,
    })

  assert.ok(
    Math.abs(result.signedTransferRateToExtract) <
      1e-12,
  )
  assert.ok(
    Math.abs(
      result.raffinateOutletSoluteRatio - 0.2,
    ) < 1e-12,
  )
})

test('rejects invalid physical inputs', () => {
  assert.throws(
    () =>
      calculateSingleStageLiquidLiquidExtraction({
        raffinateCarrierFlowRate: 0,
        solventCarrierFlowRate: 50,
        feedSoluteRatio: 0.2,
        enteringSolventSoluteRatio: 0,
        distributionCoefficient: 3,
      }),
    (error: unknown) =>
      error instanceof
        SingleStageLiquidLiquidExtractionCalculationError &&
      error.code === 'nonPositiveProperty',
  )

  assert.throws(
    () =>
      calculateSingleStageLiquidLiquidExtraction({
        raffinateCarrierFlowRate: 100,
        solventCarrierFlowRate: 50,
        feedSoluteRatio: -0.2,
        enteringSolventSoluteRatio: 0,
        distributionCoefficient: 3,
      }),
    (error: unknown) =>
      error instanceof
        SingleStageLiquidLiquidExtractionCalculationError &&
      error.code === 'negativeSoluteRatio',
  )
})
