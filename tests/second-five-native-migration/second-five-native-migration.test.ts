import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SecondFiveCalculatorError,
  calculateSecondFiveCalculator,
} from '../../src/features/native-migrations/second-five-legacy/engine.ts'

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-9,
) {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  )
}

test(
  'evaporatorBalance preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateSecondFiveCalculator(
        'evaporatorBalance',
        {
          feed: 1000,
          feedSolids: 0.12,
          productSolids: 0.40,
        },
      ),
      700,
    )
  },
)

test(
  'massBalance preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateSecondFiveCalculator(
        'massBalance',
        {
          feed: 1250,
          product: 930,
        },
      ),
      320,
    )
  },
)

test(
  'phaseChangeEnergyBalance preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateSecondFiveCalculator(
        'phaseChangeEnergyBalance',
        {
          massFlow: 0.75,
          latentHeat: 2257,
        },
      ),
      1692.75,
    )
  },
)

test(
  'sensibleHeatBalance preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateSecondFiveCalculator(
        'sensibleHeatBalance',
        {
          massFlow: 2.4,
          heatCapacity: 4.18,
          temperatureIn: 25,
          temperatureOut: 80,
        },
      ),
      551.76,
      1e-10,
    )
  },
)

test(
  'flowRate preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateSecondFiveCalculator(
        'flowRate',
        {
          diameter: 0.10,
          velocity: 2.0,
          density: 998.2,
        },
      ),
      15.679688934066661,
      1e-12,
    )
  },
)

test(
  'mass balance rejects product above feed',
  () => {
    assert.throws(
      () =>
        calculateSecondFiveCalculator(
          'massBalance',
          {
            feed: 100,
            product: 120,
          },
        ),
      SecondFiveCalculatorError,
    )
  },
)

test(
  'evaporator rejects invalid concentration direction',
  () => {
    assert.throws(
      () =>
        calculateSecondFiveCalculator(
          'evaporatorBalance',
          {
            feed: 1000,
            feedSolids: 0.40,
            productSolids: 0.12,
          },
        ),
      SecondFiveCalculatorError,
    )
  },
)
