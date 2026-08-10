import assert from 'node:assert/strict'
import test from 'node:test'

import {
  VNotchTriangularWeirError,
  calculateVNotchTriangularWeir,
  createVNotchTriangularWeirCsv,
} from '../../src/features/fluid-mechanics/v-notch-triangular-weir/engine.ts'

const CALCULATOR_ID =
  'vNotchTriangularWeir'

const input = {
  notchAngleDegrees:
    90,

  headOverVertex:
    0.25,

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
  'calculates V-notch triangular-weir flow rate',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'vNotchTriangularWeir',
    )

    const result =
      calculateVNotchTriangularWeir(
        input,
      )

    closeTo(
      result.volumetricFlowRate,
      0.04576313569773041,
      1e-14,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      164.74728851182948,
      1e-10,
    )

    closeTo(
      result.massFlowRate,
      45.67160942633495,
      1e-11,
    )
  },
)

test(
  'calculates 90-degree notch geometry correctly',
  () => {
    const result =
      calculateVNotchTriangularWeir(
        input,
      )

    closeTo(
      result.halfAngleTangent,
      1,
      1e-14,
    )

    closeTo(
      result.topWidthAtHead,
      0.5,
      1e-14,
    )

    closeTo(
      result.wettedTriangularArea,
      0.0625,
      1e-14,
    )
  },
)

test(
  'recovers the specified upstream head',
  () => {
    const result =
      calculateVNotchTriangularWeir(
        input,
      )

    closeTo(
      result.recoveredHeadOverVertex,
      input.headOverVertex,
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
  'actual to ideal discharge ratio equals Cd',
  () => {
    const result =
      calculateVNotchTriangularWeir(
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
  'flow follows the five-halves head power law',
  () => {
    const base =
      calculateVNotchTriangularWeir(
        input,
      )

    const fourTimesHead =
      calculateVNotchTriangularWeir({
        ...input,

        headOverVertex:
          input.headOverVertex *
          4,
      })

    closeTo(
      fourTimesHead.volumetricFlowRate /
      base.volumetricFlowRate,
      32,
      1e-10,
    )
  },
)

test(
  'flow increases with notch angle at fixed head',
  () => {
    const narrow =
      calculateVNotchTriangularWeir({
        ...input,

        notchAngleDegrees:
          60,
      })

    const wide =
      calculateVNotchTriangularWeir({
        ...input,

        notchAngleDegrees:
          120,
      })

    assert.ok(
      wide.volumetricFlowRate >
      narrow.volumetricFlowRate,
    )
  },
)

test(
  'discharge coefficient scales flow linearly',
  () => {
    const unitCoefficient =
      calculateVNotchTriangularWeir({
        ...input,

        dischargeCoefficient:
          1,
      })

    const halfCoefficient =
      calculateVNotchTriangularWeir({
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
  'rejects a 180-degree notch angle',
  () => {
    assert.throws(
      () =>
        calculateVNotchTriangularWeir({
          ...input,

          notchAngleDegrees:
            180,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          VNotchTriangularWeirError &&
        error.code ===
          'INVALID_NOTCH_ANGLE',
    )
  },
)

test(
  'rejects zero head over the notch vertex',
  () => {
    assert.throws(
      () =>
        calculateVNotchTriangularWeir({
          ...input,

          headOverVertex:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          VNotchTriangularWeirError &&
        error.code ===
          'INVALID_HEAD',
    )
  },
)

test(
  'exports V-notch results as CSV',
  () => {
    const result =
      calculateVNotchTriangularWeir(
        input,
      )

    const csv =
      createVNotchTriangularWeirCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Top width at measured head/,
    )

    assert.match(
      csv,
      /Recovered head over vertex/,
    )

    assert.match(
      csv,
      /Head closure residual/,
    )
  },
)
