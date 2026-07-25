import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculateLayerOfProtectionAnalysis,
} from '../../src/features/process-safety-economics/batch04/engine.ts'

const example = {
  initiatingEventFrequency: 0.1,
  enablingConditionProbability: 0.5,
  conditionalModifierProbability: 0.2,
  firstIPLProbabilityOfFailure: 0.1,
  secondIPLProbabilityOfFailure: 0.1,
  thirdIPLProbabilityOfFailure: 0.1,
  tolerableEventFrequency: 0.00001,
}

test('calculates mitigated scenario frequency', () => {
  const result =
    calculateLayerOfProtectionAnalysis(
      example,
    )

  assert.ok(
    Math.abs(
      result.unmitigatedScenarioFrequency -
      0.01,
    ) < 1e-15,
  )
  assert.ok(
    Math.abs(
      result.mitigatedScenarioFrequency -
      0.00001,
    ) < 1e-15,
  )
})

test('calculates achieved risk reduction', () => {
  const result =
    calculateLayerOfProtectionAnalysis(
      example,
    )

  assert.ok(
    Math.abs(
      result.achievedRiskReductionFactor -
      1000,
    ) < 1e-9,
  )
  assert.equal(
    result.targetMet,
    true,
  )
})

test('rejects IPL probability above one', () => {
  assert.throws(
    () =>
      calculateLayerOfProtectionAnalysis({
        ...example,
        firstIPLProbabilityOfFailure:
          1.2,
      }),
    (error: unknown) =>
      error instanceof
        ProcessSafetyEconomicsBatch04CalculationError &&
      error.code ===
        'invalidLOPAInputs',
  )
})
