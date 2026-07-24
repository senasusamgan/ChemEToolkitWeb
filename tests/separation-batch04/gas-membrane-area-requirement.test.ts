import assert from 'node:assert/strict'
import test from 'node:test'
import {
  GasMembraneAreaRequirementCalculationError,
  calculateGasMembraneAreaRequirement,
} from '../../src/features/separation-processes/gas-membrane-area-requirement/engine.ts'

test('calculates gas-membrane area from solute flux', () => {
  const result = calculateGasMembraneAreaRequirement({
    feedMolarFlowRate: 100,
    stageCut: 0.25,
    permeateSoluteFraction: 0.8,
    solutePermeance: 3e-9,
    partialPressureDrivingForce: 300000,
  })
  assert.equal(result.permeateMolarFlowRate, 25)
  assert.equal(result.solutePermeateRate, 20)
  assert.ok(Math.abs(result.requiredMembraneArea - 6172.839506172839) < 1e-9)
})

test('higher permeance lowers membrane area', () => {
  const low = calculateGasMembraneAreaRequirement({
    feedMolarFlowRate: 100,
    stageCut: 0.25,
    permeateSoluteFraction: 0.8,
    solutePermeance: 2e-9,
    partialPressureDrivingForce: 300000,
  })
  const high = calculateGasMembraneAreaRequirement({
    feedMolarFlowRate: 100,
    stageCut: 0.25,
    permeateSoluteFraction: 0.8,
    solutePermeance: 4e-9,
    partialPressureDrivingForce: 300000,
  })
  assert.ok(high.requiredMembraneArea < low.requiredMembraneArea)
})

test('rejects stage cut of one', () => {
  assert.throws(
    () => calculateGasMembraneAreaRequirement({
      feedMolarFlowRate: 100,
      stageCut: 1,
      permeateSoluteFraction: 0.8,
      solutePermeance: 3e-9,
      partialPressureDrivingForce: 300000,
    }),
    (error: unknown) =>
      error instanceof GasMembraneAreaRequirementCalculationError &&
      error.code === 'fractionOutOfRange',
  )
})
