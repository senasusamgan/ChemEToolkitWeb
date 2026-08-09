import assert from 'node:assert/strict'
import test from 'node:test'

import {
  VortexSheddingFlowMeterError,
  calculateVortexSheddingFlowMeter,
  createVortexSheddingFlowMeterCsv,
} from '../../src/features/fluid-mechanics/vortex-shedding-flow-meter/engine.ts'

const CALCULATOR_ID =
  'vortexSheddingFlowMeter'

const input = {
  pipeDiameter:
    0.10,

  bluffBodyWidth:
    0.02,

  sheddingFrequency:
    20,

  strouhalNumber:
    0.20,

  fluidDensity:
    998,

  dynamicViscosity:
    0.001,
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
  'calculates vortex-meter velocity and volumetric flow',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'vortexSheddingFlowMeter',
    )

    const result =
      calculateVortexSheddingFlowMeter(
        input,
      )

    closeTo(
      result.fluidVelocity,
      2,
      1e-14,
    )

    closeTo(
      result.pipeCrossSectionalArea,
      Math.PI *
        0.1 *
        0.1 /
        4,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRate,
      Math.PI *
        0.1 *
        0.1 /
        4 *
        2,
      1e-15,
    )

    closeTo(
      result.massFlowRate,
      result.volumetricFlowRate *
        998,
      1e-12,
    )
  },
)

test(
  'closes the Strouhal relation',
  () => {
    const result =
      calculateVortexSheddingFlowMeter(
        input,
      )

    closeTo(
      result.recoveredStrouhalNumber,
      input.strouhalNumber,
      1e-14,
    )

    closeTo(
      result.strouhalResidual,
      0,
      1e-14,
    )
  },
)

test(
  'calculates vortex period and spacing',
  () => {
    const result =
      calculateVortexSheddingFlowMeter(
        input,
      )

    closeTo(
      result.vortexSheddingPeriod,
      0.05,
      1e-14,
    )

    closeTo(
      result.vortexSpacing,
      0.1,
      1e-14,
    )

    closeTo(
      result.vortexSpacing,
      input.bluffBodyWidth /
        input.strouhalNumber,
      1e-14,
    )
  },
)

test(
  'reports turbulent Reynolds number',
  () => {
    const result =
      calculateVortexSheddingFlowMeter(
        input,
      )

    closeTo(
      result.reynoldsNumber,
      199600,
      1e-8,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'doubling shedding frequency doubles velocity and flow',
  () => {
    const base =
      calculateVortexSheddingFlowMeter(
        input,
      )

    const doubled =
      calculateVortexSheddingFlowMeter({
        ...input,

        sheddingFrequency:
          input.sheddingFrequency *
          2,
      })

    closeTo(
      doubled.fluidVelocity /
      base.fluidVelocity,
      2,
      1e-12,
    )

    closeTo(
      doubled.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'doubling Strouhal number halves velocity and flow',
  () => {
    const base =
      calculateVortexSheddingFlowMeter(
        input,
      )

    const doubledStrouhal =
      calculateVortexSheddingFlowMeter({
        ...input,

        strouhalNumber:
          input.strouhalNumber *
          2,
      })

    closeTo(
      doubledStrouhal.fluidVelocity /
      base.fluidVelocity,
      0.5,
      1e-12,
    )

    closeTo(
      doubledStrouhal.volumetricFlowRate /
      base.volumetricFlowRate,
      0.5,
      1e-12,
    )
  },
)

test(
  'doubling pipe diameter quadruples flow at unchanged vortex velocity',
  () => {
    const base =
      calculateVortexSheddingFlowMeter(
        input,
      )

    const largerPipe =
      calculateVortexSheddingFlowMeter({
        ...input,

        pipeDiameter:
          input.pipeDiameter *
          2,
      })

    closeTo(
      largerPipe.fluidVelocity,
      base.fluidVelocity,
      1e-12,
    )

    closeTo(
      largerPipe.volumetricFlowRate /
      base.volumetricFlowRate,
      4,
      1e-12,
    )
  },
)

test(
  'rejects bluff body wider than the pipe',
  () => {
    assert.throws(
      () =>
        calculateVortexSheddingFlowMeter({
          ...input,

          bluffBodyWidth:
            input.pipeDiameter,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          VortexSheddingFlowMeterError &&
        error.code ===
          'INVALID_GEOMETRY',
    )
  },
)

test(
  'rejects zero shedding frequency',
  () => {
    assert.throws(
      () =>
        calculateVortexSheddingFlowMeter({
          ...input,

          sheddingFrequency:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          VortexSheddingFlowMeterError &&
        error.code ===
          'INVALID_SHEDDING_FREQUENCY',
    )
  },
)

test(
  'exports vortex-meter results as CSV',
  () => {
    const result =
      calculateVortexSheddingFlowMeter(
        input,
      )

    const csv =
      createVortexSheddingFlowMeterCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Fluid velocity/,
    )

    assert.match(
      csv,
      /Vortex shedding period/,
    )

    assert.match(
      csv,
      /Recovered Strouhal number/,
    )
  },
)
