import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PositiveDisplacementFlowMeterError,
  calculatePositiveDisplacementFlowMeter,
  createPositiveDisplacementFlowMeterCsv,
} from '../../src/features/fluid-mechanics/positive-displacement-flow-meter/engine.ts'

const CALCULATOR_ID =
  'positiveDisplacementFlowMeter'

const input = {
  pipeDiameter:
    0.05,

  displacementPerCycle:
    25e-6,

  rotationalSpeedRpm:
    1200,

  volumetricEfficiency:
    0.98,

  fluidDensity:
    850,

  dynamicViscosity:
    0.01,
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
  'calculates positive-displacement meter flow',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'positiveDisplacementFlowMeter',
    )

    const result =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    closeTo(
      result.cycleFrequency,
      20,
      1e-14,
    )

    closeTo(
      result.idealVolumetricFlowRate,
      0.0005,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRate,
      0.00049,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      1.764,
      1e-12,
    )

    closeTo(
      result.massFlowRate,
      0.4165,
      1e-12,
    )
  },
)

test(
  'calculates meter slip from volumetric efficiency',
  () => {
    const result =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    closeTo(
      result.slipVolumetricFlowRate,
      1e-5,
      1e-15,
    )

    closeTo(
      result.slipPercentage,
      2,
      1e-12,
    )
  },
)

test(
  'closes the displacement-per-cycle relation',
  () => {
    const result =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    closeTo(
      result.recoveredDisplacementPerCycle,
      input.displacementPerCycle,
      1e-15,
    )

    closeTo(
      result.displacementClosureResidual,
      0,
      1e-15,
    )
  },
)

test(
  'doubling rotational speed doubles indicated flow',
  () => {
    const base =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    const faster =
      calculatePositiveDisplacementFlowMeter({
        ...input,

        rotationalSpeedRpm:
          input.rotationalSpeedRpm *
          2,
      })

    closeTo(
      faster.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'doubling displacement per cycle doubles indicated flow',
  () => {
    const base =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    const largerMeter =
      calculatePositiveDisplacementFlowMeter({
        ...input,

        displacementPerCycle:
          input.displacementPerCycle *
          2,
      })

    closeTo(
      largerMeter.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'volumetric efficiency scales actual flow linearly',
  () => {
    const perfect =
      calculatePositiveDisplacementFlowMeter({
        ...input,

        volumetricEfficiency:
          1,
      })

    const half =
      calculatePositiveDisplacementFlowMeter({
        ...input,

        volumetricEfficiency:
          0.5,
      })

    closeTo(
      half.volumetricFlowRate /
      perfect.volumetricFlowRate,
      0.5,
      1e-12,
    )

    closeTo(
      half.slipPercentage,
      50,
      1e-12,
    )
  },
)

test(
  'fluid density changes mass flow without changing volumetric indication',
  () => {
    const base =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    const denser =
      calculatePositiveDisplacementFlowMeter({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.volumetricFlowRate,
      base.volumetricFlowRate,
      1e-15,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'rejects volumetric efficiency above unity',
  () => {
    assert.throws(
      () =>
        calculatePositiveDisplacementFlowMeter({
          ...input,

          volumetricEfficiency:
            1.01,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PositiveDisplacementFlowMeterError &&
        error.code ===
          'INVALID_VOLUMETRIC_EFFICIENCY',
    )
  },
)

test(
  'rejects zero rotational speed',
  () => {
    assert.throws(
      () =>
        calculatePositiveDisplacementFlowMeter({
          ...input,

          rotationalSpeedRpm:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PositiveDisplacementFlowMeterError &&
        error.code ===
          'INVALID_ROTATIONAL_SPEED',
    )
  },
)

test(
  'exports positive-displacement meter results as CSV',
  () => {
    const result =
      calculatePositiveDisplacementFlowMeter(
        input,
      )

    const csv =
      createPositiveDisplacementFlowMeterCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Displacement per cycle/,
    )

    assert.match(
      csv,
      /Slip percentage/,
    )

    assert.match(
      csv,
      /Recovered displacement per cycle/,
    )
  },
)
