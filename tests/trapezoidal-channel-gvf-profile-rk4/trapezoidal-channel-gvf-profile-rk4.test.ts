import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelGvfProfileRk4Error,
  calculateTrapezoidalChannelGvfProfileRk4,
  createTrapezoidalChannelGvfProfileRk4Csv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelGvfProfileRk4'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  manningRoughness:
    0.015,

  channelSlope:
    0.0015,

  initialFlowDepth:
    1.2,

  downstreamReachLength:
    100,

  integrationSteps:
    100,

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
  'integrates a trapezoidal GVF profile using RK4',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelGvfProfileRk4',
    )

    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605118,
      1e-8,
    )

    closeTo(
      result.normalDepth,
      0.9361220828666974,
      1e-8,
    )

    closeTo(
      result.finalFlowDepth,
      1.3195034477124845,
      1e-9,
    )

    closeTo(
      result.depthChange,
      0.1195034477124845,
      1e-9,
    )
  },
)

test(
  'preserves the M1 profile classification across the reach',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    assert.equal(
      result.channelSlopeClass,
      'mild',
    )

    assert.equal(
      result.startProfileClassification,
      'M1',
    )

    assert.equal(
      result.endProfileClassification,
      'M1',
    )

    assert.ok(
      result.finalFlowDepth >
      result.initialFlowDepth,
    )
  },
)

test(
  'calculates the downstream hydraulic state',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    closeTo(
      result.finalFlowArea,
      4.380096243950103,
      1e-9,
    )

    closeTo(
      result.finalVelocity,
      1.1415274280573455,
      1e-9,
    )

    closeTo(
      result.finalFroudeNumber,
      0.3751428690452469,
      1e-9,
    )

    closeTo(
      result.finalFrictionSlope,
      0.00041969195784183474,
      1e-12,
    )
  },
)

test(
  'integrates Manning friction head loss with RK4',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    closeTo(
      result.integratedFrictionHeadLoss,
      0.05050012832710545,
      1e-10,
    )

    closeTo(
      result.averageFrictionSlope,
      0.0005050012832710545,
      1e-12,
    )

    closeTo(
      result.energyGradeLineChange,
      -0.05050012832710545,
      1e-10,
    )
  },
)

test(
  'closes the finite-reach energy balance',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    closeTo(
      result.bedElevationChange,
      -0.15,
      1e-12,
    )

    closeTo(
      result.waterSurfaceElevationChange,
      -0.03049655228751544,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <=
      1e-10,
    )
  },
)

test(
  'returns one profile point per RK4 node',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    assert.equal(
      result.profilePoints.length,
      101,
    )

    closeTo(
      result.profilePoints[0].distance,
      0,
      1e-12,
    )

    closeTo(
      result.profilePoints.at(-1)!.distance,
      100,
      1e-12,
    )

    closeTo(
      result.profilePoints.at(-1)!.flowDepth,
      result.finalFlowDepth,
      1e-12,
    )
  },
)

test(
  'RK4 solution is stable under step refinement',
  () => {
    const coarse =
      calculateTrapezoidalChannelGvfProfileRk4({
        ...input,

        integrationSteps:
          20,
      })

    const fine =
      calculateTrapezoidalChannelGvfProfileRk4({
        ...input,

        integrationSteps:
          200,
      })

    closeTo(
      coarse.finalFlowDepth,
      fine.finalFlowDepth,
      5e-9,
    )

    closeTo(
      coarse.integratedFrictionHeadLoss,
      fine.integratedFrictionHeadLoss,
      5e-9,
    )
  },
)

test(
  'density changes mass flow and dissipated power but not the GVF profile',
  () => {
    const base =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    const denser =
      calculateTrapezoidalChannelGvfProfileRk4({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.finalFlowDepth,
      base.finalFlowDepth,
      1e-10,
    )

    closeTo(
      denser.integratedFrictionHeadLoss,
      base.integratedFrictionHeadLoss,
      1e-10,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
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
  'calculates reach hydraulic power dissipation',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    closeTo(
      result.massFlowRate,
      4990,
      1e-12,
    )

    closeTo(
      result.hydraulicPowerDissipated,
      2471.233046460453,
      1e-7,
    )
  },
)

test(
  'rejects non-integer integration step count',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelGvfProfileRk4({
          ...input,

          integrationSteps:
            10.5,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelGvfProfileRk4Error &&
        error.code ===
          'INVALID_INTEGRATION_STEPS',
    )
  },
)

test(
  'rejects zero downstream reach length',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelGvfProfileRk4({
          ...input,

          downstreamReachLength:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelGvfProfileRk4Error &&
        error.code ===
          'INVALID_REACH_LENGTH',
    )
  },
)

test(
  'exports the complete RK4 profile as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelGvfProfileRk4(
        input,
      )

    const csv =
      createTrapezoidalChannelGvfProfileRk4Csv(
        input,
        result,
      )

    assert.match(
      csv,
      /Integrated friction head loss/,
    )

    assert.match(
      csv,
      /Energy closure residual/,
    )

    assert.match(
      csv,
      /Profile Distance,Flow Depth,Froude Number/,
    )

    assert.match(
      csv,
      /100,1\.319/,
    )
  },
)
