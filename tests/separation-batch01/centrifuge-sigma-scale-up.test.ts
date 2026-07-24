import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CentrifugeSigmaScaleUpCalculationError,
  calculateCentrifugeSigmaScaleUp,
} from '../../src/features/separation-processes/centrifuge-sigma-scale-up/engine.ts'

test('scales throughput by sigma and efficiency ratios', () => {
  const result = calculateCentrifugeSigmaScaleUp({
    laboratoryThroughput: 0.5,
    laboratorySigma: 100,
    industrialSigma: 5000,
    laboratoryEfficiency: 0.9,
    industrialEfficiency: 0.75,
  })
  assert.ok(Math.abs(result.predictedIndustrialThroughput - 20.833333333333336) < 1e-12)
  assert.equal(result.sigmaRatio, 50)
})

test('returns equal throughput for equal effective sigma', () => {
  const result = calculateCentrifugeSigmaScaleUp({
    laboratoryThroughput: 2,
    laboratorySigma: 100,
    industrialSigma: 100,
    laboratoryEfficiency: 0.8,
    industrialEfficiency: 0.8,
  })
  assert.equal(result.predictedIndustrialThroughput, 2)
})

test('rejects invalid efficiency', () => {
  assert.throws(
    () => calculateCentrifugeSigmaScaleUp({
      laboratoryThroughput: 1,
      laboratorySigma: 100,
      industrialSigma: 1000,
      laboratoryEfficiency: 1.2,
      industrialEfficiency: 0.8,
    }),
    (error: unknown) =>
      error instanceof CentrifugeSigmaScaleUpCalculationError &&
      error.code === 'efficiencyOutOfRange',
  )
})
