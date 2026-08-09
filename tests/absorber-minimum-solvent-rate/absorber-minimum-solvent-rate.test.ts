import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AbsorberMinimumSolventRateError,
  calculateAbsorberMinimumSolventRate,
  createAbsorberMinimumSolventRateCsv,
} from '../../src/features/separation-processes/absorber-minimum-solvent-rate/engine.ts'

const CALCULATOR_ID =
  'absorberMinimumSolventRate'

const input = {
  gasMolarFlowRate: 100,
  inletGasSoluteMoleFraction: 0.1,
  outletGasSoluteMoleFraction: 0.02,
  inletLiquidSoluteMoleFraction: 0.005,
  equilibriumSlope: 1.5,
  solventDesignFactor: 1.5,
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
  'calculates absorber minimum solvent rate from the bottom pinch',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'absorberMinimumSolventRate',
    )

    const result =
      calculateAbsorberMinimumSolventRate(
        input,
      )

    closeTo(
      result.pinchLiquidMoleFraction,
      0.06666666666666667,
    )

    closeTo(
      result.minimumLiquidToGasRatio,
      1.2972972972972974,
    )

    closeTo(
      result.minimumSolventMolarFlowRate,
      129.72972972972974,
    )
  },
)

test(
  'calculates design solvent flow and absorption factor',
  () => {
    const result =
      calculateAbsorberMinimumSolventRate(
        input,
      )

    closeTo(
      result.designSolventMolarFlowRate,
      194.5945945945946,
    )

    closeTo(
      result.designLiquidToGasRatio,
      1.945945945945946,
    )

    closeTo(
      result.designAbsorptionFactor,
      1.2972972972972974,
    )

    assert.equal(
      result.status,
      'above-minimum',
    )
  },
)

test(
  'calculates absorber operating-line quantities',
  () => {
    const result =
      calculateAbsorberMinimumSolventRate(
        input,
      )

    closeTo(
      result.outletLiquidSoluteMoleFraction,
      0.0461111111111111,
    )

    closeTo(
      result.operatingLineIntercept,
      0.01027027027027027,
    )

    closeTo(
      result.bottomDrivingForce,
      0.03083333333333335,
    )
  },
)

test(
  'identifies operation exactly at minimum solvent rate',
  () => {
    const result =
      calculateAbsorberMinimumSolventRate({
        ...input,
        solventDesignFactor: 1,
      })

    assert.equal(
      result.status,
      'minimum',
    )

    closeTo(
      result.bottomDrivingForce,
      0,
      1e-12,
    )
  },
)

test(
  'rejects an invalid absorber pinch condition',
  () => {
    assert.throws(
      () =>
        calculateAbsorberMinimumSolventRate({
          ...input,
          inletLiquidSoluteMoleFraction: 0.08,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          AbsorberMinimumSolventRateError &&
        error.code ===
          'INVALID_PINCH_CONDITION',
    )
  },
)

test(
  'rejects solvent design factors below minimum',
  () => {
    assert.throws(
      () =>
        calculateAbsorberMinimumSolventRate({
          ...input,
          solventDesignFactor: 0.9,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          AbsorberMinimumSolventRateError &&
        error.code ===
          'INVALID_DESIGN_FACTOR',
    )
  },
)

test(
  'exports absorber minimum solvent results as CSV',
  () => {
    const result =
      calculateAbsorberMinimumSolventRate(
        input,
      )

    const csv =
      createAbsorberMinimumSolventRateCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Absorber Minimum Solvent Rate & Operating Line/,
    )

    assert.match(
      csv,
      /Minimum solvent molar flow rate/,
    )

    assert.match(
      csv,
      /Design absorption factor/,
    )
  },
)
