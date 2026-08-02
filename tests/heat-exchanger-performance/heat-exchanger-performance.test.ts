import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateHeatExchangerPerformance,
  calculateLogarithmicMeanTemperatureDifference,
  createHeatExchangerOutletProblem,
  createHeatExchangerPerformanceCsv,
} from '../../src/features/problem-solver/heatExchangerPerformanceEngine.ts'

const baseInput = {
  arrangement:
    'counterflow' as const,
  hotInletTemperature:
    400,
  coldInletTemperature:
    300,
  hotMassFlowRate:
    2,
  coldMassFlowRate:
    1,
  hotSpecificHeat:
    2000,
  coldSpecificHeat:
    4000,
  operatingOverallHeatTransferCoefficient:
    500,
  cleanOverallHeatTransferCoefficient:
    700,
  heatTransferArea:
    10,
  targetColdOutletTemperature:
    350,
}

test(
  'calculates counterflow effectiveness with equal capacity rates',
  () => {
    const analysis =
      calculateHeatExchangerPerformance(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    const expectedNtu =
      1.25

    const expectedEffectiveness =
      expectedNtu /
      (
        1 +
        expectedNtu
      )

    assert.ok(
      Math.abs(
        analysis
          .operating
          .numberOfTransferUnits -
        expectedNtu,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        analysis
          .operating
          .effectiveness -
        expectedEffectiveness,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates outlet temperatures and closes the energy balance',
  () => {
    const analysis =
      calculateHeatExchangerPerformance(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      analysis
        .operating
        .hotOutletTemperature <
      baseInput
        .hotInletTemperature,
    )

    assert.ok(
      analysis
        .operating
        .coldOutletTemperature >
      baseInput
        .coldInletTemperature,
    )

    assert.ok(
      Math.abs(
        analysis
          .operating
          .energyBalanceError,
      ) <
        1e-8,
    )
  },
)

test(
  'counterflow produces more duty than parallel flow',
  () => {
    const counterflow =
      calculateHeatExchangerPerformance(
        baseInput,
      )

    const parallel =
      calculateHeatExchangerPerformance({
        ...baseInput,
        arrangement:
          'parallel',
      })

    assert.ok(
      counterflow,
    )

    assert.ok(
      parallel,
    )

    assert.ok(
      counterflow
        .operating
        .heatDuty >
      parallel
        .operating
        .heatDuty,
    )
  },
)

test(
  'calculates clean versus fouled performance loss',
  () => {
    const analysis =
      calculateHeatExchangerPerformance(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      analysis.clean.heatDuty >
      analysis
        .operating
        .heatDuty,
    )

    assert.ok(
      analysis.heatDutyLoss >
      0,
    )

    assert.ok(
      analysis.heatDutyLossPercent >
      0,
    )

    assert.ok(
      analysis.foulingResistance >
      0,
    )
  },
)

test(
  'calculates required area for a target cold outlet',
  () => {
    const analysis =
      calculateHeatExchangerPerformance(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      analysis.designTarget,
    )

    assert.ok(
      Math.abs(
        analysis
          .designTarget
          .requiredEffectiveness -
        0.5,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        analysis
          .designTarget
          .requiredNumberOfTransferUnits -
        1,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        analysis
          .designTarget
          .requiredArea -
        8,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates logarithmic mean temperature difference',
  () => {
    const value =
      calculateLogarithmicMeanTemperatureDifference(
        80,
        40,
      )

    assert.ok(
      value,
    )

    assert.ok(
      Math.abs(
        value -
        (
          40 /
          Math.log(
            2,
          )
        ),
      ) <
        1e-12,
    )
  },
)

test(
  'rejects invalid thermal inputs',
  () => {
    assert.equal(
      calculateHeatExchangerPerformance({
        ...baseInput,
        hotInletTemperature:
          290,
      }),
      null,
    )

    assert.equal(
      calculateHeatExchangerPerformance({
        ...baseInput,
        cleanOverallHeatTransferCoefficient:
          400,
      }),
      null,
    )
  },
)

test(
  'replaces both outlet temperatures in the Solver problem',
  () => {
    assert.equal(
      createHeatExchangerOutletProblem(
        'Thout=380 K; Tcout=320 K; Q=?',
        'Thout',
        'Tcout',
        350,
        355,
      ),
      'Thout=350 K; Tcout=355 K; Q=?',
    )
  },
)

test(
  'exports rating fouling and target design as CSV',
  () => {
    const analysis =
      calculateHeatExchangerPerformance(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    const csv =
      createHeatExchangerPerformanceCsv(
        analysis,
      )

    assert.ok(
      csv.includes(
        '"Heat duty, W"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Fouling resistance, m2 K/W"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Required area, m2"',
      ),
    )
  },
)
