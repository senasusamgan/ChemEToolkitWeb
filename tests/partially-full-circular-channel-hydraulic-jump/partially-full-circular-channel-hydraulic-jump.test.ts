import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelHydraulicJumpError,
  calculatePartiallyFullCircularChannelHydraulicJump,
  createPartiallyFullCircularChannelHydraulicJumpCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-hydraulic-jump/engine.ts'

import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/engine.ts'

const CALCULATOR_ID =
  'partiallyFullCircularChannelHydraulicJump'

const input = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    1.2,

  upstreamFlowDepth:
    0.35,

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
  'solves circular-channel conjugate downstream depth',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'partiallyFullCircularChannelHydraulicJump',
    )

    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    closeTo(
      result.downstreamState.flowDepth,
      0.9604745823204073,
      2e-9,
    )

    closeTo(
      result.jumpHeight,
      0.6104745823204073,
      2e-9,
    )

    closeTo(
      result.sequentDepthRatio,
      2.744213092344021,
      2e-9,
    )
  },
)


test(
  'Calculator 457 critical depth lies between jump states',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    const critical =
      calculatePartiallyFullCircularChannelCriticalDepth({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      result.criticalDepth,
      critical.criticalDepth,
      1e-12,
    )

    assert.ok(
      result.upstreamState.flowDepth <
      critical.criticalDepth,
    )

    assert.ok(
      result.downstreamState.flowDepth >
      critical.criticalDepth,
    )
  },
)


test(
  'transitions from supercritical to subcritical flow',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamState.froudeNumber,
      2.78426790857768,
      2e-10,
    )

    closeTo(
      result.downstreamState.froudeNumber,
      0.39261547381682416,
      2e-10,
    )

    assert.ok(
      result.upstreamState.froudeNumber >
      1,
    )

    assert.ok(
      result.downstreamState.froudeNumber <
      1,
    )
  },
)


test(
  'specific-force momentum function closes across the jump',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamSpecificForce,
      0.5746871365424125,
      2e-10,
    )

    closeTo(
      result.downstreamSpecificForce,
      result.upstreamSpecificForce,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.momentumClosureResidual,
      ) <
      1e-9,
    )
  },
)


test(
  'hydrostatic-force increase closes momentum-flux change',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    closeTo(
      result.hydrostaticForceUpstream,
      387.33085001261986,
      2e-8,
    )

    closeTo(
      result.hydrostaticForceDownstream,
      4143.5316153760705,
      1e-7,
    )

    closeTo(
      result.hydrostaticForceIncrease,
      result.momentumFluxChangeForce,
      2e-7,
    )

    assert.ok(
      Math.abs(
        result.forceBalanceResidual,
      ) <
      2e-7,
    )
  },
)


test(
  'reports irreversible specific-energy loss across jump',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    closeTo(
      result.upstreamState.specificEnergy,
      1.3250262731083216,
      2e-10,
    )

    closeTo(
      result.downstreamState.specificEnergy,
      1.038441075611725,
      2e-10,
    )

    closeTo(
      result.specificEnergyLoss,
      0.2865851974965965,
      2e-10,
    )

    closeTo(
      result.energyLossPercent,
      21.628642639991487,
      2e-9,
    )
  },
)


test(
  'reports dissipated hydraulic power and mass flow',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    closeTo(
      result.hydraulicPowerDissipated,
      3365.7838146911254,
      2e-7,
    )

    closeTo(
      result.massFlowRate,
      1197.6,
      1e-10,
    )
  },
)


test(
  'density changes forces and power but not conjugate depths',
  () => {
    const base =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    const denser =
      calculatePartiallyFullCircularChannelHydraulicJump({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.downstreamState.flowDepth,
      base.downstreamState.flowDepth,
      1e-12,
    )

    closeTo(
      denser.upstreamState.froudeNumber,
      base.upstreamState.froudeNumber,
      1e-12,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.hydrostaticForceDownstream /
      base.hydrostaticForceDownstream,
      2,
      1e-12,
    )

    closeTo(
      denser.hydraulicPowerDissipated /
      base.hydraulicPowerDissipated,
      2,
      1e-12,
    )
  },
)


test(
  'rejects a subcritical upstream state',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelHydraulicJump({
          ...input,

          upstreamFlowDepth:
            0.8,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelHydraulicJumpError &&
        error.code ===
          'UPSTREAM_NOT_SUPERCRITICAL',
    )
  },
)


test(
  'rejects a jump whose conjugate depth would exceed the conduit crown',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelHydraulicJump({
          ...input,

          upstreamFlowDepth:
            0.2,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelHydraulicJumpError &&
        error.code ===
          'NO_PARTIAL_CONJUGATE_DEPTH',
    )
  },
)


test(
  'rejects invalid upstream depth',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelHydraulicJump({
          ...input,

          upstreamFlowDepth:
            input.pipeDiameter,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelHydraulicJumpError &&
        error.code ===
          'INVALID_UPSTREAM_DEPTH',
    )
  },
)


test(
  'exports hydraulic-jump momentum and energy data as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelHydraulicJump(
        input,
      )

    const csv =
      createPartiallyFullCircularChannelHydraulicJumpCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Downstream conjugate depth/,
    )

    assert.match(
      csv,
      /Momentum closure residual/,
    )

    assert.match(
      csv,
      /Specific energy loss/,
    )

    assert.match(
      csv,
      /Hydraulic power dissipated/,
    )
  },
)
