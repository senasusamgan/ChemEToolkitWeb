import assert from 'node:assert/strict'
import test from 'node:test'
import { Batch07Error, calculatePortfolio } from '../../src/features/process-safety-economics/batch07/engine.ts'

const example = {
  project1RiskReduction: 0.5,
  project1Cost: 20,
  project1UrgencyRating: 3,
  project2RiskReduction: 0.3,
  project2Cost: 8,
  project2UrgencyRating: 5,
  project3RiskReduction: 0.1,
  project3Cost: 10,
  project3UrgencyRating: 1,
}

test('calculates benefit-cost and priority scores', () => {
  const result = calculatePortfolio(example)
  assert.ok(Math.abs(result.project1BenefitCostRatio - 0.025) < 1e-15)
  assert.ok(Math.abs(result.project1Score - 0.075) < 1e-15)
  assert.ok(Math.abs(result.project2Score - 0.1875) < 1e-15)
})

test('ranks highest-scoring project first', () => {
  const result = calculatePortfolio(example)
  assert.equal(result.highestPriorityProject, 'Project 2')
  assert.deepEqual(result.rankedProjectNames, ['Project 2', 'Project 1', 'Project 3'])
})

test('rejects urgency above five', () => {
  assert.throws(
    () => calculatePortfolio({ ...example, project3UrgencyRating: 6 }),
    (error: unknown) => error instanceof Batch07Error &&
      error.code === 'invalidPortfolioInputs',
  )
})
