import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError,
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
  createPartiallyFullCircularChannelMaximumDischargeSpecificEnergyCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts'

import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelMaximumDischargeSpecificEnergy'


const gravitationalAcceleration =
  9.80665


const exampleInput = {
  pipeDiameter:
    1.2,

  targetSpecificEnergy:
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


function flowAreaAtDepth(
  pipeDiameter: number,
  flowDepth: number,
): number {
  const radius =
    pipeDiameter /
    2

  const theta =
    2 *
    Math.acos(
      (
        radius -
        flowDepth
      ) /
      radius,
    )

  return (
    radius *
    radius /
    2 *
    (
      theta -
      Math.sin(theta)
    )
  )
}


function dischargeAtDepthForEnergy(
  pipeDiameter: number,
  specificEnergy: number,
  flowDepth: number,
): number {
  const area =
    flowAreaAtDepth(
      pipeDiameter,
      flowDepth,
    )

  return (
    area *
    Math.sqrt(
      2 *
      gravitationalAcceleration *
      (
        specificEnergy -
        flowDepth
      ),
    )
  )
}


test(
  'exposes Calculator 470 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelMaximumDischargeSpecificEnergy',
    )
  },
)


test(
  'solves reference maximum-discharge critical control',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.criticalDepth,
      0.5761334844304096,
      3e-9,
    )

    closeTo(
      result.maximumDischarge,
      1.1249324199689403,
      3e-9,
    )

    closeTo(
      result.flowArea,
      0.5368544133225261,
      3e-9,
    )

    closeTo(
      result.topWidth,
      1.199050273232222,
      3e-9,
    )

    closeTo(
      result.hydraulicRadius,
      0.292211790549577,
      3e-9,
    )

    closeTo(
      result.hydraulicDepth,
      0.4477330311391812,
      3e-9,
    )

    closeTo(
      result.meanVelocity,
      2.0954143098253986,
      3e-9,
    )
  },
)


test(
  'satisfies critical-flow and specific-energy closure',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.froudeNumber,
      1,
      1e-10,
    )

    closeTo(
      result.velocityHead,
      0.2238665155695906,
      3e-9,
    )

    closeTo(
      result.calculatedSpecificEnergy,
      exampleInput.targetSpecificEnergy,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.energyResidual,
      ) <
        1e-10,
    )

    assert.ok(
      Math.abs(
        result.criticalRelationResidual,
      ) <
        1e-10,
    )
  },
)


test(
  'agrees with Calculator 457 critical depth at calculated maximum discharge',
  () => {
    const capacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    const critical =
      calculatePartiallyFullCircularChannelCriticalDepth({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          capacity.maximumDischarge,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    closeTo(
      critical.criticalDepth,
      capacity.criticalDepth,
      3e-8,
    )
  },
)


test(
  'critical solution is a local maximum of discharge at fixed energy',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    const lowerDepth =
      result.criticalDepth *
      0.98

    const upperDepth =
      Math.min(
        result.criticalDepth *
        1.02,
        exampleInput.targetSpecificEnergy *
        0.999,
      )

    const lowerDischarge =
      dischargeAtDepthForEnergy(
        exampleInput.pipeDiameter,
        exampleInput.targetSpecificEnergy,
        lowerDepth,
      )

    const upperDischarge =
      dischargeAtDepthForEnergy(
        exampleInput.pipeDiameter,
        exampleInput.targetSpecificEnergy,
        upperDepth,
      )

    assert.ok(
      result.maximumDischarge >
        lowerDischarge,
    )

    assert.ok(
      result.maximumDischarge >
        upperDischarge,
    )
  },
)


test(
  'reports density-dependent mass flow and hydraulic power',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.massFlowRate,
      1122.6825551290024,
      3e-7,
    )

    closeTo(
      result.hydraulicPower,
      8807.803903404665,
      3e-6,
    )
  },
)


test(
  'density does not change hydraulic capacity or critical depth',
  () => {
    const first =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    const second =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
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
      first.criticalDepth,
      second.criticalDepth,
      1e-12,
    )

    closeTo(
      second.massFlowRate /
      first.massFlowRate,
      1200 /
      998,
      1e-12,
    )
  },
)


test(
  'partitions specific energy into depth and velocity-head fractions',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.depthEnergyFraction +
      result.velocityEnergyFraction,
      1,
      1e-10,
    )

    closeTo(
      result.depthRatio,
      0.4801112370253413,
      3e-9,
    )

    closeTo(
      result.crownClearance,
      0.6238665155695904,
      3e-9,
    )
  },
)


test(
  'higher available specific energy increases maximum discharge',
  () => {
    const low =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        ...exampleInput,

        targetSpecificEnergy:
          0.5,
      })

    const high =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        ...exampleInput,

        targetSpecificEnergy:
          1.0,
      })

    assert.ok(
      high.maximumDischarge >
        low.maximumDischarge,
    )

    assert.ok(
      high.criticalDepth >
        low.criticalDepth,
    )
  },
)


test(
  'rejects invalid specific energy',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
          ...exampleInput,

          targetSpecificEnergy:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError &&
        error.code ===
          'INVALID_SPECIFIC_ENERGY',
    )
  },
)


test(
  'rejects invalid density',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
          ...exampleInput,

          fluidDensity:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError &&
        error.code ===
          'INVALID_DENSITY',
    )
  },
)


test(
  'exports capacity and critical-control diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelMaximumDischargeSpecificEnergyCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Maximum Discharge for Specified Specific Energy/,
    )

    assert.match(
      csv,
      /Critical Depth/,
    )

    assert.match(
      csv,
      /Critical Relation Residual/,
    )

    assert.match(
      csv,
      /Hydraulic Power/,
    )
  },
)
