import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateFluidizedBedPressureDrop,
} from '../../src/features/fluid-mechanics/fluidized-bed-pressure-drop-check/engine.ts'

const calculatorId =
  'fluidizedBedPressureDropCheck'

test(
  `${calculatorId} calculates Ergun pressure drop and bed-weight threshold`,
  () => {
    const result =
      calculateFluidizedBedPressureDrop({
        particleDiameter:
          0.0005,

        particleSphericity:
          0.9,

        bedVoidage:
          0.45,

        bedHeight:
          0.6,

        particleDensity:
          1200,

        fluidDensity:
          1.2,

        dynamicViscosity:
          0.000018,

        superficialVelocity:
          0.08,

        gravity:
          9.80665,
      })

    assert.ok(
      Math.abs(
        result.viscousPressureGradient
        - 3540.923639689073,
      )
      < 1e-9,
    )

    assert.ok(
      Math.abs(
        result.inertialPressureGradient
        - 180.26520347508,
      )
      < 1e-9,
    )

    assert.ok(
      Math.abs(
        result.pressureDrop
        - 2232.7133058984914,
      )
      < 1e-9,
    )

    assert.ok(
      Math.abs(
        result.bedWeightPressureDrop
        - 3879.5499665999996,
      )
      < 1e-9,
    )

    assert.ok(
      Math.abs(
        result.fluidizationRatio
        - 0.575508325738931,
      )
      < 1e-12,
    )

    assert.equal(
      result.state,
      'below-threshold',
    )
  },
)

test(
  `${calculatorId} identifies pressure demand above the fluidization threshold`,
  () => {
    const result =
      calculateFluidizedBedPressureDrop({
        particleDiameter:
          0.0005,

        particleSphericity:
          0.9,

        bedVoidage:
          0.45,

        bedHeight:
          0.6,

        particleDensity:
          1200,

        fluidDensity:
          1.2,

        dynamicViscosity:
          0.000018,

        superficialVelocity:
          0.14,

        gravity:
          9.80665,
      })

    assert.ok(
      result.fluidizationRatio
      > 1,
    )

    assert.equal(
      result.state,
      'at-or-above-threshold',
    )
  },
)

test(
  `${calculatorId} rejects invalid bed voidage`,
  () => {
    assert.throws(
      () =>
        calculateFluidizedBedPressureDrop({
          particleDiameter:
            0.0005,

          particleSphericity:
            0.9,

          bedVoidage:
            1,

          bedHeight:
            0.6,

          particleDensity:
            1200,

          fluidDensity:
            1.2,

          dynamicViscosity:
            0.000018,

          superficialVelocity:
            0.08,

          gravity:
            9.80665,
        }),
      /Bed voidage must lie strictly between zero and one/,
    )
  },
)
