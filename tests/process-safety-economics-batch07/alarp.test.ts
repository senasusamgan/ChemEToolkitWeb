import assert from 'node:assert/strict'
import test from 'node:test'
import { Batch07Error, calculateALARP } from '../../src/features/process-safety-economics/batch07/engine.ts'

const example = {
  measureCost: 1_000_000,
  annualRiskReductionBenefit: 150_000,
  remainingLifeYears: 15,
  discountRateFraction: 0.08,
  grossDisproportionFactor: 3,
}

test('calculates discounted and adjusted benefit', () => {
  const result = calculateALARP(example)
  const factor = (1 - 1.08 ** -15) / 0.08
  assert.ok(Math.abs(result.presentValueOfRiskReductionBenefit - 150_000 * factor) < 1e-8)
  assert.ok(Math.abs(result.grossDisproportionAdjustedBenefit - result.presentValueOfRiskReductionBenefit * 3) < 1e-8)
})

test('identifies reasonably practicable measure', () => {
  const result = calculateALARP(example)
  assert.equal(result.reasonablyPracticable, true)
  assert.ok(result.costToAdjustedBenefitRatio < 1)
})

test('rejects non-integer remaining life', () => {
  assert.throws(
    () => calculateALARP({ ...example, remainingLifeYears: 15.5 }),
    (error: unknown) => error instanceof Batch07Error &&
      error.code === 'invalidALARPInputs',
  )
})
