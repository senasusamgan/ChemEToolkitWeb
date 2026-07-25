import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateLiquidControlValveSizing, ProcessControlBatch03CalculationError } from '../../src/features/process-control/batch03/engine.ts'

test('calculates required and design Cv', () => {
  const result = calculateLiquidControlValveSizing({ liquidFlowRateGpm: 250, liquidSpecificGravity: 0.9, upstreamPressurePsi: 80, downstreamPressurePsi: 50, installedValveCv: 55, designMarginPercent: 20 })
  const required = 250 * Math.sqrt(0.9 / 30)
  assert.ok(Math.abs(Number(result.headlineValue) - required) < 1e-12)
  assert.ok(Math.abs(Number(result.items[1].value) - 1.2 * required) < 1e-12)
})

test('installed Cv reproduces maximum flow', () => {
  const result = calculateLiquidControlValveSizing({ liquidFlowRateGpm: 100, liquidSpecificGravity: 1, upstreamPressurePsi: 60, downstreamPressurePsi: 35, installedValveCv: 20, designMarginPercent: 0 })
  assert.equal(result.items[4].value, 100)
})

test('rejects reversed pressures', () => {
  assert.throws(() => calculateLiquidControlValveSizing({ liquidFlowRateGpm: 100, liquidSpecificGravity: 1, upstreamPressurePsi: 20, downstreamPressurePsi: 30, installedValveCv: 20, designMarginPercent: 10 }), (error: unknown) => error instanceof ProcessControlBatch03CalculationError && error.code === 'invalidParameter')
})
