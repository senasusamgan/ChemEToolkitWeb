import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelCapacityChokingMarginError,
  calculatePartiallyFullCircularChannelCapacityChokingMargin,
  createPartiallyFullCircularChannelCapacityChokingMarginCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/engine.ts'

import {
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts'

import {
  calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-minimum-required-specific-energy/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelCapacityChokingMargin'


const exampleInput = {
  pipeDiameter:
    1.2,

  actualDischarge:
    0.9,

  availableSpecificEnergy:
    0.8,

  fluidDensity:
    998,
}


function closeTo(
  actual: number,
  expected: number,
  tolerance: number,
) {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <=
      tolerance,
    `Expected ${actual} within ${tolerance} of ${expected}`,
  )
}


test(
  'exposes Calculator 473 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelCapacityChokingMargin',
    )
  },
)


test(
  'solves reference capacity and choking margin',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    closeTo(
      result.maximumDischarge,
      1.1249324199689403,
      3e-9,
    )

    closeTo(
      result.minimumRequiredSpecificEnergy,
      0.7069445373662944,
      3e-8,
    )

    closeTo(
      result.dischargeMargin,
      0.2249324199689403,
      3e-9,
    )

    closeTo(
      result.specificEnergyMargin,
      0.09305546263370568,
      3e-8,
    )

    assert.equal(
      result.capacityState,
      'Adequate capacity margin',
    )

    assert.equal(
      result.isChoked,
      false,
    )
  },
)


test(
  'reports reference utilization and reserve percentages',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    closeTo(
      result.dischargeUtilization,
      0.8000480597979825,
      3e-9,
    )

    closeTo(
      result.dischargeReservePercent,
      19.995194020201744,
      3e-8,
    )

    closeTo(
      result.chokingMarginIndex,
      0.1999519402020175,
      3e-9,
    )

    closeTo(
      result.specificEnergyReservePercent,
      11.63193282921321,
      3e-8,
    )

    closeTo(
      result.energyAdequacyRatio,
      1.1316304995868298,
      3e-8,
    )
  },
)


test(
  'matches Calculator 470 available-energy capacity',
  () => {
    const margin =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    const capacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          exampleInput.pipeDiameter,

        targetSpecificEnergy:
          exampleInput.availableSpecificEnergy,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    closeTo(
      margin.maximumDischarge,
      capacity.maximumDischarge,
      1e-12,
    )

    closeTo(
      margin.capacityCriticalDepth,
      capacity.criticalDepth,
      1e-12,
    )
  },
)


test(
  'matches Calculator 472 minimum energy for actual discharge',
  () => {
    const margin =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    const energy =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        pipeDiameter:
          exampleInput.pipeDiameter,

        requiredDischarge:
          exampleInput.actualDischarge,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    closeTo(
      margin.minimumRequiredSpecificEnergy,
      energy.minimumSpecificEnergy,
      1e-12,
    )

    closeTo(
      margin.actualCriticalDepth,
      energy.criticalDepth,
      1e-12,
    )
  },
)


test(
  'closes both inverse relations',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    assert.ok(
      Math.abs(
        result.inverseDischargeResidual,
      ) <
        1e-7,
    )

    assert.ok(
      Math.abs(
        result.inverseEnergyResidual,
      ) <
        1e-7,
    )
  },
)


test(
  'identifies exact critical choking boundary',
  () => {
    const energy =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        pipeDiameter:
          exampleInput.pipeDiameter,

        requiredDischarge:
          exampleInput.actualDischarge,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        availableSpecificEnergy:
          energy.minimumSpecificEnergy,
      })

    assert.equal(
      result.capacityState,
      'At choking limit',
    )

    assert.equal(
      result.isAtChokingLimit,
      true,
    )

    assert.equal(
      result.isChoked,
      false,
    )

    assert.ok(
      Math.abs(
        result.dischargeMargin,
      ) <
        1e-7,
    )

    assert.ok(
      Math.abs(
        result.specificEnergyMargin,
      ) <
        1e-10,
    )
  },
)


