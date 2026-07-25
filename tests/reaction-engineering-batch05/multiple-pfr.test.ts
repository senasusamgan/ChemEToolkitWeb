import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateMultipleReactionsPFR,
} from '../../src/features/reaction-engineering/batch05/engine.ts'

const example = {
  inletConcentrationA: 1000,
  volumetricFlowRate: 0.01,
  firstReactionRateConstant: 0.03,
  secondReactionRateConstant: 0.01,
  spaceTime: 50,
}

test('conserves concentration across A, B and C', () => {
  const result =
    calculateMultipleReactionsPFR(
      example,
    )

  const total =
    result.outletConcentrationA +
    result.outletConcentrationIntermediate +
    result.outletConcentrationFinalProduct

  assert.ok(
    Math.abs(
      total -
      1000,
    ) < 1e-10,
  )
})

test('calculates positive optimum time for intermediate', () => {
  const result =
    calculateMultipleReactionsPFR(
      example,
    )

  assert.ok(
    result.optimumSpaceTimeForIntermediate >
    0,
  )

  assert.ok(
    result.maximumIntermediateConcentration >=
    result.outletConcentrationIntermediate,
  )
})

test('rejects zero space time', () => {
  assert.throws(
    () =>
      calculateMultipleReactionsPFR({
        ...example,
        spaceTime: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch05CalculationError &&
      error.code ===
        'invalidMultiplePFRInputs',
  )
})
