import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateImmobilizedEnzymeReactor,
} from '../../src/features/reaction-engineering/batch04/engine.ts'

const example = {
  sphericalPelletRadius: 0.001,
  effectiveDiffusivity: 1e-9,
  maximumVolumetricRate: 2,
  michaelisConstant: 20,
  bulkSubstrateConcentration: 100,
  totalPelletVolume: 0.1,
}

test('calculates pellet Thiele modulus and effectiveness', () => {
  const result = calculateImmobilizedEnzymeReactor(example)
  assert.ok(result.thieleModulus > 0)
  assert.ok(result.effectivenessFactor > 0)
  assert.ok(result.effectivenessFactor <= 1)
})

test('observed rate equals effectiveness times intrinsic rate', () => {
  const result = calculateImmobilizedEnzymeReactor(example)
  assert.ok(
    Math.abs(
      result.observedVolumetricRate -
      result.effectivenessFactor * result.intrinsicVolumetricRate,
    ) < 1e-15,
  )
  assert.ok(
    Math.abs(
      result.totalObservedMolarRate -
      result.observedVolumetricRate * 0.1,
    ) < 1e-15,
  )
})

test('rejects zero diffusivity', () => {
  assert.throws(
    () => calculateImmobilizedEnzymeReactor({
      ...example,
      effectiveDiffusivity: 0,
    }),
    (error: unknown) =>
      error instanceof ReactionEngineeringBatch04CalculationError &&
      error.code === 'invalidImmobilizedEnzymeInputs',
  )
})
