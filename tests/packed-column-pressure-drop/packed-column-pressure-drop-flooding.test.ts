import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PackedColumnPressureDropError,
  calculatePackedColumnFloodingVelocity,
  calculatePackedColumnPressureDrop,
  createPackedColumnPressureDropCsv,
} from '../../src/features/separation-processes/packed-column-pressure-drop-flooding/engine.ts'

const baseInput = {
  gasVolumetricFlowRate: 1.2,
  columnDiameter: 1.2,
  packingHeight: 4,
  bedVoidFraction: 0.9,
  packingEquivalentDiameter: 0.025,
  gasDensity: 1.5,
  gasViscosity: 1.8e-5,
  liquidDensity: 800,
  packingCapacityFactor: 0.12,
  designFloodFraction: 0.7,
}

test(
  'packedColumnPressureDropFlooding calculates column area and velocity',
  () => {
    const result =
      calculatePackedColumnPressureDrop(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.columnArea -
        1.1309733552923256,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .superficialGasVelocity -
        1.0610329539459689,
      ) < 1e-12,
    )
  },
)

test(
  'calculates Ergun Reynolds and pressure-drop terms',
  () => {
    const result =
      calculatePackedColumnPressureDrop(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .packingReynoldsNumber -
        2210.4853207207684,
      ) < 1e-9,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .viscousPressureGradient -
        0.06287602690050181,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .inertialPressureGradient -
        16.215095690360403,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .totalDryPressureDrop -
        65.11188686904362,
      ) < 1e-12,
    )
  },
)

test(
  'calculates flooding velocity and design capacity',
  () => {
    const floodingVelocity =
      calculatePackedColumnFloodingVelocity(
        baseInput,
      )

    assert.ok(
      Math.abs(
        floodingVelocity -
        2.768681996907554,
      ) < 1e-12,
    )

    const result =
      calculatePackedColumnPressureDrop(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.maximumGasFlowAtDesign -
        2.1919138974459944,
      ) < 1e-12,
    )
  },
)

test(
  'classifies gas-load scenarios',
  () => {
    const result =
      calculatePackedColumnPressureDrop(
        baseInput,
      )

    assert.deepEqual(
      result.scenarios.map(
        (scenario) =>
          scenario.status,
      ),
      [
        'lowLoad',
        'stable',
        'stable',
        'highLoad',
        'flooded',
      ],
    )
  },
)

test(
  'rejects invalid packing data',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnPressureDrop({
          ...baseInput,
          bedVoidFraction: 1,
        }),
      (error) =>
        error instanceof
          PackedColumnPressureDropError &&
        error.code ===
          'invalidVoidFraction',
    )

    assert.throws(
      () =>
        calculatePackedColumnPressureDrop({
          ...baseInput,
          liquidDensity: 1,
        }),
      (error) =>
        error instanceof
          PackedColumnPressureDropError &&
        error.code ===
          'invalidDensityOrder',
    )
  },
)

test(
  'exports pressure-drop scenarios as CSV',
  () => {
    const result =
      calculatePackedColumnPressureDrop(
        baseInput,
      )

    const csv =
      createPackedColumnPressureDropCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Dry pressure drop, Pa/m"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Flooding velocity, m/s"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Gas flow multiplier"',
      ),
    )
  },
)
