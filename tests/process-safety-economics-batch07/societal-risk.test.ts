import assert from 'node:assert/strict'
import test from 'node:test'
import { Batch07Error, calculateSocietalRisk } from '../../src/features/process-safety-economics/batch07/engine.ts'

const example = {
  scenarioFrequencyPerYear: 0.00001,
  estimatedFatalities: 10,
  criterionCoefficient: 0.001,
  criterionExponent: 1,
}

test('calculates entered F-N criterion', () => {
  const result = calculateSocietalRisk(example)
  assert.equal(result.criterionFrequency, 0.0001)
  assert.ok(Math.abs(result.frequencyToCriterionRatio - 0.1) < 1e-15)
})

test('classifies a case below criterion', () => {
  const result = calculateSocietalRisk(example)
  assert.equal(result.criterionSatisfied, true)
  assert.ok(Math.abs(result.logarithmicMargin - 1) < 1e-15)
})

test('rejects zero fatality count', () => {
  assert.throws(
    () => calculateSocietalRisk({ ...example, estimatedFatalities: 0 }),
    (error: unknown) => error instanceof Batch07Error &&
      error.code === 'invalidSocietalRiskInputs',
  )
})
