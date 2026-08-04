import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrayDowncomerCalculationError,
  calculateDowncomerWeirOverflowHeight,
  calculateMaximumLiquidFlowByBackup,
  calculateTrayDowncomerBackup,
  createTrayDowncomerCsv,
} from '../../src/features/separation-processes/tray-downcomer-backup-residence/engine.ts'

const CALCULATOR_ID =
  'trayDowncomerBackupResidence'

const baseInput = {
  liquidVolumetricFlowRate:
    0.02,
  columnDiameter:
    1.5,
  downcomerAreaFraction:
    0.15,
  traySpacing:
    0.6,
  weirLength:
    1.2,
  weirHeight:
    0.05,
  trayPressureDrop:
    1000,
  liquidDensity:
    800,
  downcomerLossCoefficient:
    1.5,
  allowableBackupFraction:
    0.5,
  minimumResidenceTime:
    3,
}

test(
  `${CALCULATOR_ID} calculates column and downcomer areas`,
  () => {
    const result =
      calculateTrayDowncomerBackup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.grossColumnArea -
        1.7671458676442586,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result.downcomerArea -
        0.2650718801466388,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates weir overflow pressure head velocity head and backup height',
  () => {
    const overflow =
      calculateDowncomerWeirOverflowHeight(
        baseInput
          .liquidVolumetricFlowRate,
        baseInput.weirLength,
      )

    assert.ok(
      Math.abs(
        overflow -
        0.043453085264127576,
      ) <
        1e-12,
    )

    const result =
      calculateTrayDowncomerBackup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .pressureDropHead -
        0.12746452662224103,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .velocityHeadLoss -
        0.00043538479903902405,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .backupHeight -
        0.22135299668540762,
      ) <
        1e-12,
    )
  },
)

test(
  'calculates downcomer velocity residence time and hydraulic margins',
  () => {
    const result =
      calculateTrayDowncomerBackup(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .downcomerVelocity -
        0.07545123228060224,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .residenceTime -
        7.9521564043991635,
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .backupFraction -
        0.36892166114234604,
      ) <
        1e-12,
    )

    assert.equal(
      result
        .selectedScenario
        .status,
      'acceptable',
    )
  },
)

test(
  'solves maximum backup flow and identifies residence time as governing',
  () => {
    const result =
      calculateTrayDowncomerBackup(
        baseInput,
      )

    const maximumByBackup =
      calculateMaximumLiquidFlowByBackup({
        input:
          baseInput,
        downcomerArea:
          result.downcomerArea,
      })

    assert.ok(
      Math.abs(
        maximumByBackup -
        0.08561212469874022,
      ) <
        1e-10,
    )

    assert.ok(
      Math.abs(
        result
          .maximumLiquidFlowByResidence -
        0.05301437602932776,
      ) <
        1e-12,
    )

    assert.equal(
      result.governingConstraint,
      'residenceTime',
    )

    assert.ok(
      Math.abs(
        result
          .governingMaximumLiquidFlow -
        result
          .maximumLiquidFlowByResidence,
      ) <
        1e-12,
    )
  },
)

test(
  'detects marginal and short-residence operation at elevated liquid loads',
  () => {
    const result =
      calculateTrayDowncomerBackup(
        baseInput,
      )

    const marginal =
      result.scenarios.find(
        (
          scenario,
        ) =>
          scenario
            .liquidFlowMultiplier ===
          2.5,
      )

    const shortResidence =
      result.scenarios.find(
        (
          scenario,
        ) =>
          scenario
            .liquidFlowMultiplier ===
          3,
      )

    assert.ok(
      marginal,
    )

    assert.ok(
      shortResidence,
    )

    assert.equal(
      marginal.status,
      'marginal',
    )

    assert.equal(
      shortResidence.status,
      'shortResidence',
    )
  },
)

test(
  'rejects invalid geometry and unavailable hydraulic headroom',
  () => {
    assert.throws(
      () =>
        calculateTrayDowncomerBackup({
          ...baseInput,
          downcomerAreaFraction:
            0.5,
        }),
      (
        error,
      ) =>
        error instanceof
          TrayDowncomerCalculationError &&
        error.code ===
          'invalidDowncomerFraction',
    )

    assert.throws(
      () =>
        calculateTrayDowncomerBackup({
          ...baseInput,
          trayPressureDrop:
            2400,
          allowableBackupFraction:
            0.4,
        }),
      (
        error,
      ) =>
        error instanceof
          TrayDowncomerCalculationError &&
        error.code ===
          'noHydraulicHeadroom',
    )
  },
)

test(
  'exports downcomer capacity and liquid-load scenarios as CSV',
  () => {
    const result =
      calculateTrayDowncomerBackup(
        baseInput,
      )

    const csv =
      createTrayDowncomerCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Maximum liquid flow by backup, m3/s"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Minimum downcomer area fraction"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Residence time, s"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Liquid flow multiplier"',
      ),
    )
  },
)
