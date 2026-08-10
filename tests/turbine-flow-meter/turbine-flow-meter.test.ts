import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TurbineFlowMeterError,
  calculateTurbineFlowMeter,
  createTurbineFlowMeterCsv,
} from '../../src/features/fluid-mechanics/turbine-flow-meter/engine.ts'

const CALCULATOR_ID =
  'turbineFlowMeter'

const input = {
  pipeDiameter:
    0.08,

  pulseFrequency:
    250,

  meterKFactor:
    50000,

  calibrationFactor:
    1,

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
  'calculates flow from pulse frequency and K-factor',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'turbineFlowMeter',
    )

    const result =
      calculateTurbineFlowMeter(
        input,
      )

    closeTo(
      result.rawVolumetricFlowRate,
      0.005,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRate,
      0.005,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      18,
      1e-12,
    )

    closeTo(
      result.massFlowRate,
      4.99,
      1e-12,
    )
  },
)

test(
  'calculates pulse timing metrics',
  () => {
    const result =
      calculateTurbineFlowMeter(
        input,
      )

    closeTo(
      result.pulsePeriod,
      0.004,
      1e-15,
    )

    closeTo(
      result.pulsesPerMinute,
      15000,
      1e-9,
    )

    closeTo(
      result.pulsesPerHour,
      900000,
      1e-6,
    )
  },
)

test(
  'closes the K-factor pulse-frequency relation',
  () => {
    const result =
      calculateTurbineFlowMeter(
        input,
      )

    closeTo(
      result.reconstructedPulseFrequency,
      input.pulseFrequency,
      1e-12,
    )

    closeTo(
      result.frequencyClosureResidual,
      0,
      1e-12,
    )
  },
)

test(
  'calculates pipe velocity and Reynolds number consistently',
  () => {
    const result =
      calculateTurbineFlowMeter(
        input,
      )

    const expectedArea =
      Math.PI *
      input.pipeDiameter *
      input.pipeDiameter /
      4

    const expectedVelocity =
      result.volumetricFlowRate /
      expectedArea

    const expectedReynolds =
      (
        input.fluidDensity *
        expectedVelocity *
        input.pipeDiameter
      ) /
      input.dynamicViscosity

    closeTo(
      result.pipeCrossSectionalArea,
      expectedArea,
      1e-15,
    )

    closeTo(
      result.fluidVelocity,
      expectedVelocity,
      1e-12,
    )

    closeTo(
      result.reynoldsNumber,
      expectedReynolds,
      1e-8,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'doubling pulse frequency doubles flow',
  () => {
    const base =
      calculateTurbineFlowMeter(
        input,
      )

    const doubled =
      calculateTurbineFlowMeter({
        ...input,

        pulseFrequency:
          input.pulseFrequency *
          2,
      })

    closeTo(
      doubled.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'doubling K-factor halves indicated flow',
  () => {
    const base =
      calculateTurbineFlowMeter(
        input,
      )

    const largerK =
      calculateTurbineFlowMeter({
        ...input,

        meterKFactor:
          input.meterKFactor *
          2,
      })

    closeTo(
      largerK.volumetricFlowRate /
      base.volumetricFlowRate,
      0.5,
      1e-12,
    )
  },
)

test(
  'calibration factor scales corrected flow linearly',
  () => {
    const base =
      calculateTurbineFlowMeter(
        input,
      )

    const corrected =
      calculateTurbineFlowMeter({
        ...input,

        calibrationFactor:
          1.05,
      })

    closeTo(
      corrected.volumetricFlowRate /
      base.volumetricFlowRate,
      1.05,
      1e-12,
    )
  },
)

test(
  'rejects zero pulse frequency',
  () => {
    assert.throws(
      () =>
        calculateTurbineFlowMeter({
          ...input,

          pulseFrequency:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TurbineFlowMeterError &&
        error.code ===
          'INVALID_PULSE_FREQUENCY',
    )
  },
)

test(
  'rejects invalid meter K-factor',
  () => {
    assert.throws(
      () =>
        calculateTurbineFlowMeter({
          ...input,

          meterKFactor:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TurbineFlowMeterError &&
        error.code ===
          'INVALID_K_FACTOR',
    )
  },
)

test(
  'exports turbine-meter results as CSV',
  () => {
    const result =
      calculateTurbineFlowMeter(
        input,
      )

    const csv =
      createTurbineFlowMeterCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Meter K-factor/,
    )

    assert.match(
      csv,
      /Reconstructed pulse frequency/,
    )

    assert.match(
      csv,
      /Frequency closure residual/,
    )
  },
)
