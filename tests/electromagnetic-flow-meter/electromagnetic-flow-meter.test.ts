import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ElectromagneticFlowMeterError,
  calculateElectromagneticFlowMeter,
  createElectromagneticFlowMeterCsv,
} from '../../src/features/fluid-mechanics/electromagnetic-flow-meter/engine.ts'

const CALCULATOR_ID =
  'electromagneticFlowMeter'

const input = {
  pipeDiameter:
    0.10,

  electrodeSpacing:
    0.10,

  magneticFluxDensity:
    0.20,

  inducedVoltageMillivolts:
    40,

  calibrationFactor:
    1,

  fluidDensity:
    998,

  dynamicViscosity:
    0.001,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-9,
): void {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  )
}

test(
  'calculates velocity from Faraday induced voltage',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'electromagneticFlowMeter',
    )

    const result =
      calculateElectromagneticFlowMeter(
        input,
      )

    closeTo(
      result.fluidVelocity,
      2,
      1e-14,
    )

    closeTo(
      result.inducedVoltage,
      0.04,
      1e-14,
    )
  },
)

test(
  'calculates volumetric and mass flow',
  () => {
    const result =
      calculateElectromagneticFlowMeter(
        input,
      )

    const expectedArea =
      Math.PI *
      0.1 *
      0.1 /
      4

    const expectedFlow =
      expectedArea *
      2

    closeTo(
      result.pipeCrossSectionalArea,
      expectedArea,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRate,
      expectedFlow,
      1e-15,
    )

    closeTo(
      result.massFlowRate,
      expectedFlow *
      998,
      1e-12,
    )
  },
)

test(
  'reports Reynolds number and turbulent regime',
  () => {
    const result =
      calculateElectromagneticFlowMeter(
        input,
      )

    closeTo(
      result.reynoldsNumber,
      199600,
      1e-8,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'closes the Faraday voltage relation',
  () => {
    const result =
      calculateElectromagneticFlowMeter(
        input,
      )

    closeTo(
      result.reconstructedVoltageMillivolts,
      input.inducedVoltageMillivolts,
      1e-12,
    )

    closeTo(
      result.voltageClosureResidual,
      0,
      1e-14,
    )
  },
)

test(
  'doubling induced voltage doubles velocity and flow',
  () => {
    const base =
      calculateElectromagneticFlowMeter(
        input,
      )

    const doubled =
      calculateElectromagneticFlowMeter({
        ...input,

        inducedVoltageMillivolts:
          input.inducedVoltageMillivolts *
          2,
      })

    closeTo(
      doubled.fluidVelocity /
      base.fluidVelocity,
      2,
      1e-12,
    )

    closeTo(
      doubled.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'doubling magnetic field halves velocity for fixed voltage',
  () => {
    const base =
      calculateElectromagneticFlowMeter(
        input,
      )

    const strongerField =
      calculateElectromagneticFlowMeter({
        ...input,

        magneticFluxDensity:
          input.magneticFluxDensity *
          2,
      })

    closeTo(
      strongerField.fluidVelocity /
      base.fluidVelocity,
      0.5,
      1e-12,
    )
  },
)

test(
  'doubling electrode spacing halves velocity for fixed voltage',
  () => {
    const base =
      calculateElectromagneticFlowMeter(
        input,
      )

    const widerSpacing =
      calculateElectromagneticFlowMeter({
        ...input,

        electrodeSpacing:
          input.electrodeSpacing *
          2,
      })

    closeTo(
      widerSpacing.fluidVelocity /
      base.fluidVelocity,
      0.5,
      1e-12,
    )
  },
)

test(
  'rejects zero magnetic flux density',
  () => {
    assert.throws(
      () =>
        calculateElectromagneticFlowMeter({
          ...input,

          magneticFluxDensity:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          ElectromagneticFlowMeterError &&
        error.code ===
          'INVALID_MAGNETIC_FLUX_DENSITY',
    )
  },
)

test(
  'rejects invalid calibration factor',
  () => {
    assert.throws(
      () =>
        calculateElectromagneticFlowMeter({
          ...input,

          calibrationFactor:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          ElectromagneticFlowMeterError &&
        error.code ===
          'INVALID_CALIBRATION_FACTOR',
    )
  },
)

test(
  'exports electromagnetic flow results as CSV',
  () => {
    const result =
      calculateElectromagneticFlowMeter(
        input,
      )

    const csv =
      createElectromagneticFlowMeterCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Fluid velocity/,
    )

    assert.match(
      csv,
      /Reconstructed voltage/,
    )

    assert.match(
      csv,
      /Voltage closure residual/,
    )
  },
)
