import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateInternalRateOfReturnAnalysis,
} from '../../src/features/process-safety-economics/batch02/engine.ts'

test('solves a bracketed IRR root', () => {
  const result = calculateInternalRateOfReturnAnalysis({
    initialInvestment: 5_000_000,
    annualNetCashFlow: 950_000,
    terminalValue: 500_000,
    projectLifeYears: 10,
    minimumSearchRate: -0.5,
    maximumSearchRate: 1,
  })
  assert.ok(Math.abs(result.netPresentValueAtIRR) < 1e-6)
  assert.ok(result.internalRateOfReturn > 0)
})

test('reports annual cash-flow ratio', () => {
  const result = calculateInternalRateOfReturnAnalysis({
    initialInvestment: 1000,
    annualNetCashFlow: 300,
    terminalValue: 0,
    projectLifeYears: 5,
    minimumSearchRate: -0.5,
    maximumSearchRate: 1,
  })
  assert.equal(result.annualCashFlowToInvestmentRatio, 0.3)
})

test('rejects an unbracketed root', () => {
  assert.throws(
    () => calculateInternalRateOfReturnAnalysis({
      initialInvestment: 1_000_000,
      annualNetCashFlow: 1,
      terminalValue: 0,
      projectLifeYears: 1,
      minimumSearchRate: 0,
      maximumSearchRate: 1,
    }),
    (error: unknown) =>
      error instanceof ProcessSafetyEconomicsBatch02CalculationError &&
      error.code === 'rootNotBracketed',
  )
})
