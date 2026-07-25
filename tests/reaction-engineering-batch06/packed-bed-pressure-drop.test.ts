import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch06CalculationError,
  calculatePackedBedPressureDrop,
} from '../../src/features/reaction-engineering/batch06/engine.ts'

const example = {
  bedLength: 2,
  particleDiameter: 0.005,
  bedVoidFraction: 0.4,
  fluidDensity: 1000,
  fluidViscosity: 0.001,
  superficialVelocity: 0.02,
}

test('sums viscous and inertial Ergun terms', () => {
  const result =
    calculatePackedBedPressureDrop(
      example,
    )

  assert.ok(
    Math.abs(
      result.totalPressureGradient -
      (
        result.viscousPressureGradient +
        result.inertialPressureGradient
      ),
    ) < 1e-12,
  )
})

test('calculates total drop from gradient and length', () => {
  const result =
    calculatePackedBedPressureDrop(
      example,
    )

  assert.ok(
    Math.abs(
      result.totalPressureDrop -
      result.totalPressureGradient *
      2,
    ) < 1e-12,
  )
})

test('rejects void fraction equal to one', () => {
  assert.throws(
    () =>
      calculatePackedBedPressureDrop({
        ...example,
        bedVoidFraction: 1,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch06CalculationError &&
      error.code ===
        'invalidPackedBedPressureDropInputs',
  )
})
