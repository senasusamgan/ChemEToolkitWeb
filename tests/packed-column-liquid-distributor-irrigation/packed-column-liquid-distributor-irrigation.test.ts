import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PackedColumnLiquidDistributorError,
  calculatePackedColumnLiquidDistributor,
  createPackedColumnLiquidDistributorCsv,
} from '../../src/features/separation-processes/packed-column-liquid-distributor-irrigation/engine.ts'

const CALCULATOR_ID =
  'packedColumnLiquidDistributorIrrigation'

const baseInput = {
  liquidVolumetricFlowRate:
    0.015,
  columnDiameter:
    1.5,
  liquidDensity:
    850,
  distributorPointCount:
    120,
  minimumIrrigationDensity:
    20,
  minimumPointDensity:
    50,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance =
    1e-12,
) {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <
      tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  )
}

test(
  `${CALCULATOR_ID} calculates distributor coverage geometry`,
  () => {
    const result =
      calculatePackedColumnLiquidDistributor(
        baseInput,
      )

    closeTo(
      result.columnArea,
      1.7671458676442586,
    )

    closeTo(
      result.distributorPointDensity,
      67.906109052542,
    )

    closeTo(
      result.areaPerDistributorPoint,
      0.014726215563702155,
    )

    closeTo(
      result.equivalentSquarePitch,
      0.1213516195347312,
    )
  },
)

test(
  'calculates irrigation density liquid load and flow per distributor point',
  () => {
    const result =
      calculatePackedColumnLiquidDistributor(
        baseInput,
      )

    closeTo(
      result
        .selectedScenario
        .superficialLiquidVelocity,
      0.00848826363156775,
    )

    closeTo(
      result
        .selectedScenario
        .irrigationDensity,
      30.557749073643905,
    )

    closeTo(
      result
        .selectedScenario
        .liquidMassFlux,
      7.215024086832589,
    )

    closeTo(
      result
        .selectedScenario
        .flowPerDistributorPoint,
      0.45,
    )
  },
)

test(
  'calculates irrigation and distributor design minimums',
  () => {
    const result =
      calculatePackedColumnLiquidDistributor(
        baseInput,
      )

    closeTo(
      result.minimumLiquidFlowByIrrigation,
      0.009817477042468103,
    )

    assert.equal(
      result.minimumDistributorPointCount,
      89,
    )

    closeTo(
      result
        .selectedScenario
        .irrigationRatio,
      1.5278874536821951,
    )

    closeTo(
      result
        .selectedScenario
        .pointDensityRatio,
      1.3581221810508401,
    )
  },
)

test(
  'classifies liquid irrigation turndown scenarios',
  () => {
    const result =
      calculatePackedColumnLiquidDistributor(
        baseInput,
      )

    assert.deepEqual(
      result.scenarios.map(
        (
          scenario,
        ) =>
          scenario.status,
      ),
      [
        'inadequate',
        'marginal',
        'stable',
        'stable',
        'stable',
        'stable',
      ],
    )
  },
)

test(
  'rejects a noninteger distributor point count',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnLiquidDistributor({
          ...baseInput,
          distributorPointCount:
            120.5,
        }),
      (
        error,
      ) =>
        error instanceof
          PackedColumnLiquidDistributorError &&
        error.code ===
          'invalidDistributorPointCount',
    )
  },
)

test(
  'rejects invalid irrigation criteria',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnLiquidDistributor({
          ...baseInput,
          minimumIrrigationDensity:
            0,
        }),
      (
        error,
      ) =>
        error instanceof
          PackedColumnLiquidDistributorError &&
        error.code ===
          'invalidMinimumIrrigationDensity',
    )
  },
)

test(
  'exports liquid distributor screening results as CSV',
  () => {
    const result =
      calculatePackedColumnLiquidDistributor(
        baseInput,
      )

    const csv =
      createPackedColumnLiquidDistributorCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Distributor point density"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Irrigation density"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Equivalent square pitch"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Minimum distributor point count"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Flow multiplier"',
      ),
    )
  },
)
