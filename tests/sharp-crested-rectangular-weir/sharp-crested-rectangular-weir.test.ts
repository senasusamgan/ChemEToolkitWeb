import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SharpCrestedRectangularWeirError,
  calculateSharpCrestedRectangularWeir,
  createSharpCrestedRectangularWeirCsv,
} from '../../src/features/fluid-mechanics/sharp-crested-rectangular-weir/engine.ts'

const CALCULATOR_ID =
  'sharpCrestedRectangularWeir'

const input = {
  crestWidth:
    1.2,

  headOverCrest:
    0.3,

  dischargeCoefficient:
    0.62,

  fluidDensity:
    998,
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
  'calculates sharp-crested rectangular-weir flow rate',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'sharpCrestedRectangularWeir',
    )

    const result =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    closeTo(
      result.volumetricFlowRate,
      0.36094322482296287,
      1e-12,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      1299.3956093626664,
      1e-9,
    )

    closeTo(
      result.massFlowRate,
      360.22133837331694,
      1e-9,
    )
  },
)

test(
  'recovers the specified head from calculated discharge',
  () => {
    const result =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    closeTo(
      result.recoveredHeadOverCrest,
      input.headOverCrest,
      1e-12,
    )

    closeTo(
      result.headClosureResidual,
      0,
      1e-12,
    )
  },
)

test(
  'actual to ideal discharge ratio equals discharge coefficient',
  () => {
    const result =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    closeTo(
      result.dischargeRatio,
      input.dischargeCoefficient,
      1e-12,
    )
  },
)

test(
  'doubling crest width doubles flow',
  () => {
    const base =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    const wider =
      calculateSharpCrestedRectangularWeir({
        ...input,

        crestWidth:
          input.crestWidth *
          2,
      })

    closeTo(
      wider.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'flow follows the three-halves head power law',
  () => {
    const base =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    const fourTimesHead =
      calculateSharpCrestedRectangularWeir({
        ...input,

        headOverCrest:
          input.headOverCrest *
          4,
      })

    closeTo(
      fourTimesHead.volumetricFlowRate /
      base.volumetricFlowRate,
      8,
      1e-11,
    )
  },
)

test(
  'discharge coefficient scales flow linearly',
  () => {
    const unitCoefficient =
      calculateSharpCrestedRectangularWeir({
        ...input,

        dischargeCoefficient:
          1,
      })

    const halfCoefficient =
      calculateSharpCrestedRectangularWeir({
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
  'fluid density changes mass flow but not volumetric flow',
  () => {
    const base =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    const denser =
      calculateSharpCrestedRectangularWeir({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.volumetricFlowRate,
      base.volumetricFlowRate,
      1e-12,
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
  'rejects zero head over crest',
  () => {
    assert.throws(
      () =>
        calculateSharpCrestedRectangularWeir({
          ...input,

          headOverCrest:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          SharpCrestedRectangularWeirError &&
        error.code ===
          'INVALID_HEAD',
    )
  },
)

test(
  'rejects discharge coefficient above unity',
  () => {
    assert.throws(
      () =>
        calculateSharpCrestedRectangularWeir({
          ...input,

          dischargeCoefficient:
            1.01,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          SharpCrestedRectangularWeirError &&
        error.code ===
          'INVALID_DISCHARGE_COEFFICIENT',
    )
  },
)

test(
  'exports rectangular-weir results as CSV',
  () => {
    const result =
      calculateSharpCrestedRectangularWeir(
        input,
      )

    const csv =
      createSharpCrestedRectangularWeirCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Unit discharge/,
    )

    assert.match(
      csv,
      /Recovered head over crest/,
    )

    assert.match(
      csv,
      /Head closure residual/,
    )
  },
)
