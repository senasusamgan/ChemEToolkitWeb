import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BroadCrestedWeirFlowError,
  calculateBroadCrestedWeirFlow,
  createBroadCrestedWeirFlowCsv,
} from '../../src/features/fluid-mechanics/broad-crested-weir-flow/engine.ts'

const CALCULATOR_ID =
  'broadCrestedWeirFlow'

const input = {
  crestWidth:
    1.5,

  upstreamHeadAboveCrest:
    0.6,

  dischargeCoefficient:
    0.98,

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
  'calculates broad-crested weir discharge',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'broadCrestedWeirFlow',
    )

    const result =
      calculateBroadCrestedWeirFlow(
        input,
      )

    closeTo(
      result.theoreticalCriticalDepth,
      0.4,
      1e-14,
    )

    closeTo(
      result.theoreticalCriticalVelocity,
      1.9805706248452741,
      1e-12,
    )

    closeTo(
      result.idealVolumetricFlowRate,
      1.1883423749071644,
      1e-12,
    )

    closeTo(
      result.volumetricFlowRate,
      1.164575527409021,
      1e-12,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      4192.471898672476,
      1e-9,
    )

    closeTo(
      result.massFlowRate,
      1162.246376354203,
      1e-9,
    )
  },
)

test(
  'theoretical crest state is critical',
  () => {
    const result =
      calculateBroadCrestedWeirFlow(
        input,
      )

    closeTo(
      result.theoreticalCriticalFroudeNumber,
      1,
      1e-12,
    )

    closeTo(
      result.theoreticalSpecificEnergy,
      input.upstreamHeadAboveCrest,
      1e-12,
    )

    closeTo(
      result.specificEnergyResidual,
      0,
      1e-12,
    )
  },
)

test(
  'recovers upstream head from corrected discharge',
  () => {
    const result =
      calculateBroadCrestedWeirFlow(
        input,
      )

    closeTo(
      result.recoveredUpstreamHead,
      input.upstreamHeadAboveCrest,
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
  'discharge ratio equals discharge coefficient',
  () => {
    const result =
      calculateBroadCrestedWeirFlow(
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
  'doubling crest width doubles discharge',
  () => {
    const base =
      calculateBroadCrestedWeirFlow(
        input,
      )

    const wider =
      calculateBroadCrestedWeirFlow({
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
      calculateBroadCrestedWeirFlow(
        input,
      )

    const fourTimesHead =
      calculateBroadCrestedWeirFlow({
        ...input,

        upstreamHeadAboveCrest:
          input.upstreamHeadAboveCrest *
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
  'discharge coefficient scales corrected flow linearly',
  () => {
    const unitCoefficient =
      calculateBroadCrestedWeirFlow({
        ...input,

        dischargeCoefficient:
          1,
      })

    const halfCoefficient =
      calculateBroadCrestedWeirFlow({
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
  'density changes mass flow but not volumetric flow',
  () => {
    const base =
      calculateBroadCrestedWeirFlow(
        input,
      )

    const denser =
      calculateBroadCrestedWeirFlow({
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
  'rejects zero upstream head',
  () => {
    assert.throws(
      () =>
        calculateBroadCrestedWeirFlow({
          ...input,

          upstreamHeadAboveCrest:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          BroadCrestedWeirFlowError &&
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
        calculateBroadCrestedWeirFlow({
          ...input,

          dischargeCoefficient:
            1.01,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          BroadCrestedWeirFlowError &&
        error.code ===
          'INVALID_DISCHARGE_COEFFICIENT',
    )
  },
)

test(
  'exports broad-crested weir results as CSV',
  () => {
    const result =
      calculateBroadCrestedWeirFlow(
        input,
      )

    const csv =
      createBroadCrestedWeirFlowCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Theoretical critical depth/,
    )

    assert.match(
      csv,
      /Recovered upstream head/,
    )

    assert.match(
      csv,
      /Head closure residual/,
    )
  },
)
