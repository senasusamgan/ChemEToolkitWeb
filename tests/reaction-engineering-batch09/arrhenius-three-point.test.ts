import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ReactionEngineeringBatch09CalculationError,
  calculateArrheniusThreePointFit,
} from '../../src/features/reaction-engineering/batch09/engine.ts'

const gasConstant = 8.314462618
const activationEnergy = 50_000
const preExponentialFactor = 100_000

function rate(
  temperature: number,
): number {
  return (
    preExponentialFactor *
    Math.exp(
      -activationEnergy /
      (
        gasConstant *
        temperature
      ),
    )
  )
}

const example = {
  temperatureOne: 330,
  rateConstantOne: rate(330),
  temperatureTwo: 360,
  rateConstantTwo: rate(360),
  temperatureThree: 400,
  rateConstantThree: rate(400),
  targetTemperature: 380,
}

test('recovers exact Arrhenius parameters', () => {
  const result =
    calculateArrheniusThreePointFit(
      example,
    )

  assert.ok(
    Math.abs(
      result.activationEnergy -
      activationEnergy,
    ) < 1e-7,
  )

  assert.ok(
    Math.abs(
      result.preExponentialFactor -
      preExponentialFactor,
    ) <
    1e-5,
  )
})

test('predicts the target-temperature rate constant', () => {
  const result =
    calculateArrheniusThreePointFit(
      example,
    )

  assert.ok(
    Math.abs(
      result.predictedRateConstantAtTarget -
      rate(380),
    ) < 1e-12,
  )

  assert.ok(
    result.coefficientOfDetermination >
    0.999999999999,
  )
})

test('rejects duplicate temperatures', () => {
  assert.throws(
    () =>
      calculateArrheniusThreePointFit({
        ...example,
        temperatureThree: 360,
      }),
    (error: unknown) =>
      error instanceof
        ReactionEngineeringBatch09CalculationError &&
      error.code ===
        'duplicateArrheniusTemperatures',
  )
})
