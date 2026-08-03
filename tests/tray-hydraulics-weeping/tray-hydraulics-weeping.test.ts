import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrayHydraulicsCalculationError,
  calculateTrayHydraulics,
  calculateWeirOverflowHeight,
  createTrayHydraulicsCsv,
} from '../../src/features/separation-processes/tray-hydraulics-weeping-check/engine.ts'

const CALCULATOR_ID =
  'trayHydraulicsWeepingCheck'

const baseInput = {
  vaporVolumetricFlowRate: 1.5,
  liquidVolumetricFlowRate: 0.01,
  columnDiameter: 1.5,
  activeAreaFraction: 0.8,
  holeAreaFraction: 0.05,
  dischargeCoefficient: 0.65,
  vaporDensity: 2,
  liquidDensity: 800,
  weirLength: 1.2,
  weirHeight: 0.05,
  capacityFactor: 0.11,
}

test(
  `${CALCULATOR_ID} calculates tray gross active and hole areas`,
  () => {
    const result =
      calculateTrayHydraulics(baseInput)

    assert.ok(
      Math.abs(
        result.grossColumnArea -
        1.7671458676442586,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.activeTrayArea -
        1.413716694115407,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result.holeArea -
        0.07068583470577035,
      ) < 1e-12,
    )
  },
)

test(
  'calculates Francis weir overflow and clear liquid head',
  () => {
    const overflow =
      calculateWeirOverflowHeight(
        baseInput.liquidVolumetricFlowRate,
        baseInput.weirLength,
      )

    assert.ok(
      Math.abs(
        overflow -
        0.027373728403575527,
      ) < 1e-12,
    )

    const result =
      calculateTrayHydraulics(baseInput)

    assert.ok(
      Math.abs(
        result.clearLiquidHead -
        0.07737372840357554,
      ) < 1e-12,
    )
  },
)

test(
  'calculates dry liquid-head and total tray pressure drop',
  () => {
    const result =
      calculateTrayHydraulics(baseInput)

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .dryTrayPressureDrop -
        1065.8375662573337,
      ) < 1e-9,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .liquidHeadPressureDrop -
        607.0216589191392,
      ) < 1e-9,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .totalTrayPressureDrop -
        1672.859225176473,
      ) < 1e-9,
    )
  },
)

test(
  'calculates weeping and flooding operating margins',
  () => {
    const result =
      calculateTrayHydraulics(baseInput)

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .weepingVelocityRatio -
        1.325084024251117,
      ) < 1e-12,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .floodFraction -
        0.48289169869389575,
      ) < 1e-12,
    )

    assert.equal(
      result.selectedScenario.status,
      'stable',
    )
  },
)

test(
  'detects weeping and marginal operation at reduced vapor loads',
  () => {
    const result =
      calculateTrayHydraulics(baseInput)

    const lowLoad =
      result.scenarios.find(
        (scenario) =>
          scenario.vaporFlowMultiplier ===
          0.6,
      )

    const mediumLoad =
      result.scenarios.find(
        (scenario) =>
          scenario.vaporFlowMultiplier ===
          0.8,
      )

    assert.ok(lowLoad)
    assert.ok(mediumLoad)

    assert.equal(
      lowLoad.status,
      'weepingRisk',
    )

    assert.equal(
      mediumLoad.status,
      'marginal',
    )
  },
)

test(
  'rejects invalid tray geometry and densities',
  () => {
    assert.throws(
      () =>
        calculateTrayHydraulics({
          ...baseInput,
          holeAreaFraction: 0.5,
        }),
      (error) =>
        error instanceof
          TrayHydraulicsCalculationError &&
        error.code ===
          'invalidAreaFraction',
    )

    assert.throws(
      () =>
        calculateTrayHydraulics({
          ...baseInput,
          liquidDensity: 1,
        }),
      (error) =>
        error instanceof
          TrayHydraulicsCalculationError &&
        error.code ===
          'invalidDensityOrder',
    )
  },
)

test(
  'exports pressure-drop and operating-window scenarios as CSV',
  () => {
    const result =
      calculateTrayHydraulics(baseInput)

    const csv =
      createTrayHydraulicsCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Dry tray pressure drop, Pa"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Weeping velocity ratio"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Flood fraction"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Vapor flow multiplier"',
      ),
    )
  },
)
