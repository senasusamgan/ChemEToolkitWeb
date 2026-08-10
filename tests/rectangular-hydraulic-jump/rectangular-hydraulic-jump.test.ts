import assert from 'node:assert/strict'
import test from 'node:test'

import {
  RectangularHydraulicJumpError,
  calculateRectangularHydraulicJump,
  createRectangularHydraulicJumpCsv,
} from '../../src/features/fluid-mechanics/rectangular-hydraulic-jump/engine.ts'

const CALCULATOR_ID =
  'rectangularHydraulicJump'

const input = {
  channelWidth:
    2,

  upstreamDepth:
    0.5,

  volumetricFlowRate:
    4,

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
  'calculates upstream Froude number and sequent depth',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'rectangularHydraulicJump',
    )

    const result =
      calculateRectangularHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamVelocity,
      4,
      1e-14,
    )

    closeTo(
      result.upstreamFroudeNumber,
      1.8064030230071502,
      1e-12,
    )

    closeTo(
      result.sequentDepthRatio,
      2.1031104016270117,
      1e-12,
    )

    closeTo(
      result.downstreamDepth,
      1.0515552008135058,
      1e-12,
    )
  },
)

test(
  'converts supercritical upstream flow to subcritical downstream flow',
  () => {
    const result =
      calculateRectangularHydraulicJump(
        input,
      )

    assert.equal(
      result.upstreamRegime,
      'supercritical',
    )

    assert.equal(
      result.downstreamRegime,
      'subcritical',
    )

    closeTo(
      result.downstreamFroudeNumber,
      0.5922724674466963,
      1e-12,
    )

    assert.ok(
      result.downstreamVelocity <
      result.upstreamVelocity,
    )
  },
)

test(
  'calculates hydraulic-jump energy loss',
  () => {
    const result =
      calculateRectangularHydraulicJump(
        input,
      )

    closeTo(
      result.energyLoss,
      0.07978199296704877,
      1e-12,
    )

    closeTo(
      result.upstreamSpecificEnergy,
      1.3157729703823426,
      1e-12,
    )

    closeTo(
      result.downstreamSpecificEnergy,
      1.235990977415294,
      1e-12,
    )

    closeTo(
      result.upstreamSpecificEnergy -
      result.downstreamSpecificEnergy,
      result.energyLoss,
      1e-12,
    )
  },
)

test(
  'closes the rectangular-channel momentum function',
  () => {
    const result =
      calculateRectangularHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamMomentumFunction,
      0.9407729703823426,
      1e-12,
    )

    closeTo(
      result.downstreamMomentumFunction,
      result.upstreamMomentumFunction,
      1e-12,
    )

    closeTo(
      result.momentumClosureResidual,
      0,
      1e-12,
    )
  },
)

test(
  'calculates dissipated hydraulic power',
  () => {
    const result =
      calculateRectangularHydraulicJump(
        input,
      )

    closeTo(
      result.dissipatedPower,
      3123.3171726705923,
      1e-8,
    )
  },
)

test(
  'increasing discharge strengthens the hydraulic jump',
  () => {
    const base =
      calculateRectangularHydraulicJump(
        input,
      )

    const higherFlow =
      calculateRectangularHydraulicJump({
        ...input,

        volumetricFlowRate:
          5,
      })

    assert.ok(
      higherFlow.upstreamFroudeNumber >
      base.upstreamFroudeNumber,
    )

    assert.ok(
      higherFlow.downstreamDepth >
      base.downstreamDepth,
    )

    assert.ok(
      higherFlow.energyLoss >
      base.energyLoss,
    )
  },
)

test(
  'greater channel width weakens the jump for fixed total discharge',
  () => {
    const base =
      calculateRectangularHydraulicJump(
        input,
      )

    const wider =
      calculateRectangularHydraulicJump({
        ...input,

        channelWidth:
          2.5,
      })

    assert.ok(
      wider.upstreamFroudeNumber <
      base.upstreamFroudeNumber,
    )

    assert.ok(
      wider.sequentDepthRatio <
      base.sequentDepthRatio,
    )
  },
)

test(
  'fluid density changes power but not jump depths',
  () => {
    const base =
      calculateRectangularHydraulicJump(
        input,
      )

    const denser =
      calculateRectangularHydraulicJump({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.downstreamDepth,
      base.downstreamDepth,
      1e-12,
    )

    closeTo(
      denser.dissipatedPower /
      base.dissipatedPower,
      2,
      1e-12,
    )
  },
)

test(
  'rejects subcritical upstream flow',
  () => {
    assert.throws(
      () =>
        calculateRectangularHydraulicJump({
          channelWidth:
            2,

          upstreamDepth:
            1,

          volumetricFlowRate:
            1,

          fluidDensity:
            998,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          RectangularHydraulicJumpError &&
        error.code ===
          'UPSTREAM_FLOW_NOT_SUPERCRITICAL',
    )
  },
)

test(
  'rejects zero upstream depth',
  () => {
    assert.throws(
      () =>
        calculateRectangularHydraulicJump({
          ...input,

          upstreamDepth:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          RectangularHydraulicJumpError &&
        error.code ===
          'INVALID_UPSTREAM_DEPTH',
    )
  },
)

test(
  'exports hydraulic-jump results as CSV',
  () => {
    const result =
      calculateRectangularHydraulicJump(
        input,
      )

    const csv =
      createRectangularHydraulicJumpCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Sequent depth/,
    )

    assert.match(
      csv,
      /Hydraulic-jump energy loss/,
    )

    assert.match(
      csv,
      /Momentum closure residual/,
    )
  },
)
