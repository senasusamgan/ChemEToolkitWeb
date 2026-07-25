import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateDeadVolumeEstimator,
} from '../../src/features/reaction-engineering/batch03/engine.ts'

const example = {
  nominalReactorVolume: 10,
  volumetricFlowRate: 0.1,
  measuredMeanResidenceTime: 85,
}

test('calculates active and dead volume', () => {
  const result =
    calculateDeadVolumeEstimator(
      example,
    )

  assert.equal(
    result.activeReactorVolume,
    8.5,
  )

  assert.equal(
    result.estimatedDeadVolume,
    1.5,
  )
})

test('calculates hydraulic utilization', () => {
  const result =
    calculateDeadVolumeEstimator(
      example,
    )

  assert.equal(
    result.deadVolumeFraction,
    0.15,
  )

  assert.equal(
    result.hydraulicUtilizationPercent,
    85,
  )
})

test('rejects active volume above nominal volume', () => {
  assert.throws(
    () =>
      calculateDeadVolumeEstimator({
        ...example,
        measuredMeanResidenceTime: 110,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch03CalculationError &&
      error.code ===
        'inconsistentDeadVolumeInputs',
  )
})
