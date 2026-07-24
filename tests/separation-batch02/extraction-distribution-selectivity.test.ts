import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ExtractionDistributionSelectivityCalculationError,
  calculateExtractionDistributionSelectivity,
} from '../../src/features/separation-processes/extraction-distribution-selectivity/engine.ts'

test('calculates distribution coefficients and selectivity', () => {
  const result = calculateExtractionDistributionSelectivity({
    raffinateSoluteAConcentration: 0.02,
    extractSoluteAConcentration: 0.10,
    raffinateSoluteBConcentration: 0.04,
    extractSoluteBConcentration: 0.08,
  })
  assert.equal(result.distributionCoefficientA, 5)
  assert.equal(result.distributionCoefficientB, 2)
  assert.equal(result.selectivityAOverB, 2.5)
})

test('reports neutral selectivity', () => {
  const result = calculateExtractionDistributionSelectivity({
    raffinateSoluteAConcentration: 0.02,
    extractSoluteAConcentration: 0.04,
    raffinateSoluteBConcentration: 0.05,
    extractSoluteBConcentration: 0.10,
  })
  assert.equal(result.selectivityAOverB, 1)
  assert.match(result.separationPreference, /no equilibrium selectivity/)
})

test('rejects zero equilibrium concentration', () => {
  assert.throws(
    () => calculateExtractionDistributionSelectivity({
      raffinateSoluteAConcentration: 0,
      extractSoluteAConcentration: 0.1,
      raffinateSoluteBConcentration: 0.04,
      extractSoluteBConcentration: 0.08,
    }),
    (error: unknown) =>
      error instanceof ExtractionDistributionSelectivityCalculationError &&
      error.code === 'nonPositiveConcentration',
  )
})
