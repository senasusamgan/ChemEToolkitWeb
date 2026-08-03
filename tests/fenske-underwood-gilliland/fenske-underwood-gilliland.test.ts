import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ShortcutDistillationCalculationError,
  calculateFenskeMinimumStages,
  calculateShortcutDistillation,
  calculateUnderwoodResidual,
  calculateUnderwoodRoot,
  createShortcutDistillationCsv,
} from '../../src/features/separation-processes/fenske-underwood-gilliland-shortcut/engine.ts'

const CALCULATOR_ID =
  'fenskeUnderwoodGillilandShortcut'

const baseInput = {
  feedLightKeyMoleFraction:
    0.45,
  distillateLightKeyMoleFraction:
    0.95,
  bottomsLightKeyMoleFraction:
    0.05,
  relativeVolatility:
    2.4,
  feedQuality:
    1,
  refluxMultiplier:
    1.5,
  overallStageEfficiency:
    0.75,
}

test(
  `${CALCULATOR_ID} calculates the Fenske minimum stage count`,
  () => {
    const minimumStages =
      calculateFenskeMinimumStages(
        baseInput,
      )

    assert.ok(
      Math.abs(
        minimumStages -
        6.7265428302237105,
      ) <
        1e-12,
    )
  },
)

test(
  'solves the binary Underwood root between key volatilities',
  () => {
    const root =
      calculateUnderwoodRoot(
        baseInput,
      )

    assert.ok(
      root >
        1,
    )

    assert.ok(
      root <
        baseInput.relativeVolatility,
    )

    assert.ok(
      Math.abs(
        calculateUnderwoodResidual(
          root,
          baseInput,
        ),
      ) <
        1e-9,
    )
  },
)

test(
  'calculates minimum reflux and selected Gilliland stage estimate',
  () => {
    const result =
      calculateShortcutDistillation(
        baseInput,
      )

    assert.ok(
      Math.abs(
        result.minimumRefluxRatio -
        1.3520923520923516,
      ) <
        1e-10,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .operatingRefluxRatio -
        2.0281385281385274,
      ) <
        1e-10,
    )

    assert.ok(
      Math.abs(
        result
          .selectedScenario
          .theoreticalStageCount -
        12.819722765368303,
      ) <
        1e-9,
    )

    assert.equal(
      result
        .selectedScenario
        .requiredIntegerActualStages,
      18,
    )
  },
)

test(
  'creates low selected and high reflux scenarios',
  () => {
    const result =
      calculateShortcutDistillation(
        baseInput,
      )

    assert.deepEqual(
      result.scenarios.map(
        (
          scenario,
        ) =>
          scenario.refluxMultiplier,
      ),
      [
        1.2,
        1.5,
        2,
      ],
    )

    assert.ok(
      result.scenarios[2]
        .theoreticalStageCount <
      result.scenarios[0]
        .theoreticalStageCount,
    )
  },
)

test(
  'supports saturated-vapor feed quality',
  () => {
    const result =
      calculateShortcutDistillation({
        ...baseInput,
        feedQuality:
          0,
      })

    assert.ok(
      result.minimumRefluxRatio >
      0,
    )

    assert.ok(
      result.underwoodRoot >
      1,
    )
  },
)

test(
  'rejects invalid composition ordering and reflux selection',
  () => {
    assert.throws(
      () =>
        calculateShortcutDistillation({
          ...baseInput,
          feedLightKeyMoleFraction:
            0.97,
        }),
      (
        error,
      ) =>
        error instanceof
          ShortcutDistillationCalculationError &&
        error.code ===
          'invalidSeparationOrder',
    )

    assert.throws(
      () =>
        calculateShortcutDistillation({
          ...baseInput,
          refluxMultiplier:
            1,
        }),
      (
        error,
      ) =>
        error instanceof
          ShortcutDistillationCalculationError &&
        error.code ===
          'invalidRefluxMultiplier',
    )
  },
)

test(
  'exports shortcut design and reflux scenarios as CSV',
  () => {
    const result =
      calculateShortcutDistillation(
        baseInput,
      )

    const csv =
      createShortcutDistillationCsv(
        baseInput,
        result,
      )

    assert.ok(
      csv.includes(
        '"Fenske minimum stages"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Underwood root"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Reflux multiplier"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Rounded actual stages"',
      ),
    )
  },
)
