import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError,
  calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy,
  createPartiallyFullCircularChannelMinimumRequiredSpecificEnergyCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-minimum-required-specific-energy/engine.ts'

import {
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelMinimumRequiredSpecificEnergy'


const gravitationalAcceleration =
  9.80665


const exampleInput = {
  pipeDiameter:
    1.2,

  requiredDischarge:
    1.0,

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
    ) <= tolerance,
    `Expected ${actual} within ${tolerance} of ${expected}`,
  )
}


function specificEnergyAtDepth(
  pipeDiameter: number,
  discharge: number,
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

  const area =
    radius *
    radius /
    2 *
    (
      theta -
      Math.sin(theta)
    )

  const velocity =
    discharge /
    area

  return (
    flowDepth +
    velocity *
    velocity /
    (
      2 *
      gravitationalAcceleration
    )
  )
}


test(
  'exposes Calculator 472 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelMinimumRequiredSpecificEnergy',
    )
  },
)


test(
  'solves reference minimum specific energy',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.criticalDepth,
      0.5417357565733179,
      3e-8,
    )

    closeTo(
      result.minimumSpecificEnergy,
      0.7492496568478961,
      3e-8,
    )

    closeTo(
      result.flowArea,
      0.49567962532745313,
      3e-8,
    )

    closeTo(
      result.topWidth,
      1.194328728513078,
      3e-8,
    )

    closeTo(
      result.hydraulicRadius,
      0.28032322126345016,
      3e-8,
    )

    closeTo(
      result.hydraulicDepth,
      0.4150278005491563,
      3e-8,
    )

    closeTo(
      result.meanVelocity,
      2.0174321253155916,
      3e-8,
    )
  },
)


test(
  'satisfies critical-flow and energy closure',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.froudeNumber,
      1,
      1e-8,
    )

    closeTo(
      result.velocityHead,
      0.20751390027457822,
      3e-8,
    )

    closeTo(
      result.criticalGeometrySpecificEnergy,
      result.minimumSpecificEnergy,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.specificEnergyClosureResidual,
      ) <
        1e-8,
    )

    assert.ok(
      Math.abs(
        result.criticalRelationResidual,
      ) <
        1e-8,
    )
  },
)


test(
  'is the energy inverse of Calculator 470',
  () => {
    const energy =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    const capacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          exampleInput.pipeDiameter,

        targetSpecificEnergy:
          energy.minimumSpecificEnergy,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    closeTo(
      capacity.maximumDischarge,
      exampleInput.requiredDischarge,
      5e-8,
    )

    closeTo(
      capacity.criticalDepth,
      energy.criticalDepth,
      5e-8,
    )
  },
)


test(
  'critical depth is a local minimum of specific energy',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    const lowerDepth =
      result.criticalDepth *
      0.98

    const upperDepth =
      result.criticalDepth *
      1.02

    const lowerEnergy =
      specificEnergyAtDepth(
        exampleInput.pipeDiameter,
        exampleInput.requiredDischarge,
        lowerDepth,
      )

    const upperEnergy =
      specificEnergyAtDepth(
        exampleInput.pipeDiameter,
        exampleInput.requiredDischarge,
        upperDepth,
      )

    assert.ok(
      result.minimumSpecificEnergy <
        lowerEnergy,
    )

    assert.ok(
      result.minimumSpecificEnergy <
        upperEnergy,
    )
  },
)


test(
  'energy below minimum cannot carry required discharge at critical capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    const lowerEnergyCapacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          exampleInput.pipeDiameter,

        targetSpecificEnergy:
          result.minimumSpecificEnergy *
          0.99,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    assert.ok(
      lowerEnergyCapacity.maximumDischarge <
        exampleInput.requiredDischarge,
    )
  },
)


test(
  'energy above minimum provides spare critical-flow capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    const higherEnergyCapacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          exampleInput.pipeDiameter,

        targetSpecificEnergy:
          result.minimumSpecificEnergy *
          1.01,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    assert.ok(
      higherEnergyCapacity.maximumDischarge >
        exampleInput.requiredDischarge,
    )
  },
)


test(
  'reports mass flow and minimum hydraulic power',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.massFlowRate,
      998,
      1e-10,
    )

    closeTo(
      result.hydraulicPower,
      7332.9338890327645,
      5e-6,
    )
  },
)


test(
  'density does not change hydraulic minimum energy',
  () => {
    const first =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    const second =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        ...exampleInput,

        fluidDensity:
          1200,
      })

    closeTo(
      first.minimumSpecificEnergy,
      second.minimumSpecificEnergy,
      1e-10,
    )

    closeTo(
      first.criticalDepth,
      second.criticalDepth,
      1e-10,
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
  'higher discharge requires greater minimum specific energy',
  () => {
    const lower =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        ...exampleInput,

        requiredDischarge:
          0.7,
      })

    const higher =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        ...exampleInput,

        requiredDischarge:
          1.2,
      })

    assert.ok(
      higher.minimumSpecificEnergy >
        lower.minimumSpecificEnergy,
    )

    assert.ok(
      higher.criticalDepth >
        lower.criticalDepth,
    )
  },
)


test(
  'partitions minimum energy into depth and velocity components',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.depthEnergyFraction +
      result.velocityEnergyFraction,
      1,
      1e-10,
    )

    closeTo(
      result.criticalDepthRatio,
      0.4514464638110982,
      3e-8,
    )

    closeTo(
      result.crownClearance,
      0.6582642434266821,
      3e-8,
    )

    closeTo(
      result.centralAngleDegrees,
      168.85478599718593,
      3e-7,
    )
  },
)


test(
  'rejects invalid required discharge',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
          ...exampleInput,

          requiredDischarge:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError &&
        error.code ===
          'INVALID_REQUIRED_DISCHARGE',
    )
  },
)


test(
  'rejects invalid diameter',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
          ...exampleInput,

          pipeDiameter:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError &&
        error.code ===
          'INVALID_DIAMETER',
    )
  },
)


test(
  'exports minimum-energy diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelMinimumRequiredSpecificEnergyCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Minimum Specific Energy for Required Discharge/,
    )

    assert.match(
      csv,
      /Critical Depth/,
    )

    assert.match(
      csv,
      /Specific Energy Closure Residual/,
    )

    assert.match(
      csv,
      /Hydraulic Power/,
    )
  },
)
