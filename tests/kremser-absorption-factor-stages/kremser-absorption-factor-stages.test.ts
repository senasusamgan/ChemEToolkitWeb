import assert from 'node:assert/strict'
import test from 'node:test'

import {
  KremserAbsorptionError,
  calculateKremserAbsorption,
  createKremserAbsorptionCsv,
} from '../../src/features/separation-processes/kremser-absorption-factor-stages/engine.ts'

const CALCULATOR_ID =
  'kremserAbsorptionFactorStages'

const input = {
  inletGasSoluteMoleFraction: 0.12,
  targetOutletGasSoluteMoleFraction: 0.015,
  absorptionFactor: 1.8,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-10,
): void {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
  )
}

test(
  'calculates Kremser continuous and integer ideal-stage requirement',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'kremserAbsorptionFactorStages',
    )

    const result =
      calculateKremserAbsorption(
        input,
      )

    closeTo(
      result.exactIdealStageRequirement,
      2.405112976735224,
    )

    assert.equal(
      result.requiredIdealStages,
      3,
    )

    assert.equal(
      result.operatingRegime,
      'favorable',
    )
  },
)

test(
  'predicts outlet composition after integer stage rounding',
  () => {
    const result =
      calculateKremserAbsorption(
        input,
      )

    closeTo(
      result.predictedOutletMoleFraction,
      0.010107816711590296,
    )

    assert.ok(
      result.predictedOutletMoleFraction <
      input.targetOutletGasSoluteMoleFraction,
    )
  },
)

test(
  'uses the unity absorption-factor limit',
  () => {
    const result =
      calculateKremserAbsorption({
        inletGasSoluteMoleFraction: 0.1,
        targetOutletGasSoluteMoleFraction: 0.02,
        absorptionFactor: 1,
      })

    closeTo(
      result.exactIdealStageRequirement,
      4,
    )

    assert.equal(
      result.requiredIdealStages,
      4,
    )

    assert.equal(
      result.operatingRegime,
      'unity',
    )
  },
)

test(
  'rejects an unattainable target when absorption factor is below unity',
  () => {
    assert.throws(
      () =>
        calculateKremserAbsorption({
          inletGasSoluteMoleFraction: 0.1,
          targetOutletGasSoluteMoleFraction: 0.03,
          absorptionFactor: 0.6,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          KremserAbsorptionError &&
        error.code ===
          'TARGET_NOT_ACHIEVABLE',
    )
  },
)

test(
  'rejects an invalid absorption composition window',
  () => {
    assert.throws(
      () =>
        calculateKremserAbsorption({
          ...input,
          targetOutletGasSoluteMoleFraction: 0.15,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          KremserAbsorptionError &&
        error.code ===
          'INVALID_COMPOSITION_WINDOW',
    )
  },
)

test(
  'exports Kremser absorption results as CSV',
  () => {
    const result =
      calculateKremserAbsorption(
        input,
      )

    const csv =
      createKremserAbsorptionCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Kremser Absorption Factor & Ideal Stages/,
    )

    assert.match(
      csv,
      /Required ideal stages/,
    )

    assert.match(
      csv,
      /Predicted outlet mole fraction/,
    )
  },
)
