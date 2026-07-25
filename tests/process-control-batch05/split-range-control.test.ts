import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProcessControlBatch05CalculationError,
  calculateSplitRangeControl,
} from '../../src/features/process-control/batch05/engine.ts'

test('maps demand into the first-valve region', () => {
  const result = calculateSplitRangeControl({
    controllerDemandPercent: 25,
    splitPointPercent: 50,
    overlapBandPercent: 0,
    firstValveMinimumPercent: 0,
    firstValveMaximumPercent: 100,
    secondValveMinimumPercent: 0,
    secondValveMaximumPercent: 100,
  })
  assert.equal(result.firstValveOpeningPercent, 50)
  assert.equal(result.secondValveOpeningPercent, 0)
})

test('opens both valves in an overlap region', () => {
  const result = calculateSplitRangeControl({
    controllerDemandPercent: 50,
    splitPointPercent: 50,
    overlapBandPercent: 20,
    firstValveMinimumPercent: 0,
    firstValveMaximumPercent: 100,
    secondValveMinimumPercent: 0,
    secondValveMaximumPercent: 100,
  })
  assert.ok(result.firstValveOpeningPercent > 0)
  assert.ok(result.secondValveOpeningPercent > 0)
  assert.equal(result.simultaneousOperation, true)
})

test('rejects an invalid valve span', () => {
  assert.throws(
    () => calculateSplitRangeControl({
      controllerDemandPercent: 50,
      splitPointPercent: 50,
      overlapBandPercent: 0,
      firstValveMinimumPercent: 100,
      firstValveMaximumPercent: 0,
      secondValveMinimumPercent: 0,
      secondValveMaximumPercent: 100,
    }),
    (error: unknown) =>
      error instanceof ProcessControlBatch05CalculationError &&
      error.code === 'invalidSplitRangeSettings',
  )
})
