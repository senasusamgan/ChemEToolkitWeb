import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PitotTubeVelocityFlowError,
  calculatePitotTubeVelocityFlow,
  createPitotTubeVelocityFlowCsv,
} from '../../src/features/fluid-mechanics/pitot-tube-velocity-flow/engine.ts'

const CALCULATOR_ID =
  'pitotTubeVelocityFlow'

const input = {
  pipeDiameter: 0.10,

  differentialPressure: 5000,

  fluidDensity: 998,

  dynamicViscosity: 0.001,

  pitotCoefficient: 0.98,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-9,
): void {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  )
}

test(
  'calculates corrected Pitot velocity and volumetric flow rate',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'pitotTubeVelocityFlow',
    )

    const result =
      calculatePitotTubeVelocityFlow(
        input,
      )

    closeTo(
      result.correctedVelocity,
      3.1021357953813,
      1e-12,
    )

    closeTo(
      result.pipeCrossSectionalArea,
      0.007853981633974483,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRate,
      0.024364117563019556,
      1e-14,
    )

    closeTo(
      result.massFlowRate,
      24.315389327893516,
      1e-11,
    )
  },
)

test(
  'calculates Reynolds number and turbulent regime',
  () => {
    const result =
      calculatePitotTubeVelocityFlow(
        input,
      )

    closeTo(
      result.reynoldsNumber,
      309593.15237905376,
      1e-7,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'unit Pitot coefficient recovers ideal Bernoulli velocity',
  () => {
    const result =
      calculatePitotTubeVelocityFlow({
        ...input,

        pitotCoefficient:
          1,
      })

    closeTo(
      result.correctedVelocity,
      result.idealVelocity,
      1e-14,
    )
  },
)

test(
  'four times differential pressure doubles velocity and flow',
  () => {
    const base =
      calculatePitotTubeVelocityFlow(
        input,
      )

    const increased =
      calculatePitotTubeVelocityFlow({
        ...input,

        differentialPressure:
          input.differentialPressure *
          4,
      })

    closeTo(
      increased.correctedVelocity /
      base.correctedVelocity,
      2,
      1e-12,
    )

    closeTo(
      increased.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'doubling diameter quadruples flow at fixed measured velocity',
  () => {
    const base =
      calculatePitotTubeVelocityFlow(
        input,
      )

    const larger =
      calculatePitotTubeVelocityFlow({
        ...input,

        pipeDiameter:
          input.pipeDiameter *
          2,
      })

    closeTo(
      larger.volumetricFlowRate /
      base.volumetricFlowRate,
      4,
      1e-12,
    )
  },
)

test(
  'Pitot coefficient scales corrected velocity linearly',
  () => {
    const first =
      calculatePitotTubeVelocityFlow({
        ...input,

        pitotCoefficient:
          1,
      })

    const second =
      calculatePitotTubeVelocityFlow({
        ...input,

        pitotCoefficient:
          0.5,
      })

    closeTo(
      second.correctedVelocity /
      first.correctedVelocity,
      0.5,
      1e-12,
    )

    closeTo(
      second.volumetricFlowRate /
      first.volumetricFlowRate,
      0.5,
      1e-12,
    )
  },
)

test(
  'rejects zero differential pressure',
  () => {
    assert.throws(
      () =>
        calculatePitotTubeVelocityFlow({
          ...input,

          differentialPressure:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PitotTubeVelocityFlowError &&
        error.code ===
          'INVALID_DIFFERENTIAL_PRESSURE',
    )
  },
)

test(
  'rejects invalid fluid density',
  () => {
    assert.throws(
      () =>
        calculatePitotTubeVelocityFlow({
          ...input,

          fluidDensity:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PitotTubeVelocityFlowError &&
        error.code ===
          'INVALID_DENSITY',
    )
  },
)

test(
  'exports Pitot calculation as CSV',
  () => {
    const result =
      calculatePitotTubeVelocityFlow(
        input,
      )

    const csv =
      createPitotTubeVelocityFlowCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Corrected velocity/,
    )

    assert.match(
      csv,
      /Volumetric flow rate/,
    )

    assert.match(
      csv,
      /Reynolds number/,
    )
  },
)
