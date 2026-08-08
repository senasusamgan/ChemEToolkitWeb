import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PackedColumnGasLoadError,
  calculatePackedColumnGasLoad,
  createPackedColumnGasLoadCsv,
} from '../../src/features/separation-processes/packed-column-gas-load-f-factor/engine.ts'

const CALCULATOR_ID =
  'packedColumnGasLoadFFactor'

const exampleInput = {
  gasVolumetricFlowRate: 2.5,
  columnDiameter: 1.8,
  gasDensity: 3.2,
  minimumOperatingFFactor: 1,
  maximumDesignFFactor: 2.2,
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
    `Expected ${actual} to be close to ${expected}.`,
  )
}

test(
  'calculates packed-column gas-flow geometry',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'packedColumnGasLoadFFactor',
    )

    const result =
      calculatePackedColumnGasLoad(
        exampleInput,
      )

    closeTo(
      result.columnArea,
      2.5446900494077327,
    )

    closeTo(
      result.selectedScenario
        .superficialGasVelocity,
      0.9824379203203415,
    )
  },
)

test(
  'calculates gas load mass flux F-factor and kinetic pressure',
  () => {
    const result =
      calculatePackedColumnGasLoad(
        exampleInput,
      )

    closeTo(
      result.selectedScenario
        .gasMassFlowRate,
      8,
    )

    closeTo(
      result.selectedScenario
        .gasMassFlux,
      3.143801345025093,
    )

    closeTo(
      result.selectedScenario
        .fFactor,
      1.7574383788078445,
    )

    closeTo(
      result.selectedScenario
        .kineticPressure,
      1.5442948276533723,
    )
  },
)

test(
  'calculates minimum and maximum gas-flow limits from F-factor',
  () => {
    const result =
      calculatePackedColumnGasLoad(
        exampleInput,
      )

    closeTo(
      result.minimumGasFlowByFFactor,
      1.4225249830357471,
    )

    closeTo(
      result.maximumGasFlowByFFactor,
      3.129554962678644,
    )

    assert.equal(
      result.selectedScenario.status,
      'stable',
    )
  },
)

test(
  'classifies gas-load operating scenarios',
  () => {
    const result =
      calculatePackedColumnGasLoad(
        exampleInput,
      )

    assert.deepEqual(
      result.scenarios.map(
        scenario =>
          scenario.status,
      ),
      [
        'underloaded',
        'stable',
        'stable',
        'marginal',
        'overloaded',
        'overloaded',
      ],
    )
  },
)

test(
  'rejects an invalid F-factor operating window',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnGasLoad({
          ...exampleInput,
          minimumOperatingFFactor: 2.5,
          maximumDesignFFactor: 2,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PackedColumnGasLoadError &&
        error.code ===
          'INVALID_F_FACTOR_WINDOW',
    )
  },
)

test(
  'rejects invalid gas hydraulic inputs',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnGasLoad({
          ...exampleInput,
          gasDensity: 0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PackedColumnGasLoadError &&
        error.code ===
          'INVALID_GAS_DENSITY',
    )
  },
)

test(
  'exports packed-column gas-load scenarios as CSV',
  () => {
    const result =
      calculatePackedColumnGasLoad(
        exampleInput,
      )

    const csv =
      createPackedColumnGasLoadCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Packed Column Gas Load & F-Factor Operating Window/,
    )

    assert.match(
      csv,
      /Superficial velocity/,
    )

    assert.match(
      csv,
      /F-factor/,
    )

    assert.match(
      csv,
      /overloaded/,
    )
  },
)
