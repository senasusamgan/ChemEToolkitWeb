import assert from 'node:assert/strict'
import test from 'node:test'
import {
  GillilandStageEstimateCalculationError,
  calculateGillilandStageEstimate,
} from '../../src/features/separation-processes/gilliland-stage-estimate/engine.ts'

test('estimates theoretical and actual stages', () => {
  const result = calculateGillilandStageEstimate({
    minimumStages: 8,
    minimumRefluxRatio: 1.2,
    operatingRefluxRatio: 2,
    overallStageEfficiency: 0.7,
  })
  assert.ok(result.theoreticalStageCount > 8)
  assert.ok(result.actualStageCount > result.theoreticalStageCount)
  assert.ok(result.requiredIntegerActualStages >= result.requiredIntegerTheoreticalStages)
})

test('higher operating reflux reduces theoretical stages', () => {
  const low = calculateGillilandStageEstimate({
    minimumStages: 8,
    minimumRefluxRatio: 1.2,
    operatingRefluxRatio: 1.5,
    overallStageEfficiency: 0.8,
  })
  const high = calculateGillilandStageEstimate({
    minimumStages: 8,
    minimumRefluxRatio: 1.2,
    operatingRefluxRatio: 3,
    overallStageEfficiency: 0.8,
  })
  assert.ok(high.theoreticalStageCount < low.theoreticalStageCount)
})

test('rejects reflux at minimum', () => {
  assert.throws(
    () => calculateGillilandStageEstimate({
      minimumStages: 8,
      minimumRefluxRatio: 1.2,
      operatingRefluxRatio: 1.2,
      overallStageEfficiency: 0.8,
    }),
    (error: unknown) =>
      error instanceof GillilandStageEstimateCalculationError &&
      error.code === 'refluxNotAboveMinimum',
  )
})
