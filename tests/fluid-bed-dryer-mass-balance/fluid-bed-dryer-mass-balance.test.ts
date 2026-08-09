import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FluidBedDryerMassBalanceError,
  calculateFluidBedDryerMassBalance,
  createFluidBedDryerMassBalanceCsv,
} from '../../src/features/material-energy-balances/fluid-bed-dryer-mass-balance/engine.ts'

const CALCULATOR_ID =
  'fluidBedDryerMassBalance'

const input = {
  wetFeedMassFlowRate: 1000,
  inletMoistureWetBasis: 0.25,
  outletMoistureWetBasis: 0.05,
  dryAirMassFlowRate: 5000,
  inletAirHumidityRatio: 0.01,
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
    `${actual} != ${expected}`,
  )
}

test(
  'fluidBedDryerMassBalance calculates dry solids and product flow',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'fluidBedDryerMassBalance',
    )

    const result =
      calculateFluidBedDryerMassBalance(
        input,
      )

    closeTo(
      result.drySolidMassFlowRate,
      750,
    )

    closeTo(
      result.dryProductMassFlowRate,
      789.4736842105264,
    )
  },
)

test(
  'calculates water evaporation',
  () => {
    const result =
      calculateFluidBedDryerMassBalance(
        input,
      )

    closeTo(
      result.inletWaterMassFlowRate,
      250,
    )

    closeTo(
      result.outletProductWaterMassFlowRate,
      39.47368421052632,
    )

    closeTo(
      result.evaporatedWaterMassFlowRate,
      210.52631578947367,
    )
  },
)

test(
  'calculates outlet humidity ratio',
  () => {
    const result =
      calculateFluidBedDryerMassBalance(
        input,
      )

    closeTo(
      result.outletAirHumidityRatio,
      0.05210526315789474,
    )

    closeTo(
      result.outletWetAirMassFlowRate,
      5260.526315789473,
    )
  },
)

test(
  'closes overall mass balance',
  () => {
    const result =
      calculateFluidBedDryerMassBalance(
        input,
      )

    closeTo(
      result.totalMassIn,
      6050,
    )

    closeTo(
      result.totalMassOut,
      6050,
    )

    closeTo(
      result.massBalanceClosureError,
      0,
    )
  },
)

test(
  'calculates water removal percentage',
  () => {
    const result =
      calculateFluidBedDryerMassBalance(
        input,
      )

    closeTo(
      result.waterRemovalPercent,
      84.21052631578947,
    )
  },
)

test(
  'rejects invalid drying moisture window',
  () => {
    assert.throws(
      () =>
        calculateFluidBedDryerMassBalance({
          ...input,
          outletMoistureWetBasis: 0.30,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FluidBedDryerMassBalanceError &&
        error.code ===
          'INVALID_MOISTURE_WINDOW',
    )
  },
)

test(
  'exports fluid bed dryer mass balance as CSV',
  () => {
    const result =
      calculateFluidBedDryerMassBalance(
        input,
      )

    const csv =
      createFluidBedDryerMassBalanceCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Fluid Bed Dryer Mass Balance/,
    )

    assert.match(
      csv,
      /Evaporated water/,
    )

    assert.match(
      csv,
      /Outlet humidity ratio/,
    )
  },
)