test(
  'identifies insufficient-energy choking risk',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        availableSpecificEnergy:
          0.65,
      })

    assert.equal(
      result.capacityState,
      'Insufficient energy — choking risk',
    )

    assert.equal(
      result.isChoked,
      true,
    )

    assert.ok(
      result.maximumDischarge <
        exampleInput.actualDischarge,
    )

    assert.ok(
      result.dischargeMargin <
        0,
    )

    assert.ok(
      result.dischargeOverload >
        0,
    )

    assert.ok(
      result.specificEnergyMargin <
        0,
    )

    assert.ok(
      result.specificEnergyDeficit >
        0,
    )
  },
)


test(
  'reports hydraulic power reserve consistently',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    closeTo(
      result.actualMassFlowRate,
      898.2,
      1e-10,
    )

    closeTo(
      result.availableHydraulicPower,
      7046.666424,
      2e-6,
    )

    closeTo(
      result.minimumRequiredHydraulicPower,
      6227.0029188616,
      2e-5,
    )

    closeTo(
      result.hydraulicPowerMargin,
      819.6635051384005,
      2e-5,
    )
  },
)


test(
  'density does not alter hydraulic capacity margins',
  () => {
    const first =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    const second =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        fluidDensity:
          1200,
      })

    closeTo(
      first.maximumDischarge,
      second.maximumDischarge,
      1e-12,
    )

    closeTo(
      first.minimumRequiredSpecificEnergy,
      second.minimumRequiredSpecificEnergy,
      1e-12,
    )

    closeTo(
      first.dischargeMargin,
      second.dischargeMargin,
      1e-12,
    )

    closeTo(
      first.specificEnergyMargin,
      second.specificEnergyMargin,
      1e-12,
    )
  },
)


test(
  'greater available energy increases discharge reserve',
  () => {
    const lower =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        availableSpecificEnergy:
          0.75,
      })

    const higher =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        availableSpecificEnergy:
          0.9,
      })

    assert.ok(
      higher.maximumDischarge >
        lower.maximumDischarge,
    )

    assert.ok(
      higher.dischargeMargin >
        lower.dischargeMargin,
    )

    assert.ok(
      higher.specificEnergyMargin >
        lower.specificEnergyMargin,
    )
  },
)


test(
  'greater actual discharge consumes capacity margin',
  () => {
    const lower =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        actualDischarge:
          0.7,
      })

    const higher =
      calculatePartiallyFullCircularChannelCapacityChokingMargin({
        ...exampleInput,

        actualDischarge:
          1.0,
      })

    assert.ok(
      higher.dischargeMargin <
        lower.dischargeMargin,
    )

    assert.ok(
      higher.dischargeUtilization >
        lower.dischargeUtilization,
    )

    assert.ok(
      higher.minimumRequiredSpecificEnergy >
        lower.minimumRequiredSpecificEnergy,
    )
  },
)


test(
  'rejects invalid actual discharge',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelCapacityChokingMargin({
          ...exampleInput,

          actualDischarge:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelCapacityChokingMarginError &&
        error.code ===
          'INVALID_DISCHARGE',
    )
  },
)


test(
  'rejects invalid available specific energy',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelCapacityChokingMargin({
          ...exampleInput,

          availableSpecificEnergy:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelCapacityChokingMarginError &&
        error.code ===
          'INVALID_SPECIFIC_ENERGY',
    )
  },
)


test(
  'exports complete margin analysis as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCapacityChokingMargin(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelCapacityChokingMarginCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Capacity & Choking Margin/,
    )

    assert.match(
      csv,
      /Discharge Margin/,
    )

    assert.match(
      csv,
      /Specific Energy Margin/,
    )

    assert.match(
      csv,
      /Hydraulic Power Margin/,
    )

    assert.match(
      csv,
      /Inverse Discharge Residual/,
    )
  },
)
