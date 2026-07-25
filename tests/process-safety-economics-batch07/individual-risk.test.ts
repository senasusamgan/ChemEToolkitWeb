import assert from 'node:assert/strict'
import test from 'node:test'
import { Batch07Error, calculateIndividualRisk } from '../../src/features/process-safety-economics/batch07/engine.ts'

const example = {
  scenarioFrequencyPerYear: 0.001,
  fatalityProbabilityGivenExposure: 0.1,
  occupancyFraction: 0.25,
  presenceProbability: 0.5,
}

test('calculates annual individual risk', () => {
  const result = calculateIndividualRisk(example)
  assert.equal(result.combinedExposureProbability, 0.0125)
  assert.ok(Math.abs(result.annualIndividualRisk - 0.0000125) < 1e-15)
  assert.equal(result.annualIndividualRiskPerMillion, 12.5)
})

test('calculates return period', () => {
  const result = calculateIndividualRisk(example)
  assert.ok(Math.abs(result.returnPeriodYears - 80_000) < 1e-8)
})

test('rejects probability above one', () => {
  assert.throws(
    () => calculateIndividualRisk({ ...example, occupancyFraction: 1.2 }),
    (error: unknown) => error instanceof Batch07Error &&
      error.code === 'invalidIndividualRiskInputs',
  )
})
