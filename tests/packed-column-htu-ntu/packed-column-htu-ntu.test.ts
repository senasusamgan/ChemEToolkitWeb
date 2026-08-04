import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PackedColumnCalculationError,
  calculateLogarithmicMeanDrivingForce,
  calculatePackedColumnHtuNtu,
  createPackedColumnHtuNtuCsv,
} from '../../src/features/separation-processes/packed-column-htu-ntu-height/engine.ts'

const CALCULATOR_ID =
  'packedColumnHtuNtuHeight'

const baseInput = {
  inletGasSoluteFraction:
    0.08,
  outletGasSoluteFraction:
    0.01,
  equilibriumGasFraction:
    0.002,
  overallGasHtu:
    0.75,
  designMarginFraction:
    0.15,
}

test(
  `${CALCULATOR_ID} calculates overall gas phase transfer units`,
  () => {
    const result =
      calculatePackedColumnHtuNtu(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .overallGasNtu -
        2.277267285009756,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates theoretical and design packing height',
  () => {
    const result =
      calculatePackedColumnHtuNtu(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .theoreticalPackingHeight -
        1.7079504637573169,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .designPackingHeight -
        1.9641430333209142,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates logarithmic mean mass transfer driving force',
  () => {
    const value =
      calculateLogarithmicMeanDrivingForce({
        inletDrivingForce:
          0.078,
        outletDrivingForce:
          0.008,
      })

    assert.ok(
      Math.abs(
        value -
        0.03073859641368366,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates removal and equilibrium approach',
  () => {
    const result =
      calculatePackedColumnHtuNtu(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .removalPercent -
        87.5,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .equilibriumApproachPercent -
        10.256410256410255,
      ) <
        1e-12,
    )
  },
)

test(
  'creates outlet target sensitivity scenarios',
  () => {
    const result =
      calculatePackedColumnHtuNtu(
        baseInput,
      )

    assert.deepEqual(
      result.scenarios.map(
        (
          scenario,
        ) =>
          Number(
            scenario
              .outletGasSoluteFraction
              .toFixed(12),
          ),
      ),
      [
        0.006,
        0.01,
        0.014,
        0.018,
      ],
    )

    assert.ok(
      result.scenarios[0]
        .designPackingHeight >
      result.scenarios[
        result.scenarios.length -
        1
      ].designPackingHeight,
    )
  },
)

test(
  'rejects invalid outlet and equilibrium targets',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnHtuNtu({
          ...baseInput,
          outletGasSoluteFraction:
            0.08,
        }),
      (
        error,
      ) =>
        error instanceof
          PackedColumnCalculationError &&
        error.code ===
          'invalidOutletFraction',
    )

    assert.throws(
      () =>
        calculatePackedColumnHtuNtu({
          ...baseInput,
          equilibriumGasFraction:
            0.01,
        }),
      (
        error,
      ) =>
        error instanceof
          PackedColumnCalculationError &&
        error.code ===
          'invalidEquilibriumFraction',
    )
  },
)

test(
  'exports packed column design and target scenarios as CSV',
  () => {
    const result =
      calculatePackedColumnHtuNtu(
        baseInput,
      )

    const csv =
      createPackedColumnHtuNtuCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Overall gas-phase NTU"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Theoretical packing height, m"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Design packing height, m"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Outlet gas fraction"',
      ),
    )
  },
)
