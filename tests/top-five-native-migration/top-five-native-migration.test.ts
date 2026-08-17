import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TopFiveCalculatorError,
  calculateTopFiveCalculator,
} from '../../src/features/native-migrations/top-five-native/engine.ts'

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
  'heatExchangerEnergyBalance preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateTopFiveCalculator(
        'heatExchangerEnergyBalance',
        {
          massFlow: 2.5,
          heatCapacity: 4.18,
          inletTemperature: 90,
          outletTemperature: 55,
        },
      ),
      365.75,
      1e-12,
    )
  },
)

test(
  'activationEnergyTwoPoint preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateTopFiveCalculator(
        'activationEnergyTwoPoint',
        {
          rateConstantOne:
            0.015,
          temperatureOne:
            300,
          rateConstantTwo:
            0.085,
          temperatureTwo:
            340,
        },
      ),
      36776.80286202776,
      1e-8,
    )
  },
)

test(
  'adiabaticMixingTemperature preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateTopFiveCalculator(
        'adiabaticMixingTemperature',
        {
          flowOne: 2,
          cpOne: 4.18,
          temperatureOne: 80,
          flowTwo: 3,
          cpTwo: 4.18,
          temperatureTwo: 20,
        },
      ),
      44,
      1e-12,
    )
  },
)

test(
  'doublePipeHeatExchanger preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateTopFiveCalculator(
        'doublePipeHeatExchanger',
        {
          coefficient: 420,
          area: 12,
          hotIn: 150,
          hotOut: 90,
          coldIn: 25,
          coldOut: 70,
        },
      ),
      364092.8110175042,
      1e-7,
    )
  },
)

test(
  'dryerBalance preserves legacy numerical behavior',
  () => {
    closeTo(
      calculateTopFiveCalculator(
        'dryerBalance',
        {
          wetFeed: 1000,
          feedMoisture:
            0.30,
          productMoisture:
            0.05,
        },
      ),
      263.1578947368421,
      1e-10,
    )
  },
)

test(
  'rejects equal Arrhenius temperatures',
  () => {
    assert.throws(
      () =>
        calculateTopFiveCalculator(
          'activationEnergyTwoPoint',
          {
            rateConstantOne:
              0.015,
            temperatureOne:
              300,
            rateConstantTwo:
              0.085,
            temperatureTwo:
              300,
          },
        ),
      TopFiveCalculatorError,
    )
  },
)

test(
  'rejects invalid dryer moisture direction',
  () => {
    assert.throws(
      () =>
        calculateTopFiveCalculator(
          'dryerBalance',
          {
            wetFeed:
              1000,
            feedMoisture:
              0.10,
            productMoisture:
              0.20,
          },
        ),
      TopFiveCalculatorError,
    )
  },
)
