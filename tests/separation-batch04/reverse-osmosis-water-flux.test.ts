import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReverseOsmosisWaterFluxCalculationError,
  calculateReverseOsmosisWaterFlux,
} from '../../src/features/separation-processes/reverse-osmosis-water-flux/engine.ts'

test('calculates RO net driving pressure and flux', () => {
  const result = calculateReverseOsmosisWaterFlux({
    waterPermeability: 1.5,
    appliedPressureDifference: 60,
    feedOsmoticPressure: 25,
    permeateOsmoticPressure: 1,
    membraneArea: 100,
  })
  assert.equal(result.osmoticPressureDifference, 24)
  assert.equal(result.netDrivingPressure, 36)
  assert.equal(result.waterFlux, 54)
  assert.equal(result.permeateFlowRate, 5400)
})

test('larger membrane area increases permeate flow', () => {
  const small = calculateReverseOsmosisWaterFlux({
    waterPermeability: 1,
    appliedPressureDifference: 50,
    feedOsmoticPressure: 20,
    permeateOsmoticPressure: 1,
    membraneArea: 10,
  })
  const large = calculateReverseOsmosisWaterFlux({
    waterPermeability: 1,
    appliedPressureDifference: 50,
    feedOsmoticPressure: 20,
    permeateOsmoticPressure: 1,
    membraneArea: 20,
  })
  assert.equal(large.permeateFlowRate, 2 * small.permeateFlowRate)
})

test('rejects insufficient pressure', () => {
  assert.throws(
    () => calculateReverseOsmosisWaterFlux({
      waterPermeability: 1,
      appliedPressureDifference: 20,
      feedOsmoticPressure: 25,
      permeateOsmoticPressure: 1,
      membraneArea: 10,
    }),
    (error: unknown) =>
      error instanceof ReverseOsmosisWaterFluxCalculationError &&
      error.code === 'insufficientDrivingPressure',
  )
})
