import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateMichaelisMentenReactor,
} from '../../src/features/reaction-engineering/batch05/engine.ts'

const example = {
  substrateVolumetricFlowRate: 0.01,
  inletSubstrateConcentration: 100,
  maximumVolumetricRate: 2,
  michaelisConstant: 20,
  targetConversion: 0.8,
}

test('sizes the enzyme CSTR from outlet rate', () => {
  const result =
    calculateMichaelisMentenReactor(
      example,
    )

  const outlet = 20
  const rate =
    2 *
    outlet /
    (
      20 +
      outlet
    )

  assert.ok(
    Math.abs(
      result.requiredReactorVolume -
      (
        0.01 *
        80 /
        rate
      ),
    ) < 1e-12,
  )
})

test('productivity equals outlet reaction rate', () => {
  const result =
    calculateMichaelisMentenReactor(
      example,
    )

  assert.ok(
    Math.abs(
      result.volumetricProductivity -
      result.outletReactionRate,
    ) < 1e-15,
  )
})

test('rejects conversion equal to one', () => {
  assert.throws(
    () =>
      calculateMichaelisMentenReactor({
        ...example,
        targetConversion: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch05CalculationError &&
      error.code ===
        'invalidMichaelisMentenInputs',
  )
})
