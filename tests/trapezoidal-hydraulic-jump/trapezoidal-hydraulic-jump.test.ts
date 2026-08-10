import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalHydraulicJumpError,
  calculateTrapezoidalHydraulicJump,
  createTrapezoidalHydraulicJumpCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-hydraulic-jump/engine.ts'

const CALCULATOR_ID =
  'trapezoidalHydraulicJump'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  upstreamDepth:
    0.4,

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
  'solves trapezoidal hydraulic-jump conjugate depth',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalHydraulicJump',
    )

    const result =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamFroudeNumber,
      2.2723321841885524,
      1e-10,
    )

    closeTo(
      result.downstreamDepth,
      1.0016137734561958,
      1e-8,
    )

    closeTo(
      result.sequentDepthRatio,
      2.5040344336404896,
      1e-8,
    )
  },
)

test(
  'converts supercritical flow to subcritical flow',
  () => {
    const result =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    assert.ok(
      result.upstreamFroudeNumber >
      1,
    )

    assert.ok(
      result.downstreamFroudeNumber <
      1,
    )

    assert.ok(
      result.upstreamDepth <
      result.criticalDepth,
    )

    assert.ok(
      result.downstreamDepth >
      result.criticalDepth,
    )

    closeTo(
      result.downstreamFroudeNumber,
      0.49025512848804986,
      1e-8,
    )
  },
)

test(
  'closes the trapezoidal momentum function',
  () => {
    const result =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamMomentumFunction,
      1.8808603549632144,
      1e-10,
    )

    closeTo(
      result.downstreamMomentumFunction,
      result.upstreamMomentumFunction,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.relativeMomentumClosureResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'calculates hydraulic-jump energy dissipation',
  () => {
    const result =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    closeTo(
      result.energyLoss,
      0.19330407616417866,
      1e-8,
    )

    closeTo(
      result.energyLossPercentage,
      15.041125101441466,
      1e-7,
    )

    closeTo(
      result.dissipatedPower,
      7567.496350713646,
      1e-4,
    )

    closeTo(
      result.upstreamSpecificEnergy -
      result.downstreamSpecificEnergy,
      result.energyLoss,
      1e-10,
    )
  },
)

test(
  'reduces to rectangular hydraulic-jump relation when side slope is zero',
  () => {
    const rectangularInput = {
      bottomWidth:
        2,

      sideSlopeHorizontalPerVertical:
        0,

      upstreamDepth:
        0.4,

      volumetricFlowRate:
        4,

      fluidDensity:
        998,
    }

    const result =
      calculateTrapezoidalHydraulicJump(
        rectangularInput,
      )

    const area =
      rectangularInput.bottomWidth *
      rectangularInput.upstreamDepth

    const velocity =
      rectangularInput.volumetricFlowRate /
      area

    const froude =
      velocity /
      Math.sqrt(
        9.80665 *
        rectangularInput.upstreamDepth,
      )

    const analyticalDepth =
      rectangularInput.upstreamDepth *
      0.5 *
      (
        Math.sqrt(
          1 +
          8 *
          froude *
          froude,
        ) -
        1
      )

    closeTo(
      result.downstreamDepth,
      analyticalDepth,
      1e-8,
    )
  },
)

test(
  'increasing flow rate strengthens the jump',
  () => {
    const base =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    const higher =
      calculateTrapezoidalHydraulicJump({
        ...input,

        volumetricFlowRate:
          5,
      })

    assert.ok(
      higher.upstreamFroudeNumber >
      base.upstreamFroudeNumber,
    )

    assert.ok(
      higher.downstreamDepth >
      base.downstreamDepth,
    )

    assert.ok(
      higher.energyLoss >
      base.energyLoss,
    )
  },
)

test(
  'larger trapezoidal side slope weakens jump depth for fixed Q and y1',
  () => {
    const narrow =
      calculateTrapezoidalHydraulicJump({
        ...input,

        sideSlopeHorizontalPerVertical:
          0.5,
      })

    const wider =
      calculateTrapezoidalHydraulicJump({
        ...input,

        sideSlopeHorizontalPerVertical:
          2,
      })

    assert.ok(
      wider.upstreamFroudeNumber <
      narrow.upstreamFroudeNumber,
    )

    assert.ok(
      wider.downstreamDepth <
      narrow.downstreamDepth,
    )
  },
)

test(
  'density changes dissipated power but not conjugate depth',
  () => {
    const base =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    const denser =
      calculateTrapezoidalHydraulicJump({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.downstreamDepth,
      base.downstreamDepth,
      1e-9,
    )

    closeTo(
      denser.dissipatedPower /
      base.dissipatedPower,
      2,
      1e-10,
    )
  },
)

test(
  'reports positive numerical solver iterations',
  () => {
    const result =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    assert.ok(
      result.solverIterations >
      0,
    )
  },
)

test(
  'rejects subcritical upstream state',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalHydraulicJump({
          bottomWidth:
            2,

          sideSlopeHorizontalPerVertical:
            1,

          upstreamDepth:
            1,

          volumetricFlowRate:
            2,

          fluidDensity:
            998,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalHydraulicJumpError &&
        error.code ===
          'UPSTREAM_FLOW_NOT_SUPERCRITICAL',
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalHydraulicJump({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalHydraulicJumpError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'exports trapezoidal hydraulic-jump results as CSV',
  () => {
    const result =
      calculateTrapezoidalHydraulicJump(
        input,
      )

    const csv =
      createTrapezoidalHydraulicJumpCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Downstream sequent depth/,
    )

    assert.match(
      csv,
      /Dissipated hydraulic power/,
    )

    assert.match(
      csv,
      /Momentum closure residual/,
    )
  },
)
