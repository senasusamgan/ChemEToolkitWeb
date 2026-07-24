import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BatchSettlingAreaEstimateCalculationError,
  calculateBatchSettlingAreaEstimate,
} from '../../src/features/separation-processes/batch-settling-area-estimate/engine.ts'

test('calculates hydraulic and solids-flux areas', () => {
  const result = calculateBatchSettlingAreaEstimate({
    feedVolumetricFlowRate: 50,
    feedSolidsConcentration: 20,
    underflowSolidsConcentration: 100,
    zoneSettlingVelocity: 1.5,
    designFactor: 1.25,
  })

  assert.ok(Math.abs(result.hydraulicArea - 33.333333333333336) < 1e-12)
  assert.ok(Math.abs(result.solidsFluxArea - 8.333333333333334) < 1e-12)
  assert.ok(Math.abs(result.designArea - 41.66666666666667) < 1e-12)
})

test('uses the controlling area', () => {
  const result = calculateBatchSettlingAreaEstimate({
    feedVolumetricFlowRate: 10,
    feedSolidsConcentration: 80,
    underflowSolidsConcentration: 100,
    zoneSettlingVelocity: 1,
    designFactor: 1,
  })
  assert.equal(result.designArea, 40)
})

test('rejects invalid concentration ordering', () => {
  assert.throws(
    () => calculateBatchSettlingAreaEstimate({
      feedVolumetricFlowRate: 10,
      feedSolidsConcentration: 100,
      underflowSolidsConcentration: 80,
      zoneSettlingVelocity: 1,
      designFactor: 1,
    }),
    (error: unknown) =>
      error instanceof BatchSettlingAreaEstimateCalculationError &&
      error.code === 'underflowNotConcentrated',
  )
})
