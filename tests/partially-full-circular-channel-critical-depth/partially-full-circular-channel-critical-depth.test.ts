import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelCriticalDepthError,
  calculatePartiallyFullCircularChannelCriticalDepth,
  createPartiallyFullCircularChannelCriticalDepthCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/engine.ts'

const CALCULATOR_ID =
  'partiallyFullCircularChannelCriticalDepth'

const input = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    1.2,

  fluidDensity:
    998,
}

const g =
  9.80665

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


function specificEnergyAtDepth(
  diameter: number,
  flowRate: number,
  depth: number,
): number {
  const radius =
    diameter /
    2

  const theta =
    2 *
    Math.acos(
      (
        radius -
        depth
      ) /
      radius,
    )

  const area =
    radius *
    radius /
    2 *
    (
      theta -
      Math.sin(
        theta,
      )
    )

  const velocity =
    flowRate /
    area

  return (
    depth +
    velocity *
    velocity /
    (
      2 *
      g
    )
  )
}


test(
  'solves circular-channel critical-depth reference case',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'partiallyFullCircularChannelCriticalDepth',
    )

    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.5959470554300639,
      2e-10,
    )

    closeTo(
      result.criticalDepthRatio,
      0.4966225461917199,
      2e-10,
    )

    closeTo(
      result.centralAngleDegrees,
      179.22593871848628,
      2e-9,
    )
  },
)


test(
  'critical geometry matches independent circular-segment values',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    closeTo(
      result.criticalFlowArea,
      0.5606231811486733,
      2e-10,
    )

    closeTo(
      result.criticalTopWidth,
      1.1999726224215501,
      2e-10,
    )

    closeTo(
      result.criticalWettedPerimeter,
      1.8768496413691034,
      2e-10,
    )

    closeTo(
      result.criticalHydraulicRadius,
      0.29870436543852075,
      2e-10,
    )

    closeTo(
      result.criticalHydraulicDepth,
      0.46719664321785376,
      2e-10,
    )
  },
)


test(
  'critical Froude number and wave-speed closure equal unity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    closeTo(
      result.criticalFroudeNumber,
      1,
      1e-10,
    )

    closeTo(
      result.criticalVelocity,
      2.1404751718280597,
      2e-10,
    )

    closeTo(
      result.criticalWaveCelerity,
      2.1404751718280606,
      2e-10,
    )

    closeTo(
      result.criticalVelocity,
      result.criticalWaveCelerity,
      1e-10,
    )
  },
)


test(
  'critical condition Q squared T over g A cubed closes to one',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    const condition =
      (
        input.volumetricFlowRate *
        input.volumetricFlowRate *
        result.criticalTopWidth
      ) /
      (
        g *
        result.criticalFlowArea *
        result.criticalFlowArea *
        result.criticalFlowArea
      )

    closeTo(
      condition,
      1,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.criticalConditionResidual,
      ) <
      1e-10,
    )
  },
)


test(
  'critical depth corresponds to minimum specific energy',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    closeTo(
      result.criticalSpecificEnergy,
      0.8295453770389906,
      2e-10,
    )

    const lowerEnergy =
      specificEnergyAtDepth(
        input.pipeDiameter,
        input.volumetricFlowRate,
        result.criticalDepth -
        0.01,
      )

    const upperEnergy =
      specificEnergyAtDepth(
        input.pipeDiameter,
        input.volumetricFlowRate,
        result.criticalDepth +
        0.01,
      )

    assert.ok(
      lowerEnergy >
      result.criticalSpecificEnergy,
    )

    assert.ok(
      upperEnergy >
      result.criticalSpecificEnergy,
    )
  },
)


test(
  'lower discharge produces a shallower critical depth',
  () => {
    const base =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    const lowerFlow =
      calculatePartiallyFullCircularChannelCriticalDepth({
        ...input,

        volumetricFlowRate:
          0.6,
      })

    closeTo(
      lowerFlow.criticalDepth,
      0.41526533730881154,
      2e-10,
    )

    assert.ok(
      lowerFlow.criticalDepth <
      base.criticalDepth,
    )
  },
)


test(
  'higher discharge produces a deeper critical depth',
  () => {
    const base =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    const higherFlow =
      calculatePartiallyFullCircularChannelCriticalDepth({
        ...input,

        volumetricFlowRate:
          1.8,
      })

    closeTo(
      higherFlow.criticalDepth,
      0.7367284485085328,
      2e-10,
    )

    assert.ok(
      higherFlow.criticalDepth >
      base.criticalDepth,
    )
  },
)


test(
  'reports discharge per unit top width and mass flow',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    closeTo(
      result.dischargePerUnitTopWidth,
      1.0000228151692283,
      2e-10,
    )

    closeTo(
      result.massFlowRate,
      1197.6,
      1e-10,
    )
  },
)


test(
  'density changes mass flow but not critical hydraulics',
  () => {
    const base =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    const denser =
      calculatePartiallyFullCircularChannelCriticalDepth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.criticalDepth,
      base.criticalDepth,
      1e-12,
    )

    closeTo(
      denser.criticalSpecificEnergy,
      base.criticalSpecificEnergy,
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
  'rejects non-positive discharge',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelCriticalDepth({
          ...input,

          volumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelCriticalDepthError &&
        error.code ===
          'INVALID_FLOW_RATE',
    )
  },
)


test(
  'rejects non-positive diameter',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelCriticalDepth({
          ...input,

          pipeDiameter:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelCriticalDepthError &&
        error.code ===
          'INVALID_DIAMETER',
    )
  },
)


test(
  'exports critical circular-channel state as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalDepth(
        input,
      )

    const csv =
      createPartiallyFullCircularChannelCriticalDepthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Critical depth ratio/,
    )

    assert.match(
      csv,
      /Critical wave celerity/,
    )

    assert.match(
      csv,
      /Minimum specific energy/,
    )

    assert.match(
      csv,
      /Critical-condition residual/,
    )
  },
)
