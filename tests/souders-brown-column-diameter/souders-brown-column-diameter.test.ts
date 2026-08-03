import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SoudersBrownCalculationError,
  calculateSoudersBrownColumnDiameter,
  calculateSoudersBrownFloodingVelocity,
  createSoudersBrownColumnCsv,
} from '../../src/features/separation-processes/souders-brown-column-diameter/engine.ts'

const CALCULATOR_ID =
  'soudersBrownColumnDiameter'

const baseInput = {
  vaporVolumetricFlowRate:
    2,
  vaporDensity:
    2,
  liquidDensity:
    800,
  capacityFactor:
    0.11,
  designFloodFraction:
    0.8,
  downcomerAreaFraction:
    0.15,
  diameterIncrement:
    0.05,
}

test(
  `${CALCULATOR_ID} calculates the Souders Brown flooding velocity`,
  () => {
    const velocity =
      calculateSoudersBrownFloodingVelocity(
        baseInput,
      )

    assert.ok(
      Math.abs(
        velocity -
        2.1972482790981998,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates net area gross area and raw tower diameter',
  () => {
    const result =
      calculateSoudersBrownColumnDiameter(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .requiredNetArea -
        1.1377867598221791,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .requiredGrossArea -
        1.3385726586143285,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .rawColumnDiameter -
        1.3054974693384296,
      ) <
        1e-12,
    )
  },
)

test(
  'rounds the tower diameter upward and reconstructs actual flooding',
  () => {
    const result =
      calculateSoudersBrownColumnDiameter(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .roundedColumnDiameter -
        1.35,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .actualVaporVelocity -
        1.6438176967451466,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .actualFloodFraction -
        0.7481256043672071,
      ) <
        1e-12,
    )

    assert.ok(
      result
        .selectedScenario
        .capacityMarginPercent >
      25,
    )
  },
)

test(
  'calculates vapor mass flow and F factor',
  () => {
    const result =
      calculateSoudersBrownColumnDiameter(
        baseInput,
      )

    assert.equal(
      result.vaporMassFlowRate,
      4,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .vaporFfactor -
        2.32470928080589,
      ) <
        1e-12,
    )
  },
)

test(
  'creates hydraulic sensitivity scenarios',
  () => {
    const result =
      calculateSoudersBrownColumnDiameter(
        baseInput,
      )

    assert.deepEqual(
      result.scenarios.map(
        (
          scenario,
        ) =>
          scenario.designFloodFraction,
      ),
      [
        0.7,
        0.8,
        0.85,
        0.9,
      ],
    )

    assert.ok(
      result.scenarios[
        result.scenarios.length -
        1
      ].rawColumnDiameter <
      result.scenarios[0]
        .rawColumnDiameter,
    )
  },
)

test(
  'rejects invalid densities and hydraulic fractions',
  () => {
    assert.throws(
      () =>
        calculateSoudersBrownColumnDiameter({
          ...baseInput,
          liquidDensity:
            1,
        }),
      (
        error,
      ) =>
        error instanceof
          SoudersBrownCalculationError &&
        error.code ===
          'invalidDensityOrder',
    )

    assert.throws(
      () =>
        calculateSoudersBrownColumnDiameter({
          ...baseInput,
          designFloodFraction:
            1,
        }),
      (
        error,
      ) =>
        error instanceof
          SoudersBrownCalculationError &&
        error.code ===
          'invalidFloodFraction',
    )

    assert.throws(
      () =>
        calculateSoudersBrownColumnDiameter({
          ...baseInput,
          downcomerAreaFraction:
            0.5,
        }),
      (
        error,
      ) =>
        error instanceof
          SoudersBrownCalculationError &&
        error.code ===
          'invalidDowncomerFraction',
    )
  },
)

test(
  'exports column sizing and sensitivity results as CSV',
  () => {
    const result =
      calculateSoudersBrownColumnDiameter(
        baseInput,
      )

    const csv =
      createSoudersBrownColumnCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Flooding velocity, m/s"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Rounded column diameter, m"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Capacity margin, percent"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Design flood fraction"',
      ),
    )
  },
)
