import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FlowNozzleDifferentialPressureError,
  calculateFlowNozzleDifferentialPressure,
  createFlowNozzleDifferentialPressureCsv,
} from '../../src/features/fluid-mechanics/flow-nozzle-differential-pressure/engine.ts'

const CALCULATOR_ID =
  'flowNozzleDifferentialPressure'

const input = {
  pipeDiameter:
    0.10,

  nozzleDiameter:
    0.05,

  differentialPressure:
    12000,

  fluidDensity:
    998,

  dynamicViscosity:
    0.001,

  dischargeCoefficient:
    0.98,
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
  'calculates flow-nozzle volumetric and mass flow',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'flowNozzleDifferentialPressure',
    )

    const result =
      calculateFlowNozzleDifferentialPressure(
        input,
      )

    closeTo(
      result.betaRatio,
      0.5,
      1e-14,
    )

    closeTo(
      result.nozzleArea,
      0.001963495408493621,
      1e-15,
    )

    closeTo(
      result.idealVolumetricFlowRate,
      0.00994453778082431,
      1e-14,
    )

    closeTo(
      result.volumetricFlowRate,
      0.009745647025207823,
      1e-14,
    )

    closeTo(
      result.massFlowRate,
      9.726155731157407,
      1e-11,
    )
  },
)

test(
  'calculates pipe and nozzle velocities',
  () => {
    const result =
      calculateFlowNozzleDifferentialPressure(
        input,
      )

    closeTo(
      result.pipeVelocity,
      1.24085431815252,
      1e-12,
    )

    closeTo(
      result.nozzleVelocity,
      4.96341727261008,
      1e-12,
    )

    closeTo(
      result.nozzleVelocity /
      result.pipeVelocity,
      4,
      1e-12,
    )
  },
)

test(
  'reports Reynolds number and turbulent flow',
  () => {
    const result =
      calculateFlowNozzleDifferentialPressure(
        input,
      )

    closeTo(
      result.reynoldsNumber,
      123837.26095162149,
      1e-6,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'flow scales with square root of differential pressure',
  () => {
    const base =
      calculateFlowNozzleDifferentialPressure(
        input,
      )

    const increased =
      calculateFlowNozzleDifferentialPressure({
        ...input,

        differentialPressure:
          input.differentialPressure *
          4,
      })

    closeTo(
      increased.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'discharge coefficient scales flow linearly',
  () => {
    const unitCoefficient =
      calculateFlowNozzleDifferentialPressure({
        ...input,

        dischargeCoefficient:
          1,
      })

    const halfCoefficient =
      calculateFlowNozzleDifferentialPressure({
        ...input,

        dischargeCoefficient:
          0.5,
      })

    closeTo(
      halfCoefficient.volumetricFlowRate /
      unitCoefficient.volumetricFlowRate,
      0.5,
      1e-12,
    )
  },
)

test(
  'rejects nozzle diameter equal to pipe diameter',
  () => {
    assert.throws(
      () =>
        calculateFlowNozzleDifferentialPressure({
          ...input,

          nozzleDiameter:
            input.pipeDiameter,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FlowNozzleDifferentialPressureError &&
        error.code ===
          'INVALID_BETA_RATIO',
    )
  },
)

test(
  'rejects negative differential pressure',
  () => {
    assert.throws(
      () =>
        calculateFlowNozzleDifferentialPressure({
          ...input,

          differentialPressure:
            -100,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FlowNozzleDifferentialPressureError &&
        error.code ===
          'INVALID_DIFFERENTIAL_PRESSURE',
    )
  },
)

test(
  'rejects invalid discharge coefficient',
  () => {
    assert.throws(
      () =>
        calculateFlowNozzleDifferentialPressure({
          ...input,

          dischargeCoefficient:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FlowNozzleDifferentialPressureError &&
        error.code ===
          'INVALID_DISCHARGE_COEFFICIENT',
    )
  },
)

test(
  'exports flow-nozzle analysis as CSV',
  () => {
    const result =
      calculateFlowNozzleDifferentialPressure(
        input,
      )

    const csv =
      createFlowNozzleDifferentialPressureCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Beta ratio/,
    )

    assert.match(
      csv,
      /Actual volumetric flow rate/,
    )

    assert.match(
      csv,
      /Nozzle velocity/,
    )
  },
)
