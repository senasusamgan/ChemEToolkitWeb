import assert from 'node:assert/strict'
import test from 'node:test'

import {
  UltrasonicTransitTimeFlowMeterError,
  calculateUltrasonicTransitTimeFlowMeter,
  createUltrasonicTransitTimeFlowMeterCsv,
} from '../../src/features/fluid-mechanics/ultrasonic-transit-time-flow-meter/engine.ts'

const CALCULATOR_ID =
  'ultrasonicTransitTimeFlowMeter'

const pipeDiameter =
  0.10

const acousticPathLength =
  0.20

const acousticPathAngleDegrees =
  45

const fluidDensity =
  998

const dynamicViscosity =
  0.001

const knownAcousticVelocity =
  1480

function buildInputForVelocity(
  axialVelocity: number,
) {
  const angleRadians =
    acousticPathAngleDegrees *
    Math.PI /
    180

  const pathVelocity =
    axialVelocity *
    Math.cos(
      angleRadians,
    )

  const downstreamTime =
    acousticPathLength /
    (
      knownAcousticVelocity +
      pathVelocity
    )

  const upstreamTime =
    acousticPathLength /
    (
      knownAcousticVelocity -
      pathVelocity
    )

  return {
    pipeDiameter,

    acousticPathLength,

    acousticPathAngleDegrees,

    downstreamTransitTimeMicroseconds:
      downstreamTime *
      1e6,

    upstreamTransitTimeMicroseconds:
      upstreamTime *
      1e6,

    fluidDensity,

    dynamicViscosity,
  }
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
  'recovers known axial velocity from upstream and downstream transit times',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'ultrasonicTransitTimeFlowMeter',
    )

    const input =
      buildInputForVelocity(
        2.5,
      )

    const result =
      calculateUltrasonicTransitTimeFlowMeter(
        input,
      )

    closeTo(
      result.axialVelocity,
      2.5,
      1e-9,
    )

    closeTo(
      result.acousticVelocity,
      knownAcousticVelocity,
      1e-8,
    )
  },
)

test(
  'calculates pipe volumetric and mass flow',
  () => {
    const input =
      buildInputForVelocity(
        2.5,
      )

    const result =
      calculateUltrasonicTransitTimeFlowMeter(
        input,
      )

    const expectedArea =
      Math.PI *
      pipeDiameter *
      pipeDiameter /
      4

    const expectedFlow =
      expectedArea *
      2.5

    closeTo(
      result.pipeCrossSectionalArea,
      expectedArea,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRate,
      expectedFlow,
      1e-12,
    )

    closeTo(
      result.massFlowRate,
      expectedFlow *
      fluidDensity,
      1e-10,
    )
  },
)

test(
  'reconstructs both measured transit times',
  () => {
    const input =
      buildInputForVelocity(
        2.5,
      )

    const result =
      calculateUltrasonicTransitTimeFlowMeter(
        input,
      )

    closeTo(
      result.downstreamClosureResidual,
      0,
      1e-12,
    )

    closeTo(
      result.upstreamClosureResidual,
      0,
      1e-12,
    )
  },
)

test(
  'reports turbulent Reynolds number for reference case',
  () => {
    const result =
      calculateUltrasonicTransitTimeFlowMeter(
        buildInputForVelocity(
          2.5,
        ),
      )

    closeTo(
      result.reynoldsNumber,
      249500,
      1e-5,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'doubling the known velocity doubles calculated flow',
  () => {
    const first =
      calculateUltrasonicTransitTimeFlowMeter(
        buildInputForVelocity(
          1.5,
        ),
      )

    const second =
      calculateUltrasonicTransitTimeFlowMeter(
        buildInputForVelocity(
          3,
        ),
      )

    closeTo(
      second.axialVelocity /
      first.axialVelocity,
      2,
      1e-9,
    )

    closeTo(
      second.volumetricFlowRate /
      first.volumetricFlowRate,
      2,
      1e-9,
    )
  },
)

test(
  'doubling pipe diameter quadruples flow for identical measured velocity',
  () => {
    const input =
      buildInputForVelocity(
        2,
      )

    const first =
      calculateUltrasonicTransitTimeFlowMeter(
        input,
      )

    const second =
      calculateUltrasonicTransitTimeFlowMeter({
        ...input,

        pipeDiameter:
          input.pipeDiameter *
          2,
      })

    closeTo(
      second.axialVelocity,
      first.axialVelocity,
      1e-10,
    )

    closeTo(
      second.volumetricFlowRate /
      first.volumetricFlowRate,
      4,
      1e-10,
    )
  },
)

test(
  'rejects upstream time that is not greater than downstream time',
  () => {
    const input =
      buildInputForVelocity(
        2,
      )

    assert.throws(
      () =>
        calculateUltrasonicTransitTimeFlowMeter({
          ...input,

          upstreamTransitTimeMicroseconds:
            input.downstreamTransitTimeMicroseconds,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          UltrasonicTransitTimeFlowMeterError &&
        error.code ===
          'INVALID_TRANSIT_TIME_ORDER',
    )
  },
)

test(
  'rejects invalid acoustic path angle',
  () => {
    const input =
      buildInputForVelocity(
        2,
      )

    assert.throws(
      () =>
        calculateUltrasonicTransitTimeFlowMeter({
          ...input,

          acousticPathAngleDegrees:
            90,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          UltrasonicTransitTimeFlowMeterError &&
        error.code ===
          'INVALID_PATH_ANGLE',
    )
  },
)

test(
  'exports ultrasonic transit-time results as CSV',
  () => {
    const input =
      buildInputForVelocity(
        2.5,
      )

    const result =
      calculateUltrasonicTransitTimeFlowMeter(
        input,
      )

    const csv =
      createUltrasonicTransitTimeFlowMeterCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Axial fluid velocity/,
    )

    assert.match(
      csv,
      /Recovered acoustic velocity/,
    )

    assert.match(
      csv,
      /Transit-time difference/,
    )
  },
)
