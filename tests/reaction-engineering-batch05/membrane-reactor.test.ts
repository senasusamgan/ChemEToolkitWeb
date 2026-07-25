import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateMembraneReactor,
} from '../../src/features/reaction-engineering/batch05/engine.ts'

const example = {
  inletMolarFlowRateA: 10,
  volumetricFlowRate: 1,
  forwardRateConstant: 0.4,
  equilibriumConstant: 2,
  membraneRemovalRateConstant: 0.25,
  reactorVolume: 5,
}

test('conserves A-derived material across outlet and permeate', () => {
  const result =
    calculateMembraneReactor(
      example,
    )

  const total =
    result.outletMolarFlowRateA +
    result.outletMolarFlowRateB +
    result.permeatedMolarFlowRateB

  assert.ok(
    Math.abs(
      total -
      10,
    ) < 1e-8,
  )
})

test('product removal produces positive conversion and permeate', () => {
  const result =
    calculateMembraneReactor(
      example,
    )

  assert.ok(
    result.conversionA > 0,
  )

  assert.ok(
    result.permeatedMolarFlowRateB >
    0,
  )

  assert.equal(
    result.integrationSteps,
    4000,
  )
})

test('rejects zero membrane-removal constant', () => {
  assert.throws(
    () =>
      calculateMembraneReactor({
        ...example,
        membraneRemovalRateConstant: 0,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch05CalculationError &&
      error.code ===
        'invalidMembraneInputs',
  )
})
