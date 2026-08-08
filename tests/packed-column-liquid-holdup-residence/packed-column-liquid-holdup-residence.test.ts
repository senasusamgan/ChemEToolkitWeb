import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PackedColumnLiquidHoldupError,
  calculatePackedColumnLiquidHoldup,
  createPackedColumnLiquidHoldupCsv,
} from '../../src/features/separation-processes/packed-column-liquid-holdup-residence/engine.ts'

const CALCULATOR_ID =
  'packedColumnLiquidHoldupResidence'

const baseInput = {
  liquidVolumetricFlowRate:
    0.01,
  columnDiameter:
    1.2,
  packingHeight:
    4,
  bedVoidFraction:
    0.9,
  liquidHoldupFraction:
    0.08,
  liquidDensity:
    800,
  minimumResidenceTime:
    20,
}

test(
  `${CALCULATOR_ID} calculates packed-bed and void volumes`,
  () => {
    const result =
      calculatePackedColumnLiquidHoldup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.columnArea -
        1.1309733552923256,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result.packedBedVolume -
        4.523893421169302,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result.packedBedVoidVolume -
        4.071504079052372,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates liquid holdup volume and inventory mass',
  () => {
    const result =
      calculatePackedColumnLiquidHoldup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.liquidHoldupVolume -
        0.3619114736935442,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result.liquidInventoryMass -
        289.52917895483534,
      ) <
        1e-9,
    )

    assert.ok(
      Math.abs(
        result.voidSaturationFraction -
        0.08888888888888889,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates liquid velocities mass flux and residence time',
  () => {
    const result =
      calculatePackedColumnLiquidHoldup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .superficialLiquidVelocity -
        0.008841941282883074,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .interstitialLiquidVelocity -
        0.11052426603603842,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .liquidMassFlux -
        7.07355302630646,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .residenceTime -
        36.19114736935442,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates minimum holdup and maximum residence-limited flow',
  () => {
    const result =
      calculatePackedColumnLiquidHoldup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.minimumHoldupVolume -
        0.2,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result.minimumHoldupFraction -
        0.04420970641441537,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result.maximumLiquidFlowByResidence -
        0.01809557368467721,
      ) <
        1e-12,
    )
  },
)

test(
  'classifies liquid-load residence-time scenarios',
  () => {
    const result =
      calculatePackedColumnLiquidHoldup(
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
        'stable',
        'stable',
        'marginal',
        'shortResidence',
        'shortResidence',
      ],
    )
  },
)

test(
  'rejects holdup above the available bed void fraction',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnLiquidHoldup({
          ...baseInput,
          liquidHoldupFraction:
            0.9,
        }),
      (
        error,
      ) =>
        error instanceof
          PackedColumnLiquidHoldupError &&
        error.code ===
          'invalidHoldupFraction',
    )
  },
)

test(
  'exports liquid inventory and residence scenarios as CSV',
  () => {
    const result =
      calculatePackedColumnLiquidHoldup(
        baseInput,
      )

    const csv =
      createPackedColumnLiquidHoldupCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Liquid holdup volume, m3"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Liquid inventory mass, kg"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Maximum liquid flow by residence, m3/s"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Liquid flow multiplier"',
      ),
    )
  },
)
