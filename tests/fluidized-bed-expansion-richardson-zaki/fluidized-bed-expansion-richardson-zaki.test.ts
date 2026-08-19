import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateFluidizedBedExpansionRichardsonZaki,
  calculateRichardsonZakiExponent,
} from '../../src/features/fluid-mechanics/fluidized-bed-expansion-richardson-zaki/engine.ts'

const calculatorId =
  'fluidizedBedExpansionRichardsonZaki'

test(
  `${calculatorId} selects the Richardson-Zaki exponent across Reynolds regimes`,
  () => {
    assert.equal(
      calculateRichardsonZakiExponent(
        0.1,
      ),
      4.65,
    )

    assert.ok(
      Math.abs(
        calculateRichardsonZakiExponent(
          0.5,
        )
        - (
          4.4
          * 0.5 ** -0.03
        ),
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        calculateRichardsonZakiExponent(
          100,
        )
        - (
          4.4
          * 100 ** -0.1
        ),
      ) < 1e-12,
    )

    assert.equal(
      calculateRichardsonZakiExponent(
        1000,
      ),
      2.4,
    )
  },
)

test(
  `${calculatorId} predicts voidage and expanded bed height`,
  () => {
    const result =
      calculateFluidizedBedExpansionRichardsonZaki({
        particleDiameter:
          0.0003,
        fluidDensity:
          1.2,
        dynamicViscosity:
          0.000018,
        terminalVelocity:
          2,
        superficialVelocity:
          0.3,
        initialVoidage:
          0.42,
        initialBedHeight:
          0.6,
      })

    assert.ok(
      Math.abs(
        result.terminalReynoldsNumber
        - 40,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.richardsonZakiExponent
        - 3.0426127255974524,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.expandedVoidage
        - 0.5360559464608008,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.bedExpansionRatio
        - 1.2501507360110935,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.expandedBedHeight
        - 0.7500904416066561,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.bedExpansionPercent
        - 25.01507360110935,
      ) < 1e-12,
    )

    assert.equal(
      result.state,
      'expanded',
    )
  },
)

test(
  `${calculatorId} flags a predicted voidage below the supplied initial state`,
  () => {
    const result =
      calculateFluidizedBedExpansionRichardsonZaki({
        particleDiameter:
          0.0003,
        fluidDensity:
          1.2,
        dynamicViscosity:
          0.000018,
        terminalVelocity:
          2,
        superficialVelocity:
          0.05,
        initialVoidage:
          0.42,
        initialBedHeight:
          0.6,
      })

    assert.equal(
      result.state,
      'below-initial-state',
    )

    assert.ok(
      result.expandedBedHeight
      < 0.6,
    )
  },
)

test(
  `${calculatorId} rejects superficial velocity at or above terminal velocity`,
  () => {
    assert.throws(
      () =>
        calculateFluidizedBedExpansionRichardsonZaki({
          particleDiameter:
            0.0003,
          fluidDensity:
            1.2,
          dynamicViscosity:
            0.000018,
          terminalVelocity:
            2,
          superficialVelocity:
            2,
          initialVoidage:
            0.42,
          initialBedHeight:
            0.6,
        }),
      /Superficial velocity must remain below/,
    )
  },
)

test(
  `${calculatorId} rejects invalid initial bed voidage`,
  () => {
    assert.throws(
      () =>
        calculateFluidizedBedExpansionRichardsonZaki({
          particleDiameter:
            0.0003,
          fluidDensity:
            1.2,
          dynamicViscosity:
            0.000018,
          terminalVelocity:
            2,
          superficialVelocity:
            0.3,
          initialVoidage:
            1,
          initialBedHeight:
            0.6,
        }),
      /Initial bed voidage/,
    )
  },
)
