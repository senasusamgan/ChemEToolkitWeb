import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PriorityTenCalculatorError,
  calculatePriorityTenCalculator,
} from '../../src/features/native-migrations/priority-ten-legacy/engine.ts'

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-8,
) {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  )
}

test('bernoulliEquation', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'bernoulliEquation',
      {
        pressure: 200000,
        density: 998.2,
        velocity: 3,
        elevation: 8,
      },
    ),
    28.889972535830612,
  )
})

test('binarySeparatorBalance', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'binarySeparatorBalance',
      {
        feedFlow: 1000,
        feedFraction: 0.40,
        distillateFraction: 0.90,
        bottomsFraction: 0.10,
      },
    ),
    375,
  )
})

test('boilingHeatTransfer', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'boilingHeatTransfer',
      {
        coefficient: 6500,
        surfaceTemperature: 112,
        saturationTemperature: 100,
        area: 0.8,
      },
    ),
    62400,
  )
})

test('bypassMixingBalance', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'bypassMixingBalance',
      {
        feedProperty: 20,
        processedProperty: 80,
        targetProperty: 50,
      },
    ),
    0.5,
  )
})

test('combustionAirRequirement', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'combustionAirRequirement',
      {
        fuelFlow: 100,
        carbonAtoms: 1,
        hydrogenAtoms: 4,
        oxygenAtoms: 0,
        excessAir: 15,
      },
    ),
    1095.2380952380952,
  )
})

test('condensationHeatTransfer', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'condensationHeatTransfer',
      {
        liquidDensity: 958,
        vaporDensity: 0.60,
        latentHeat: 2257000,
        conductivity: 0.68,
        viscosity: 0.000282,
        plateLength: 1,
        temperatureDifference: 10,
      },
    ),
    6504.4247234400445,
    1e-7,
  )
})

test('condenserBalance', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'condenserBalance',
      {
        vaporFlow: 1200,
        vaporEnthalpy: 2750,
        liquidEnthalpy: 500,
      },
    ),
    2700000,
  )
})

test('convectionHeatTransfer', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'convectionHeatTransfer',
      {
        coefficient: 85,
        area: 2.4,
        surfaceTemperature: 95,
        fluidTemperature: 25,
      },
    ),
    14280,
  )
})

test('reactionPerformanceBalance', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'reactionPerformanceBalance',
      {
        reactantIn: 100,
        reactantOut: 25,
        desiredProduct: 60,
      },
    ),
    75,
  )
})

test('criticalDepth', () => {
  closeTo(
    calculatePriorityTenCalculator(
      'criticalDepth',
      {
        flowPerWidth: 2,
        gravity: 9.80665,
      },
    ),
    0.7416171628822089,
  )
})

test(
  'rejects invalid boiling direction',
  () => {
    assert.throws(
      () =>
        calculatePriorityTenCalculator(
          'boilingHeatTransfer',
          {
            coefficient: 6500,
            surfaceTemperature: 95,
            saturationTemperature: 100,
            area: 0.8,
          },
        ),
      PriorityTenCalculatorError,
    )
  },
)

test(
  'rejects invalid separator composition ordering',
  () => {
    assert.throws(
      () =>
        calculatePriorityTenCalculator(
          'binarySeparatorBalance',
          {
            feedFlow: 1000,
            feedFraction: 0.4,
            distillateFraction: 0.3,
            bottomsFraction: 0.1,
          },
        ),
      PriorityTenCalculatorError,
    )
  },
)
