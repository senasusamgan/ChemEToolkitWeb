import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMinimumContractionWidthError,
  calculateTrapezoidalMinimumContractionWidth,
  createTrapezoidalMinimumContractionWidthCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-min-contraction-width/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMinimumContractionWidth'

const input = {
  upstreamBottomWidth:
    3,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  upstreamFlowDepth:
    1.2,

  fluidDensity:
    998,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-8,
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
  'calculates the minimum contracted bottom width before choking',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMinimumContractionWidth',
    )

    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2501797235694763,
      1e-10,
    )

    closeTo(
      result.minimumContractedBottomWidth,
      1.215361679294872,
      3e-8,
    )

    closeTo(
      result.bottomWidthReduction,
      1.784638320705128,
      3e-8,
    )
  },
)

test(
  'reports the upstream subcritical approach state',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.upstreamFlowArea,
      5.04,
      1e-12,
    )

    closeTo(
      result.upstreamVelocity,
      0.9920634920634921,
      1e-12,
    )

    closeTo(
      result.upstreamFroudeNumber,
      0.3279145911322784,
      1e-10,
    )

    assert.ok(
      result.upstreamFroudeNumber <
      1,
    )
  },
)

test(
  'critical contraction throat operates at Froude number one',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.criticalThroatDepth,
      0.9267399113571013,
      3e-8,
    )

    closeTo(
      result.criticalThroatFlowArea,
      1.9851710382387155,
      5e-8,
    )

    closeTo(
      result.criticalThroatTopWidth,
      3.0688415020090747,
      5e-8,
    )

    closeTo(
      result.criticalThroatVelocity,
      2.518674665149307,
      5e-8,
    )

    closeTo(
      result.criticalThroatFroudeNumber,
      1,
      1e-9,
    )
  },
)

test(
  'reports contraction ratio and percentage width reduction',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.contractionRatio,
      0.40512055976495737,
      3e-8,
    )

    closeTo(
      result.bottomWidthReductionPercent,
      59.487944023504255,
      3e-6,
    )

    assert.ok(
      result.contractionRatio <
      1,
    )
  },
)

test(
  'critical throat preserves upstream specific energy',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.criticalThroatSpecificEnergy,
      result.upstreamSpecificEnergy,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <=
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtChoking,
      -0.27326008864289864,
      3e-8,
    )
  },
)

test(
  'Calculator 435 forward capacity closes to the design flow',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.reconstructedCriticalCapacity,
      input.volumetricFlowRate,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.flowClosureResidual,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.criticalConditionResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'reports triangular zero-width capacity margin',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    closeTo(
      result.zeroBottomWidthCapacity,
      2.215141301602207,
      1e-8,
    )

    closeTo(
      result.flowMarginAboveTriangularLimit,
      2.784858698397793,
      1e-8,
    )
  },
)

test(
  'rectangular-channel limit matches analytical contraction width',
  () => {
    const rectangularInput = {
      upstreamBottomWidth:
        3,

      sideSlopeHorizontalPerVertical:
        0,

      volumetricFlowRate:
        4,

      upstreamFlowDepth:
        1.5,

      fluidDensity:
        998,
    }

    const result =
      calculateTrapezoidalMinimumContractionWidth(
        rectangularInput,
      )

    const upstreamVelocity =
      rectangularInput.volumetricFlowRate /
      (
        rectangularInput.upstreamBottomWidth *
        rectangularInput.upstreamFlowDepth
      )

    const upstreamEnergy =
      rectangularInput.upstreamFlowDepth +
      upstreamVelocity *
      upstreamVelocity /
      (
        2 *
        9.80665
      )

    const criticalDepth =
      (
        2 /
        3
      ) *
      upstreamEnergy

    const analyticalWidth =
      rectangularInput.volumetricFlowRate /
      (
        Math.sqrt(
          9.80665,
        ) *
        criticalDepth **
          (
            3 / 2
          )
      )

    closeTo(
      result.criticalThroatDepth,
      1.0268567233047685,
      3e-8,
    )

    closeTo(
      result.minimumContractedBottomWidth,
      analyticalWidth,
      3e-8,
    )

    closeTo(
      result.minimumContractedBottomWidth,
      1.227537807598605,
      3e-8,
    )
  },
)

test(
  'more upstream specific energy permits a narrower contraction',
  () => {
    const base =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    const deeper =
      calculateTrapezoidalMinimumContractionWidth({
        ...input,

        upstreamFlowDepth:
          1.4,
      })

    assert.ok(
      deeper.upstreamSpecificEnergy >
      base.upstreamSpecificEnergy,
    )

    assert.ok(
      deeper.minimumContractedBottomWidth <
      base.minimumContractedBottomWidth,
    )

    closeTo(
      deeper.minimumContractedBottomWidth,
      0.6769136989959195,
      3e-8,
    )
  },
)

test(
  'density changes mass flow but not contraction geometry',
  () => {
    const base =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    const denser =
      calculateTrapezoidalMinimumContractionWidth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.minimumContractedBottomWidth,
      base.minimumContractedBottomWidth,
      1e-8,
    )

    closeTo(
      denser.criticalThroatDepth,
      base.criticalThroatDepth,
      1e-8,
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
  'rejects a supercritical upstream approach state',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumContractionWidth({
          ...input,

          upstreamFlowDepth:
            0.35,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumContractionWidthError &&
        error.code ===
          'UPSTREAM_NOT_SUBCRITICAL',
    )
  },
)

test(
  'rejects zero upstream bottom width',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumContractionWidth({
          ...input,

          upstreamBottomWidth:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumContractionWidthError &&
        error.code ===
          'INVALID_UPSTREAM_WIDTH',
    )
  },
)

test(
  'exports contraction choking design as CSV',
  () => {
    const result =
      calculateTrapezoidalMinimumContractionWidth(
        input,
      )

    const csv =
      createTrapezoidalMinimumContractionWidthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Minimum contracted bottom width/,
    )

    assert.match(
      csv,
      /Contraction ratio/,
    )

    assert.match(
      csv,
      /Critical throat Froude number/,
    )

    assert.match(
      csv,
      /Reconstructed critical capacity/,
    )
  },
)
