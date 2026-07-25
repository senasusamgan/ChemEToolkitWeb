import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateCatalystRegenerationCycle,
} from '../../src/features/reaction-engineering/batch02/engine.ts'

const example = {
  activityBeforeRegeneration: 0.55,
  regenerationRecoveryFraction: 0.8,
  irreversibleLossFractionPerCycle: 0.03,
  serviceTimePerCycle: 100,
  regenerationTimePerCycle: 12,
}

test('calculates recovered and regenerated activity', () => {
  const result =
    calculateCatalystRegenerationCycle(
      example,
    )

  assert.ok(
    Math.abs(
      result.recoveredActivity -
      0.36,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.regeneratedActivity -
      0.91,
    ) < 1e-15,
  )
})

test('calculates next-cycle activity and uptime', () => {
  const result =
    calculateCatalystRegenerationCycle(
      example,
    )

  assert.ok(
    Math.abs(
      result.nextCycleStartingActivity -
      0.8827,
    ) < 1e-15,
  )

  assert.ok(
    Math.abs(
      result.cycleUptimeFraction -
      100 / 112,
    ) < 1e-15,
  )
})

test('rejects irreversible loss equal to one', () => {
  assert.throws(
    () =>
      calculateCatalystRegenerationCycle({
        ...example,
        irreversibleLossFractionPerCycle: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch02CalculationError &&
      error.code ===
        'invalidRegenerationInputs',
  )
})
