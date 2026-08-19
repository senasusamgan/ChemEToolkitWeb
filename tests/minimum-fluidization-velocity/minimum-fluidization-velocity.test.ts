import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateMinimumFluidizationVelocity,
} from '../../src/features/fluid-mechanics/minimum-fluidization-velocity/engine.ts'

const calculatorId =
  'minimumFluidizationVelocity'

test(
  `${calculatorId} reproduces the Wen-Yu example calculation`,
  () => {
    const result =
      calculateMinimumFluidizationVelocity({
        particleDiameter:
          0.0005,

        particleDensity:
          1200,

        fluidDensity:
          1.2,

        dynamicViscosity:
          0.000018,

        gravity:
          9.80665,
      })

    assert.ok(
      Math.abs(
        result.archimedesNumber
        - 5442.69075,
      )
      < 1e-6,
    )

    assert.ok(
      Math.abs(
        result.minimumFluidizationReynoldsNumber
        - 3.1476835445594915,
      )
      < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.minimumFluidizationVelocity
        - 0.09443050633678475,
      )
      < 1e-12,
    )
  },
)

test(
  `${calculatorId} rejects nonphysical density ordering`,
  () => {
    assert.throws(
      () =>
        calculateMinimumFluidizationVelocity({
          particleDiameter:
            0.0005,

          particleDensity:
            1,

          fluidDensity:
            1.2,

          dynamicViscosity:
            0.000018,

          gravity:
            9.80665,
        }),
      /Particle density must exceed fluid density/,
    )
  },
)

test(
  `${calculatorId} rejects zero or negative physical inputs`,
  () => {
    assert.throws(
      () =>
        calculateMinimumFluidizationVelocity({
          particleDiameter:
            0,

          particleDensity:
            1200,

          fluidDensity:
            1.2,

          dynamicViscosity:
            0.000018,

          gravity:
            9.80665,
        }),
      /greater than zero/,
    )
  },
)
